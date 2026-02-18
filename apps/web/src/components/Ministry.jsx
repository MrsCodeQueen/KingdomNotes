import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Zap, Users, AlertCircle } from "lucide-react";

export default function Ministry() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState(null);
  const [restoreMode, setRestoreMode] = useState("nap");
  const [fastDuration, setFastDuration] = useState("short");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/game/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
  });

  const worshipMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/game/worship", {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to lead worship");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["stats"]);
      setMessage({
        type: "success",
        text: `Great worship session! +${data.gains.anointing} Anointing, +${data.gains.followers} Followers`,
      });
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: error.message,
      });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ action, duration }) => {
      const response = await fetch("/api/game/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, duration }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to apply action");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["stats"]);
      setMessage({
        type: "success",
        text: `Action complete! +${data.gains.energy} Energy${data.gains.anointing ? `, +${data.gains.anointing} Anointing` : ""}${data.gains.charisma ? `, +${data.gains.charisma} Charisma` : ""}`,
      });
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: error.message });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const canWorship = stats?.energy >= 20;
  const energyPercentage = ((stats?.energy || 0) / 100) * 100;

  return (
    <div className="font-inter">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
          Ministry Actions
        </h1>
        <p className="text-[#475569] dark:text-white dark:text-opacity-70">
          Lead worship to grow your anointing and followers.
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Energy Display */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Zap size={20} className="text-yellow-800 dark:text-yellow-300" />
            </div>
            <h2 className="text-lg font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87">
              Energy
            </h2>
          </div>
          <span className="text-2xl font-bold text-[#1F2937] dark:text-white dark:text-opacity-87">
            {stats?.energy || 0}/100
          </span>
        </div>
        <div className="w-full bg-[#E5E9F0] dark:bg-[#404040] rounded-full h-3">
          <div
            className="bg-gradient-to-r from-yellow-500 to-orange-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${energyPercentage}%` }}
          />
        </div>
        <p className="text-sm text-[#475569] dark:text-white dark:text-opacity-70 mt-2">
          Each worship session costs 20 energy
        </p>
      </div>

      {/* Lead Worship Button */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
            Lead Worship
          </h2>
          <p className="text-[#475569] dark:text-white dark:text-opacity-70">
            Inspire your followers and grow your anointing
          </p>
        </div>

        <button
          onClick={() => worshipMutation.mutate()}
          disabled={!canWorship || worshipMutation.isPending || isLoading}
          className={`px-8 py-4 rounded-lg font-medium text-white transition-all duration-150 ${
            canWorship && !worshipMutation.isPending
              ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl"
              : "bg-[#94A3B8] dark:bg-[#4A4A4A] cursor-not-allowed"
          }`}
        >
          {worshipMutation.isPending
            ? "Leading Worship..."
            : canWorship
              ? "Lead Worship (-20 Energy)"
              : "Not Enough Energy"}
        </button>

        {!canWorship && (
          <p className="text-sm text-[#475569] dark:text-white dark:text-opacity-70 mt-4">
            You need at least 20 energy to lead worship. Energy regenerates over
            time.
          </p>
        )}

        {/* Expected Gains */}
        <div className="mt-8 pt-6 border-t border-[#E5E9F0] dark:border-[#404040]">
          <p className="text-sm text-[#475569] dark:text-white dark:text-opacity-70 mb-3">
            Expected gains per session:
          </p>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                +2-4
              </div>
              <div className="text-xs text-[#475569] dark:text-white dark:text-opacity-70">
                Anointing
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-pink-600 dark:text-pink-400">
                +3-7
              </div>
              <div className="text-xs text-[#475569] dark:text-white dark:text-opacity-70">
                Followers
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Options */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-6">
          <h3 className="text-lg font-semibold mb-3">Restore Energy</h3>

          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="restore"
                value="nap"
                checked={restoreMode === "nap"}
                onChange={() => setRestoreMode("nap")}
              />
              <span>Take a Nap (+30 Energy)</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="restore"
                value="private_worship"
                checked={restoreMode === "private_worship"}
                onChange={() => setRestoreMode("private_worship")}
              />
              <span>Private Worship (+20 Energy, +1 Anointing)</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="restore"
                value="read_word"
                checked={restoreMode === "read_word"}
                onChange={() => setRestoreMode("read_word")}
              />
              <span>Read Your Word (+10 Energy, +1 Charisma)</span>
            </label>

            <div className="pt-2">
              <label className="flex items-center space-x-3 mb-2">
                <input
                  type="radio"
                  name="restore"
                  value="fast"
                  checked={restoreMode === "fast"}
                  onChange={() => setRestoreMode("fast")}
                />
                <span>Fast</span>
              </label>

              {restoreMode === "fast" && (
                <select
                  value={fastDuration}
                  onChange={(e) => setFastDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F9FC] dark:bg-[#262626] border border-[#E5E9F0] dark:border-[#404040] rounded-lg"
                >
                  <option value="short">Short (few mins) +5 Energy</option>
                  <option value="half_day">Half Day +15 Energy</option>
                  <option value="1_day">1 Day +30 Energy</option>
                  <option value="3_days">3 Days +60 Energy</option>
                  <option value="7_days">7 Days +100 Energy</option>
                </select>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={() => restoreMutation.mutate({ action: restoreMode, duration: fastDuration })}
                disabled={restoreMutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-150"
              >
                {restoreMutation.isPending ? "Applying..." : "Do Action"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-6">
          <h3 className="text-lg font-semibold mb-3">Events & Unlocks</h3>
          <p className="text-sm text-[#475569] dark:text-white dark:text-opacity-70 mb-4">
            As you grow your followers, new options like Worship Conferences will unlock.
          </p>
          <button
            onClick={() => restoreMutation.mutate({ action: "worship_conference" })}
            disabled={restoreMutation.isPending}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-150"
          >
            {restoreMutation.isPending ? "Applying..." : "Attend Worship Conference"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
