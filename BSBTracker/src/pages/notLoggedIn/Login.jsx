import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../data/supabaseClient";
import { syncUserToDatabase } from "../../data/admin";

export default function Login() {
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

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      handleSession(sessionUser);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null;
        handleSession(sessionUser);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  async function signInWithEmail() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Check your email for the login link!");
    }

    setLoading(false);
  }

  async function signInWithProvider(provider) {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-100 px-6">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-6">
            Developer Login
          </h1>

          {user ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-blue-700">Logged in as {user.email}</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={signOut}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 rounded border border-gray-300 w-full"
              />
              <button
                onClick={signInWithEmail}
                disabled={loading || !email}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition w-full"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>

              <div className="text-gray-600 my-2">or</div>

              <button
                onClick={() => signInWithProvider("google")}
                className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition w-full"
              >
                Continue with Google
              </button>

              {message && (
                <p className="text-sm text-red-600 mt-2">{message}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
