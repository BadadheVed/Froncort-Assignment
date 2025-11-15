"use client";
import Link from "next/link";
import { useState } from "react";
import axios from "@/axios/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [step, setStep] = useState<"form" | "created">("form");
  const [createdDoc, setCreatedDoc] = useState<{
    id: string;
    docId: number;
    pin: number;
    joinLink: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const createDocument = async () => {
    if (!title.trim()) {
      alert("Please enter a document title");
      return;
    }

    if (!creatorName.trim()) {
      alert("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/docs/create", {
        title: title.trim(),
      });
      setCreatedDoc(response.data);
      setStep("created");
    } catch (error) {
      console.error("Failed to create document:", error);
      alert("Failed to create document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!createdDoc) return;
    const text = `Document ID: ${createdDoc.docId}\nPin: ${createdDoc.pin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setStep("form");
    setTitle("");
    setCreatorName("");
    setCreatedDoc(null);
  };

  return (
    <main className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Froncort Collaborative Docs
        </h1>
        <p className="text-gray-400">
          Create collaborative documents and share them with your team
        </p>
      </div>

      {/* Create Document Section */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Create New Document
        </h2>

        {step === "form" ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Your Name
              </label>
              <Input
                placeholder="Enter your name..."
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                maxLength={50}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Document Title
              </label>
              <Input
                placeholder="Enter document title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && createDocument()}
                disabled={loading}
              />
            </div>

            <Button
              onClick={createDocument}
              disabled={loading || !title.trim() || !creatorName.trim()}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Document"}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg space-y-3">
              <h3 className="text-lg font-medium text-green-300">
                Document Created Successfully!
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Document ID:</span>
                  <div className="font-mono text-white text-lg">
                    {createdDoc?.docId}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Pin:</span>
                  <div className="font-mono text-white text-lg">
                    {createdDoc?.pin}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/docs/${createdDoc?.id}?docId=${
                    createdDoc?.docId
                  }&pin=${createdDoc?.pin}&name=${encodeURIComponent(
                    creatorName
                  )}`}
                  className="flex-1"
                >
                  <Button className="bg-green-600 hover:bg-green-700 w-full">
                    Open Document
                  </Button>
                </Link>
                <Button variant="outline" onClick={copyCredentials}>
                  {copied ? "✓ Copied!" : "Copy Credentials"}
                </Button>
              </div>
            </div>

            <Button variant="outline" onClick={resetForm} className="w-full">
              Create Another Document
            </Button>
          </div>
        )}
      </div>

      {/* Join Document Section */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Join Existing Document
        </h2>
        <Link href="/join">
          <Button variant="outline" className="w-full">
            Join with Document ID & Pin
          </Button>
        </Link>
      </div>
    </main>
  );
}
