import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  supabase,
  getCurrentUser,
  onAuthStateChange,
  signOut,
} from "../../data/supabaseClient";
import { signInWithEmail, signInWithProvider } from "../../data/auth";
import { syncUserToDatabase } from "../../data/users";

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function handleSession(sessionUser) {
      setUser(sessionUser);
      if (sessionUser) {
        await syncUserToDatabase();
        navigate("/dashboard");
      }
    }

    getCurrentUser().then((sessionUser) => {
      handleSession(sessionUser);
    });

    const unsubscribe = onAuthStateChange((sessionUser) => {
      handleSession(sessionUser);
    });

    return () => unsubscribe();
  }, [navigate]);

  async function handleEmailSignIn() {
    setLoading(true);
    setMessage("");

    try {
      await signInWithEmail(email);
      setMessage("Check your email for the login link.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }

    setLoading(false);
  }

  async function handleProviderSignIn(provider) {
    try {
      await signInWithProvider(provider);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Blue Swan Tracker
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track everything Blue Swan — progress, performance, and precision.
          </p>
        </div>
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10">
          {user ? (
            <div className="space-y-4 text-center">
              <p className="text-green-700 font-medium">
                Logged in as {user.email}
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleProviderSignIn("google")}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md text-gray-900 font-medium py-2 px-4 rounded-md transition"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Sign in with Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleEmailSignIn}
                  disabled={loading || !email}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </div>

              {message && (
                <p className="mt-4 text-sm text-red-600 text-center">
                  {message}
                </p>
              )}
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Blue Swan Tracker. All rights reserved.
        </p>
      </div>
    </div>
  );
}
