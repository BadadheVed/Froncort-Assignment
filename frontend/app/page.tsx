"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [docId, setDocId] = useState<string>("");

  useEffect(() => {
    const id = crypto.randomUUID();
    setDocId(id);
  }, []);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Realtime Docs</h1>
      <p className="text-gray-400">Start a new collaborative document or open an existing one by URL.</p>
      <div className="flex items-center gap-3">
        <Link href={`/docs/${docId}`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">New Doc</Link>
        <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">Login</Link>
      </div>
    </main>
  );
}
