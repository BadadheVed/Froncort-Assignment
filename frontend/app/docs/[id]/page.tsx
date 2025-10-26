"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CollaborativeEditor from "@/components/CollaborativeEditor";
import type { User } from "@/types/editor.types";

export default function DocPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: { id: string; username: string; email: string } };
      const u: User = { id: parsed.user.id, username: parsed.user.username, email: parsed.user.email, token: parsed.token };
      setUser(u);
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (!idParam) return null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-300">
        <span className="animate-spin h-10 w-10 border-4 border-gray-600 border-t-transparent rounded-full mb-4" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!user) return null;

  return <CollaborativeEditor documentId={idParam} user={user} />;
}
