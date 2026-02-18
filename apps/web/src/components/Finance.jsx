import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Music, RefreshCw } from "lucide-react";

export default function Finance() {
  const queryClient = useQueryClient();

  const { data: royalties, isLoading } = useQuery({
    queryKey: ["royalties"],
    queryFn: async () => {
      const response = await fetch("/api/game/royalties");
      if (!response.ok) {
        throw new Error("Failed to fetch royalties");
      }
      return response.json();
    },
  });

  const generateStreamsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/game/royalties", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to generate streams");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["royalties"]);
      queryClient.invalidateQueries(["songs"]);
    },
  });

  return (
    <div className="font-inter">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
            Finance Dashboard
          </h1>
          <p className="text-[#475569] dark:text-white dark:text-opacity-70">
            Track your streaming royalties and revenue.
          </p>
        </div>
        <button
          onClick={() => generateStreamsMutation.mutate()}
          disabled={
            generateStreamsMutation.isPending ||
            royalties?.songRoyalties?.length === 0
          }
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:bg-[#94A3B8] dark:disabled:bg-[#4A4A4A] disabled:cursor-not-allowed transition-all duration-150 flex items-center space-x-2"
        >
          <RefreshCw
            size={16}
            className={generateStreamsMutation.isPending ? "animate-spin" : ""}
          />
          <span className="font-medium">
            {generateStreamsMutation.isPending
              ? "Generating..."
              : "Simulate Streams"}
          </span>
        </button>
      </div>

      {/* Total Royalties Card */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-8 mb-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <DollarSign size={24} />
          </div>
          <h2 className="text-lg font-medium">Total Royalties Earned</h2>
        </div>
        <div className="text-5xl font-bold mb-2">
          ${royalties?.totalRoyalties || "0.00"}
        </div>
        <p className="text-green-100">
          From {royalties?.songRoyalties?.length || 0} songs
        </p>
      </div>

      {/* Royalty Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Royalty Rate:</strong> ${royalties?.royaltyPerStream || 0.003}{" "}
          per stream
        </p>
      </div>

      {/* Songs Royalties Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-[#475569] dark:text-white dark:text-opacity-70">
            Loading royalties...
          </div>
        </div>
      ) : royalties?.songRoyalties?.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-16 text-center">
          <Music
            size={48}
            className="mx-auto text-[#94A3B8] dark:text-white dark:text-opacity-50 mb-4"
          />
          <h3 className="text-lg font-medium text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
            No royalties yet
          </h3>
          <p className="text-[#475569] dark:text-white dark:text-opacity-70">
            Write some songs to start earning streaming royalties!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFC] dark:bg-[#262626] border-b border-[#E5E9F0] dark:border-[#404040]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#475569] dark:text-white dark:text-opacity-70 uppercase tracking-wider">
                    Song Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#475569] dark:text-white dark:text-opacity-70 uppercase tracking-wider">
                    Streams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#475569] dark:text-white dark:text-opacity-70 uppercase tracking-wider">
                    Royalties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F6] dark:divide-[#404040]">
                {royalties.songRoyalties.map((song) => (
                  <tr
                    key={song.songId}
                    className="hover:bg-[#F8FAFF] dark:hover:bg-[#2A2A2A] transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Music
                            size={16}
                            className="text-purple-800 dark:text-purple-300"
                          />
                        </div>
                        <span className="font-medium text-[#1F2937] dark:text-white dark:text-opacity-87">
                          {song.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-[#475569] dark:text-white dark:text-opacity-70">
                        <TrendingUp size={14} />
                        <span>{song.streams.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ${song.royalties}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
