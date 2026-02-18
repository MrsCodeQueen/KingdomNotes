import { useState } from "react";
import {
  Home,
  Music,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";

export default function GameSidebar({
  sidebarOpen,
  setSidebarOpen,
  activePage,
  setActivePage,
}) {
  const [gameExpanded, setGameExpanded] = useState(true);

  const navItems = [
    { icon: Home, label: "Dashboard", page: "dashboard" },
    { icon: Sparkles, label: "Ministry", page: "ministry" },
    { icon: Music, label: "Songs", page: "songs" },
    { icon: DollarSign, label: "Finance", page: "finance" },
  ];

  return (
    <div
      className={`
      fixed lg:static inset-y-0 left-0 z-50 
      w-64 bg-white dark:bg-[#1E1E1E] border-r border-[#E5E9F0] dark:border-[#404040]
      flex flex-col h-full font-inter
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}
    >
      {/* Game Title */}
      <div className="p-4 border-b border-[#E5E9F0] dark:border-[#404040]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Music size={16} className="text-white" />
            </div>
            <span className="font-medium text-[#1F2937] dark:text-white dark:text-opacity-87">
              Kingdom Chords
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                setActivePage(item.page);
                setSidebarOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-150 cursor-pointer ${
                activePage === item.page
                  ? "bg-[#F1F3F7] dark:bg-[#2A2A2A] text-[#1F2937] dark:text-white dark:text-opacity-87"
                  : "text-[#475569] dark:text-white dark:text-opacity-70 hover:bg-[#F7F9FC] dark:hover:bg-[#262626]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={18} strokeWidth={1.5} />
                <span className="font-medium">{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Game Section */}
        <div className="mt-6">
          <button
            onClick={() => setGameExpanded(!gameExpanded)}
            className="flex items-center space-x-2 w-full px-3 py-2 text-[#475569] dark:text-white dark:text-opacity-70 hover:bg-[#F7F9FC] dark:hover:bg-[#262626] rounded-lg transition-colors duration-150"
          >
            {gameExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <span className="font-medium">Game Info</span>
          </button>

          {gameExpanded && (
            <div className="ml-6 mt-2 space-y-1">
              <div className="px-3 py-2 text-[#475569] dark:text-white dark:text-opacity-70 text-sm">
                <p className="mb-2">Build your worship ministry!</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Lead worship to gain followers</li>
                  <li>Write songs to boost charisma</li>
                  <li>Earn royalties from streams</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-[#E5E9F0] dark:border-[#404040]">
        <a
          href="/account/logout"
          className="flex items-center space-x-3 px-3 py-2 text-[#475569] dark:text-white dark:text-opacity-70 hover:bg-[#F7F9FC] dark:hover:bg-[#262626] rounded-lg transition-colors duration-150"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className="font-medium">Logout</span>
        </a>
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
