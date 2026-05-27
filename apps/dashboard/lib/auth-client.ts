import { createAuthClient } from "better-auth/client";
import { dashClient, sentinelClient } from "@better-auth/infra/client";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    dashClient(),
    sentinelClient({ autoSolveChallenge: true }),
    organizationClient(),
  ],
});
