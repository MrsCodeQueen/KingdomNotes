import { useQuery } from "@tanstack/react-query";
import { Sparkles, Users, DollarSign, Zap, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/game/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#475569] dark:text-white dark:text-opacity-70">
          Loading your stats...
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Anointing",
      value: stats?.anointing || 0,
      icon: Sparkles,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-800 dark:text-purple-300",
    },
    {
      label: "Charisma",
      value: stats?.charisma || 0,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-800 dark:text-blue-300",
    },
    {
      label: "Kingdom Funds",
      value: `$${parseFloat(stats?.kingdom_funds || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-800 dark:text-green-300",
    },
    {
      label: "Energy",
      value: `${stats?.energy || 0}/100`,
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-800 dark:text-yellow-300",
    },
  ];

  return (
    <div className="font-inter">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
          Artist Dashboard
        </h1>
        <p className="text-[#475569] dark:text-white dark:text-opacity-70">
          Welcome back! Here's your ministry overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.textColor} />
              </div>
            </div>
            <div className="text-2xl font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-[#475569] dark:text-white dark:text-opacity-70">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Followers Card */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
            <Users size={20} className="text-pink-800 dark:text-pink-300" />
          </div>
          <h2 className="text-lg font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87">
            Followers
          </h2>
        </div>
        <div className="text-3xl font-bold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
          {stats?.followers?.toLocaleString() || 0}
        </div>
        <p className="text-sm text-[#475569] dark:text-white dark:text-opacity-70">
          People following your ministry
        </p>
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
