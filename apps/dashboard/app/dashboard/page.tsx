"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";

export default function Page() {
  const router = useRouter();

  async function signout() {
    await authClient.signOut();

    router.push("/signin");
    router.refresh();
  }

  return (
    <div>
      <button onClick={signout} className="bg-red-500">
        Sign out
      </button>
    </div>
  );
}
