"use client";
import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import type { EditorProps } from "@/types/editor.types";
import { generateUserColor } from "@/lib/colors";

export default function CollaborativeEditor({ documentId, user }: EditorProps) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [userCount, setUserCount] = useState(1);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [isProviderReady, setIsProviderReady] = useState(false);

  // Create a single Y.Doc instance
  const ydoc = useMemo(() => new Y.Doc(), []);

  // Initialize and manage WebSocket provider FIRST
  useEffect(() => {
    if (!user?.token) {
      console.error("No user token available");
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234";
    console.log("🔌 Initializing WebSocket connection to:", wsUrl);

    try {
      const newProvider = new HocuspocusProvider({
        url: wsUrl,
        name: documentId,
        document: ydoc,
        token: user.token,
        onConnect: () => {
          console.log("✅ Connected to Hocuspocus server");
          setIsProviderReady(true);
        },
        onAuthenticationFailed: ({ reason }) => {
          console.error("🔒 Authentication failed:", reason);
          setStatus("disconnected");
        },
        onStatus: ({ status: providerStatus }) => {
          console.log("📡 Provider status:", providerStatus);
          if (providerStatus === "connected") {
            setStatus("connected");
            setIsProviderReady(true);
          } else if (providerStatus === "connecting") {
            setStatus("connecting");
          } else {
            setStatus("disconnected");
          }
        },
      });

      const onSynced = () => {
        console.log("✅ Document synced");
        setStatus("connected");
      };

      const onAwarenessUpdate = ({ states }: { states: any[] }) => {
        setUserCount(states.length);
      };

      // Add event listeners
      newProvider.on("synced", onSynced);
      newProvider.on("awarenessUpdate", onAwarenessUpdate);

      // Set provider immediately
      setProvider(newProvider);

      // Cleanup function
      return () => {
        newProvider.off("synced", onSynced);
        newProvider.off("awarenessUpdate", onAwarenessUpdate);
        newProvider.destroy();
        setProvider(null);
        setIsProviderReady(false);
      };
    } catch (error) {
      console.error("❌ Failed to initialize WebSocket provider:", error);
      setStatus("disconnected");
    }
  }, [documentId, ydoc, user?.token]);

  // Initialize the editor ONLY when provider is ready and not null
  const editor = useEditor(
    {
      extensions: provider && isProviderReady
        ? [
            StarterKit.configure({ history: false }),
            Collaboration.configure({
              document: ydoc,
            }),
            CollaborationCursor.configure({
              provider: provider,
              user: {
                name: user?.username || "Anonymous",
                color: user ? generateUserColor(user.id) : "#000000",
              },
            }),
          ]
        : [
            StarterKit.configure({ history: false }),
            Collaboration.configure({
              document: ydoc,
            }),
          ],
      editorProps: {
        attributes: {
          class: "prose prose-invert max-w-none min-h-[60vh] focus:outline-none p-4",
        },
      },
    },
    [provider, isProviderReady] // Re-create editor when provider is ready
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
      provider?.destroy();
      ydoc?.destroy();
    };
  }, []);

  // Status indicator color
  const statusColor = {
    connecting: "bg-yellow-400",
    connected: "bg-green-400",
    disconnected: "bg-red-500",
  }[status];

  // Show loading state until provider is ready
  if (!provider || !isProviderReady || !editor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">
            {!provider ? "Initializing..." : "Connecting to collaboration server..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border border-gray-800 rounded-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${statusColor} ${
              status === "connecting" ? "animate-pulse" : ""
            }`}
            title={status}
          />
          <span className="text-sm text-gray-300">
            Users: <span className="text-white font-medium">{userCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {status === "connected"
              ? "Connected"
              : status === "connecting"
              ? "Connecting..."
              : "Disconnected"}
          </span>
        </div>
      </header>

      <div className="border border-gray-800 rounded-md bg-gray-900/50 overflow-hidden">
        <EditorContent editor={editor} className="min-h-[60vh]" />
      </div>

      {/* Cursor Presence Styles */}
      <style jsx global>{`
        .collaboration-cursor__caret {
          border-left: 2px solid;
          border-color: var(--cursor-color);
          margin-left: -1px;
          margin-right: -1px;
          pointer-events: none;
          position: relative;
          word-break: normal;
        }

        .collaboration-cursor__label {
          border-radius: 4px;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          left: -1px;
          line-height: normal;
          padding: 2px 6px;
          position: absolute;
          top: -1.8em;
          user-select: none;
          white-space: nowrap;
          background-color: var(--cursor-color);
        }

        /* Editor prose styles for dark mode */
        .prose-invert {
          color: #e5e7eb;
        }

        .prose-invert h1,
        .prose-invert h2,
        .prose-invert h3 {
          color: #f9fafb;
        }

        .prose-invert p {
          color: #d1d5db;
        }

        .prose-invert strong {
          color: #f3f4f6;
        }
      `}</style>
    </div>
  );
}