"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/axios/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function JoinPage() {
  const router = useRouter();
  const [docId, setDocId] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  const [documentData, setDocumentData] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const validateCredentials = async () => {
    if (!docId.trim() || !pin.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (docId.length !== 9) {
      setError("Document ID must be 9 digits");
      return;
    }

    if (pin.length !== 4) {
      setError("Pin must be 4 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/docs/join", {
        docId: parseInt(docId),
        pin: parseInt(pin),
      });

      const { id, title } = response.data;
      setDocumentData({ id, title });
      setValidated(true);
      setError("");
    } catch (error: any) {
      console.error("Failed to validate credentials:", error);
      setError(
        error.response?.data?.message ||
          "Failed to join document. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const joinDocument = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!documentData) return;

    router.push(
      `/docs/${
        documentData.id
      }?docId=${docId}&pin=${pin}&name=${encodeURIComponent(name)}`
    );
  };

  return (
    <main className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Join Document</h1>
        <p className="text-gray-400">
          {!validated
            ? "Enter the document ID and pin to join"
            : `Joining: ${documentData?.title}`}
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        {!validated ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Document ID (9 digits)
              </label>
              <Input
                placeholder="123456789"
                value={docId}
                onChange={(e) =>
                  setDocId(e.target.value.replace(/\D/g, "").slice(0, 9))
                }
                maxLength={9}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Pin (4 digits)
              </label>
              <Input
                placeholder="1234"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                maxLength={4}
                type="password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={validateCredentials}
              disabled={loading || !docId.trim() || !pin.trim()}
              className="w-full"
            >
              {loading ? "Validating..." : "Continue"}
            </Button>
          </>
        ) : (
          <>
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg mb-4">
              <p className="text-green-300 text-sm">✓ Credentials verified!</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Please enter your name
              </label>
              <Input
                placeholder="Your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && joinDocument()}
                maxLength={50}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setValidated(false);
                  setName("");
                  setError("");
                }}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={joinDocument}
                disabled={!name.trim()}
                className="flex-1"
              >
                Join Document
              </Button>
            </div>
          </>
        )}

        <div className="text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
