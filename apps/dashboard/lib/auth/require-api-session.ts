import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";

export async function requireApiSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  return { session };
}
