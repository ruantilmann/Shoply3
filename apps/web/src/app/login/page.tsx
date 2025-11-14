"use client";

import SignUpForm from "@/components/sign-up-form";
import { SocialSignIn } from "@/components/social-sign-in";
import SignInForm from "@/components/sign-in-form";
import { useState } from "react";

export default function LoginPage() {
    const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-sm w-full p-6 space-y-4">
                {mode === "sign-in" ? (
                    <>
                        <SignInForm onSwitchToSignUp={() => setMode("sign-up")} />
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <SocialSignIn />
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <SignUpForm onSwitchToSignIn={() => setMode("sign-in")} />
                    </>
                )}
            </div>
        </div>
    );
}
