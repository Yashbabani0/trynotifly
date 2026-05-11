import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";
import {
  inferAdditionalFields,
  oneTapClient,
  organizationClient,
} from "better-auth/client/plugins";
import { dashClient, sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,

  plugins: [
    inferAdditionalFields<typeof auth>(),
    sentinelClient(),
    dashClient(),
    organizationClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    }),
  ],
});

export const { signIn, signUp, useSession } = authClient;
