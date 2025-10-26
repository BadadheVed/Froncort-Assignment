"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/axios/axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data as { token: string; user: { id: string; username: string; email: string } };
      localStorage.setItem("auth", JSON.stringify(data));
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg border border-gray-800">
      <h1 className="text-xl font-semibold text-white mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 text-gray-100 rounded px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 text-gray-100 rounded px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition flex items-center justify-center" disabled={loading}>
          {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block" /> : "Login"}
        </button>
      </form>
      <p className="text-gray-400 text-sm mt-4">
        No account? Use the Register endpoint with a tool like Postman to create one, then return here to log in.
      </p>
    </main>
  );
}
