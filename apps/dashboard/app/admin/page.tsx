"use client";
import React, { useState } from "react";

export default function Page() {
  const [generatedApiKey, setGeneratedApiKey] = useState("");
  const [verifyResult, setVerifyResult] = useState("");

  async function createApiKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const permission = formData.get("permissions");

    const type = permission === "Live Key" ? "LIVE" : "TEST";

    const res = await fetch("/api/apiKey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
      }),
    });

    const data = await res.json();

    setGeneratedApiKey(data.key);
  }

  async function verifyApiKey(rawKey: string) {
    const res = await fetch("/api/apiKey/put", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rawKey,
      }),
    });

    const data = await res.json();

    setVerifyResult(data.message);
  }

  return (
    <div className="p-4">
      <form
        method="post"
        onSubmit={createApiKey}
        className="flex flex-col gap-3 w-72"
      >
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="live-key"
            name="permissions"
            value="Live Key"
            defaultChecked
          />

          <label htmlFor="live-key">Live Key</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="test-key"
            name="permissions"
            value="Test Key"
          />

          <label htmlFor="test-key">Test Key</label>
        </div>

        <button
          type="submit"
          className="cursor-pointer border rounded px-3 py-2"
        >
          Create API Key
        </button>
      </form>

      {generatedApiKey && (
        <div className="mt-4 break-all">
          <p className="font-medium">Generated Key:</p>

          <code>{generatedApiKey}</code>

          <button
            onClick={() => verifyApiKey(generatedApiKey)}
            className="mt-4 border rounded px-3 py-2 block"
          >
            Test Verify
          </button>

          {verifyResult && <p className="mt-3 font-medium">{verifyResult}</p>}
        </div>
      )}
    </div>
  );
}
