"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export const SocialSignIn = () => {
    const handleGithubSignIn = () => {
        authClient.signIn.social({ provider: "github" });
    };

    const handleGoogleSignIn = () => {
        authClient.signIn.social({ provider: "google" });
    };

	return (
		<div className="flex flex-col gap-2">
			<Button onClick={handleGithubSignIn} variant="outline">
				Sign in with GitHub
			</Button>
			<Button onClick={handleGoogleSignIn} variant="outline">
				Sign in with Google
			</Button>
		</div>
	);
};
