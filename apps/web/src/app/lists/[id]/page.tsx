"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ListItemsPage() {
  const baseURL = (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const params = useParams();
  const listId = String(params?.id || "");

  const [items, setItems] = useState<Array<{ id: string; name: string; quantity: number; unit?: string; purchased: boolean }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>("un");

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseURL}/api/lists/${listId}/items`, { credentials: "include" });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Falha ao carregar itens (${res.status}) ${detail}`);
      }
      const data = await res.json().catch(() => []);
      setItems(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    if (!listId) return;
    fetchItems();
  }, [session?.user?.id, listId]);

  const createItem = async () => {
    try {
      const res = await fetch(`${baseURL}/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, quantity, unit }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Falha ao criar item (${res.status}) ${detail}`);
      }
      setName("");
      setQuantity(1);
      setUnit("un");
      await fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Itens da lista</h1>
        <p className="text-sm text-muted-foreground">Lista: {listId}</p>
      </div>
      <div className="grid gap-4">
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && items.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Nenhum item</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Adicione itens abaixo</p>
            </CardContent>
          </Card>
        )}
        {items.map((it) => (
          <Card key={it.id} className="hover:bg-muted">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{it.name}</span>
                <span className="text-sm text-muted-foreground">{it.quantity} {it.unit ?? "un"}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-lg font-medium">Novo item</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label htmlFor="item-name">Nome</Label>
            <Input id="item-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="item-qty">Qtd</Label>
            <Input id="item-qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="item-unit">Unidade</Label>
            <Input id="item-unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={createItem} disabled={!name.trim()}>Adicionar</Button>
        </div>
      </div>
    </div>
  );
}