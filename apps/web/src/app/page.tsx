"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function Home() {
    const baseURL = (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000").replace(/\/+$/, "");
    const { data: session } = authClient.useSession();
    const [lists, setLists] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");

    const fetchLists = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${baseURL}/api/lists`, {
                credentials: "include",
            });
            if (!res.ok) {
                const detail = await res.text().catch(() => "");
                throw new Error(`Falha ao carregar listas (${res.status}) ${detail}`);
            }
            const data = await res.json().catch(() => []);
            setLists(data ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    const router = useRouter();

    useEffect(() => {
        if (!session?.user) {
            router.replace("/login");
            return;
        }
        fetchLists();
    }, [session?.user?.id]);

    const createList = async () => {
        try {
            const res = await fetch(`${baseURL}/api/lists`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name }),
            });
            if (!res.ok) {
                const detail = await res.text().catch(() => "");
                throw new Error(`Falha ao criar lista (${res.status}) ${detail}`);
            }
            setIsModalOpen(false);
            setName("");
            await fetchLists();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro desconhecido");
        }
    };

    return (
        <div className="container mx-auto max-w-3xl px-4 py-6">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">Minhas listas</h1>
                <p className="text-sm text-muted-foreground">Usuário: {session?.user?.email ?? "não autenticado"}</p>
            </div>
            <div className="grid gap-4">
                {loading && <p>Carregando...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && lists.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Nenhuma lista encontrada</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Crie sua primeira lista pelo botão "+"</p>
                        </CardContent>
                    </Card>
                )}
                {lists.map((l) => (
                    <Card key={l.id}>
                        <CardHeader>
                            <CardTitle>{l.name}</CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <button
                className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90"
                aria-label="Criar lista"
                onClick={() => setIsModalOpen(true)}
            >
                <Plus className="h-6 w-6" />
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
                    <div className="relative z-10 w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-medium">Nova lista</h2>
                        <div className="space-y-2">
                            <Label htmlFor="list-name">Nome</Label>
                            <Input id="list-name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button onClick={createList} disabled={!name.trim()}>Criar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
