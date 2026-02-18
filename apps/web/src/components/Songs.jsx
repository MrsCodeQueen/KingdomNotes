import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Music, Plus, X, TrendingUp } from "lucide-react";

export default function Songs() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newSong, setNewSong] = useState({ title: "", genre: "Worship" });

  const { data: songs, isLoading } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const response = await fetch("/api/game/songs");
      if (!response.ok) {
        throw new Error("Failed to fetch songs");
      }
      return response.json();
    },
  });

  const createSongMutation = useMutation({
    mutationFn: async (songData) => {
      const response = await fetch("/api/game/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(songData),
      });
      if (!response.ok) {
        throw new Error("Failed to create song");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["songs"]);
      queryClient.invalidateQueries(["stats"]);
      setShowModal(false);
      setNewSong({ title: "", genre: "Worship" });
    },
  });

  const genres = ["Worship", "Gospel", "Contemporary", "Hymn", "Praise"];

  return (
    <div className="font-inter">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
            Songs Library
          </h1>
          <p className="text-[#475569] dark:text-white dark:text-opacity-70">
            Write and manage your worship songs.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-150 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span className="font-medium">Write New Song</span>
        </button>
      </div>

      {/* Songs Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-[#475569] dark:text-white dark:text-opacity-70">
            Loading songs...
          </div>
        </div>
      ) : songs?.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-16 text-center">
          <Music
            size={48}
            className="mx-auto text-[#94A3B8] dark:text-white dark:text-opacity-50 mb-4"
          />
          <h3 className="text-lg font-medium text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
            No songs yet
          </h3>
          <p className="text-[#475569] dark:text-white dark:text-opacity-70 mb-6">
            Start writing your first worship song to boost your charisma!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-150"
          >
            <Plus size={16} className="mr-2" />
            Write Your First Song
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <div
              key={song.id}
              className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-6 hover:shadow-lg transition-shadow duration-150"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Music
                    size={20}
                    className="text-purple-800 dark:text-purple-300"
                  />
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                  {song.genre}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
                {song.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-[#475569] dark:text-white dark:text-opacity-70">
                <TrendingUp size={14} />
                <span>{song.streams.toLocaleString()} streams</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E5E9F0] dark:border-[#404040]">
                <div className="text-xs text-[#475569] dark:text-white dark:text-opacity-60">
                  Created {new Date(song.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Song Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87">
                Write New Song
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-[#F7F9FC] dark:hover:bg-[#262626] rounded transition-colors duration-150"
              >
                <X
                  size={20}
                  className="text-[#475569] dark:text-white dark:text-opacity-70"
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
                  Song Title
                </label>
                <input
                  type="text"
                  value={newSong.title}
                  onChange={(e) =>
                    setNewSong({ ...newSong, title: e.target.value })
                  }
                  placeholder="Enter song title"
                  className="w-full px-4 py-3 bg-[#F7F9FC] dark:bg-[#262626] border border-[#E5E9F0] dark:border-[#404040] rounded-lg text-[#1F2937] dark:text-white dark:text-opacity-87 placeholder-[#94A3B8] dark:placeholder-white dark:placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
                  Genre
                </label>
                <select
                  value={newSong.genre}
                  onChange={(e) =>
                    setNewSong({ ...newSong, genre: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#F7F9FC] dark:bg-[#262626] border border-[#E5E9F0] dark:border-[#404040] rounded-lg text-[#1F2937] dark:text-white dark:text-opacity-87 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  Writing a song will increase your Charisma by 1-2 points!
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-[#E5E9F0] dark:border-[#404040] rounded-lg text-[#475569] dark:text-white dark:text-opacity-70 hover:bg-[#F7F9FC] dark:hover:bg-[#262626] transition-colors duration-150 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createSongMutation.mutate(newSong)}
                  disabled={!newSong.title || createSongMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:bg-[#94A3B8] dark:disabled:bg-[#4A4A4A] disabled:cursor-not-allowed transition-all duration-150 font-medium"
                >
                  {createSongMutation.isPending ? "Writing..." : "Write Song"}
                </button>
              </div>
            </div>
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
