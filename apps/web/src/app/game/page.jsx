import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import GameSidebar from "@/components/GameSidebar";
import Dashboard from "@/components/Dashboard";
import Ministry from "@/components/Ministry";
import Songs from "@/components/Songs";
import Finance from "@/components/Finance";
import useUser from "@/utils/useUser";

const queryClient = new QueryClient();

function GameContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const { data: user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F1F7FF] to-[#E8E9FF] dark:from-[#1A1A1A] dark:to-[#1E1E1E] flex items-center justify-center">
        <div className="text-[#475569] dark:text-white dark:text-opacity-70">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F1F7FF] to-[#E8E9FF] dark:from-[#1A1A1A] dark:to-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-4">
            Please sign in to play Kingdom Chords
          </h1>
          <a
            href="/account/signin"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-150 font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "ministry":
        return <Ministry />;
      case "songs":
        return <Songs />;
      case "finance":
        return <Finance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#1E1E1E] border-b border-[#E5E9F0] dark:border-[#404040]">
        <div className="h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors mr-2"
            >
              {sidebarOpen ? (
                <X
                  size={20}
                  className="text-[#1A2433] dark:text-white dark:text-opacity-87"
                />
              ) : (
                <Menu
                  size={20}
                  className="text-[#1A2433] dark:text-white dark:text-opacity-87"
                />
              )}
            </button>
            <h1 className="text-xl font-semibold text-[#1F2937] dark:text-white dark:text-opacity-87">
              Kingdom Chords
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-[#475569] dark:text-white dark:text-opacity-70">
              {user.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Sidebar Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden dark:bg-black dark:bg-opacity-70"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <GameSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="bg-gradient-to-br from-[#F1F7FF] to-[#E8E9FF] dark:from-[#1A1A1A] dark:to-[#1E1E1E] min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {renderPage()}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}

export default function GamePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameContent />
    </QueryClientProvider>
  );
}
