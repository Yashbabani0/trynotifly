import { createAuthClient } from "better-auth/client";
import { dashClient, sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  plugins: [dashClient(), sentinelClient({ autoSolveChallenge: true })],
});
