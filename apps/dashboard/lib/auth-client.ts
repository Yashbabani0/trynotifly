import { createAuthClient } from "better-auth/client";
import { dashClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  plugins: [
    dashClient({
      resolveUserId: ({ userId, user, session }) => {
        return userId || user?.id || session?.user?.id;
      },
    }),
  ],
});
