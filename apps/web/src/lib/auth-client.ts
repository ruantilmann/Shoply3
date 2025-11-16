import type { auth } from "../../../../packages/auth/src/index.ts";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL:
        process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
    plugins: [inferAdditionalFields<typeof auth>()],
});
