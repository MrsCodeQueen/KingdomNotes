import React from "react";

export default function TimeController({ getSpeed, setSpeed }: { getSpeed: () => number; setSpeed: (s: 1 | 2 | 3) => void; }) {
  const speed = getSpeed();

  const postSpeed = async (s: 1 | 2 | 3) => {
    try {
      await fetch('/api/game/time/speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed: s }),
      });
    } catch (e) {
      console.error('Failed to post speed', e);
    }
    setSpeed(s);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => postSpeed(1)}
        className={`px-3 py-1 rounded ${speed === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
      >
        Play (1x)
      </button>
      <button
        onClick={() => postSpeed(2)}
        className={`px-3 py-1 rounded ${speed === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
      >
        Fast (2x)
      </button>
      <button
        onClick={() => postSpeed(3)}
        className={`px-3 py-1 rounded ${speed === 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
      >
        Ultra (3x)
      </button>
    </div>
  );
}
