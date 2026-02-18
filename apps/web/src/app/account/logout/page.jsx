import { useEffect } from "react";
import useAuth from "@/utils/useAuth";
import { Music } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut({
      callbackUrl: "/",
      redirect: true,
    });
  }, [signOut]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F7FF] to-[#E8E9FF] dark:from-[#1A1A1A] dark:to-[#1E1E1E] flex items-center justify-center px-4 font-inter">
      <div className="text-center">
        <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
          <Music size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
          Signing out...
        </h1>
        <p className="text-[#475569] dark:text-white dark:text-opacity-70">
          Thanks for playing Kingdom Chords!
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
