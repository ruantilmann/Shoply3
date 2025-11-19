"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export const SocialSignIn = () => {
    const handleGoogleSignIn = () => {
        const target = (process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001").replace(/\/+$/, "");
        authClient.signIn.social({ provider: "google", callbackURL: `${target}/` });
    };

	return (
		<div className="flex flex-col gap-2">
			<Button onClick={handleGoogleSignIn} variant="outline">
				Sign in with Google
			</Button>
		</div>
	);
};
