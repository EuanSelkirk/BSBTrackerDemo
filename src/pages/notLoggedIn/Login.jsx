export default function Login() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-100 px-6">
        <div className="max-w-lg w-full text-center space-y-4">
          <h1 className="text-4xl font-bold text-blue-800">Demo Mode</h1>
          <p className="text-gray-700 text-lg">
            Authentication is disabled in this static demo. Explore the sample
            data by heading straight to the dashboard.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            View Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
