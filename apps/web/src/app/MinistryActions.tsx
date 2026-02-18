import React from "react";
import useGameClock from "@/hooks/useGameClock";
import { useEffect, useState } from 'react';

export default function MinistryActions() {
  const { time, setSpeed, getSpeed } = useGameClock();
  const [fastSession, setFastSession] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/game/fast/session');
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setFastSession(json);
      } catch (e) {
        console.error(e);
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Handlers will call the API endpoints; UI-only here for now
  const doAction = async (action: string, duration?: string) => {
    try {
      const body: any = { action };
      if (duration) body.duration = duration;
      // for fast_complete, include elapsed game minutes using the game clock
      if (action === 'fast_complete') {
        // compute elapsed minutes by comparing start times is handled server-side; client can send an approximation
        // We'll send total minutes = day*24*60 + hour*60 + minute; but server expects elapsed since start, so client must cache start; keep simple: send current day-minutes
        body.gameElapsedMinutes = time.day * 24 * 60 + time.hour * 60 + Math.floor(time.minute);
      }

      const res = await fetch(`/api/game/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      // TODO: show toast or update state
      console.log("Action result:", data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Clock</h3>
          <div className="text-sm text-gray-600">Day {time.day} — {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}</div>
        </div>
        <div>
          {/* Time controller */}
          <div className="space-x-2">
            <button onClick={() => setSpeed(1)} className={`px-2 py-1 rounded ${getSpeed() === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Play</button>
            <button onClick={() => setSpeed(2)} className={`px-2 py-1 rounded ${getSpeed() === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Fast</button>
            <button onClick={() => setSpeed(3)} className={`px-2 py-1 rounded ${getSpeed() === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Ultra</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg">
          <h4 className="font-medium">Actions</h4>
          <div className="mt-2 space-y-2">
            <button onClick={() => doAction('nap')} className="px-3 py-2 bg-green-500 text-white rounded">Take a Nap (+20 Energy)</button>
            <button onClick={() => doAction('private_worship')} className="px-3 py-2 bg-purple-500 text-white rounded">Private Worship (+15 Anointing)</button>
            <button onClick={() => doAction('read_word')} className="px-3 py-2 bg-yellow-500 text-white rounded">Read the Word (+10 Energy/Anointing)</button>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg">
          <h4 className="font-medium">Fasting</h4>
          <div className="mt-2 space-y-2">
            <button onClick={() => doAction('fast_start', 'partial')} className="px-3 py-2 bg-gray-800 text-white rounded">Partial Fast (6 hours)</button>
            <button onClick={() => doAction('fast_start', 'daily')} className="px-3 py-2 bg-gray-700 text-white rounded">Daily Fast (24 hours)</button>
            <button onClick={() => doAction('fast_start', 'esther')} className="px-3 py-2 bg-gray-600 text-white rounded">Esther Fast (3 days)</button>
            <div className="pt-2">
              <button onClick={() => doAction('fast_complete')} className="px-3 py-2 bg-blue-600 text-white rounded">Complete Fast (claim boost)</button>
            </div>
            {fastSession && fastSession.start_ts && (
              <div className="mt-3 text-sm text-gray-600">
                Active fast started at: {new Date(fastSession.start_ts).toLocaleString()} — required minutes: {fastSession.required_game_minutes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
