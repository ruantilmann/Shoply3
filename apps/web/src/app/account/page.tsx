import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import AccountForm from "@/components/account-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AccountPage() {
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
                    <CardTitle>Alterar cadastro</CardTitle>
                    <CardDescription>Atualize suas informações</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Usuário: {session.user.email}</p>
                    </div>
                    <AccountForm />
                </CardContent>
            </Card>
        </div>
    );
}