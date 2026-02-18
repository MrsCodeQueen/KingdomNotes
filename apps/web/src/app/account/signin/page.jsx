import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Music, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithCredentials } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/game",
        redirect: true,
      });
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F7FF] to-[#E8E9FF] dark:from-[#1A1A1A] dark:to-[#1E1E1E] flex items-center justify-center px-4 font-inter">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
            <Music size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
            Welcome Back
          </h1>
          <p className="text-[#475569] dark:text-white dark:text-opacity-70">
            Sign in to continue your ministry
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E9F0] dark:border-[#404040] p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F7F9FC] dark:bg-[#262626] border border-[#E5E9F0] dark:border-[#404040] rounded-lg text-[#1F2937] dark:text-white dark:text-opacity-87 placeholder-[#94A3B8] dark:placeholder-white dark:placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] dark:text-white dark:text-opacity-87 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F7F9FC] dark:bg-[#262626] border border-[#E5E9F0] dark:border-[#404040] rounded-lg text-[#1F2937] dark:text-white dark:text-opacity-87 placeholder-[#94A3B8] dark:placeholder-white dark:placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:bg-[#94A3B8] dark:disabled:bg-[#4A4A4A] disabled:cursor-not-allowed transition-all duration-150 font-medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#475569] dark:text-white dark:text-opacity-70">
              Don't have an account?{" "}
              <a
                href="/account/signup"
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
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
