import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.info("auth.session.result", {
    authenticated: Boolean(session?.user),
    userId: session?.user?.id ?? null,
  });

  return session;
}

export async function requireUser() {
  const session = await getSession();

  if (!session?.user) {
    console.info("auth.guard.redirect", {
      reason: "missing-session",
      redirectTo: "/signIn",
    });
    redirect("/signIn");
  }

  return session.user;
}
