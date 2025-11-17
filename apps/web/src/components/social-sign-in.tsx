"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export const SocialSignIn = () => {
    const handleGoogleSignIn = () => {
        authClient.signIn.social({ provider: "google" });
    };

	return (
		<div className="flex flex-col gap-2">
			<Button onClick={handleGoogleSignIn} variant="outline">
				Sign in with Google
			</Button>
		</div>
	);
};
