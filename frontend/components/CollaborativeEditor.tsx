"use client";
import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import type { EditorProps, CursorPosition } from "@/types/editor.types";
import { generateUserColor } from "@/lib/colors";

export default function CollaborativeEditor({ documentId, user }: EditorProps) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [userCount, setUserCount] = useState(1);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234";
    console.log("🔌 Connecting to WebSocket:", wsUrl);
    
    const provider = new HocuspocusProvider({
      url: wsUrl,
      name: documentId,
      document: ydoc,
      token: user.token,
    });

    // Set up event listeners
    provider.on('open', () => {
      console.log("🔌 WebSocket connection opened");
      setStatus("connected");
    });

    provider.on('close', () => {
      console.log("🔌 WebSocket connection closed");
      setStatus("disconnected");
    });

    provider.on('disconnect', () => {
      console.warn("⚠️ WebSocket disconnected");
      setStatus("disconnected");
    });

    provider.on('synced', () => {
      console.log("✅ Document synced");
      setStatus("connected");
    });

    provider.on('awarenessUpdate', ({ states }: { states: any[] }) => {
      setUserCount(states.length);
    });

    return provider;
  }, [documentId, ydoc, user.token]);

  // Provider status & connection events
  useEffect(() => {
    const onStatus = (e: { status: "connecting" | "connected" | "disconnected" }) => {
      console.log("📡 Hocuspocus status:", e.status);
      setStatus(e.status);
    };
    const onConnect = () => {
      console.log("✅ Connected to Hocuspocus");
      setStatus("connected");
    };
    const onAuthenticated = () => {
      // Ensure UI leaves the loading state once authenticated
      setStatus("connected");
    };
    const onSynced = () => {
      // When initial sync completes, we are definitely connected
      setStatus("connected");
    };
    const onDisconnect = () => {
      console.log("❌ Disconnected from Hocuspocus");
      setStatus("disconnected");
    };
    const onAuthFailed = () => {
      console.error("🔒 Authentication failed");
      setStatus("disconnected");
    };

    provider.on("status", onStatus);
    provider.on("connect", onConnect);
    provider.on("authenticated", onAuthenticated);
    provider.on("synced", onSynced);
    provider.on("disconnect", onDisconnect);
    provider.on("authenticationFailed", onAuthFailed);

    return () => {
      provider.off("status", onStatus);
      provider.off("connect", onConnect);
      provider.off("authenticated", onAuthenticated);
      provider.off("synced", onSynced);
      provider.off("disconnect", onDisconnect);
      provider.off("authenticationFailed", onAuthFailed);
    };
  }, [provider]);

  useEffect(() => {
    const color = generateUserColor(user.id);
    provider.setAwarenessField("user", { name: user.username, color } satisfies CursorPosition);

    const awareness = provider.awareness;
    if (!awareness) {
      return;
    }

    const handleAwareness = () => {
      const states = Array.from(awareness.getStates().values());
      setUserCount(states.length);
    };

    awareness.on("change", handleAwareness);
    handleAwareness();

    return () => {
      awareness.off("change", handleAwareness);
    };
  }, [provider, user.id, user.username]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider,
        user: { name: user.username, color: generateUserColor(user.id) },
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[60vh] focus:outline-none",
      },
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [editor, provider, ydoc]);

  const statusColor = status === "connected" ? "bg-green-400" : status === "connecting" ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border border-gray-800 rounded-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${statusColor} animate-pulse`} />
          <span className="text-sm text-gray-300">Doc: <strong className="text-white">{documentId}</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">User: <strong className="text-white">{user.username}</strong></span>
          <span className="text-sm text-gray-300 inline-flex items-center gap-1" title="Active users">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"/></svg>
            {userCount}
          </span>
        </div>
      </header>

      {status === "connecting" && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-gray-300">
          <span className="animate-spin h-8 w-8 border-4 border-gray-600 border-t-transparent rounded-full mb-4" />
          <p>Connecting to collaboration server...</p>
        </div>
      )}

      <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
        <EditorContent editor={editor} />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .collaboration-cursor__caret {
          position: relative;
          border-left-width: 2px;
          border-left-style: solid;
          margin-left: -1px;
          margin-right: -1px;
          pointer-events: none;
        }
        .collaboration-cursor__label {
          position: relative;
          top: -1.2em;
          left: -1px;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          color: #111827;
          white-space: nowrap;
          pointer-events: none;
        }
          `,
        }}
      />
    </div>
  );
}
