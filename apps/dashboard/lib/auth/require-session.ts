import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export async function requireSession(redirectToSignIn = true) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session && redirectToSignIn) {
    redirect("/signin");
  }

  return session;
}
