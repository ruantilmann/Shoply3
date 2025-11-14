import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WelcomePage() {
    const session = await authClient.getSession({
        fetchOptions: {
            headers: await headers(),
            throw: true,
        },
    });

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Boas‑vindas</CardTitle>
                    <CardDescription>Você está autenticado</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-lg">Olá, {session.user.name}</p>
                        <p className="text-sm text-muted-foreground">Email: {session.user.email}</p>
                        {session.user.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name ?? "avatar"}
                                className="mt-2 h-16 w-16 rounded-full border"
                            />
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}