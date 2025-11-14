"use client";

import { useEffect, useState } from "react";

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
`;

export default function Home() {
    const [status, setStatus] = useState<"unknown" | "online" | "offline">("unknown");
    const [latency, setLatency] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [lastChecked, setLastChecked] = useState<number | null>(null);
    const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

    const checkStatus = async () => {
        const start = performance.now();
        try {
            const res = await fetch(`${baseURL}/`, { cache: "no-store" });
            const end = performance.now();
            setLatency(Math.round(end - start));
            setLastChecked(Date.now());
            if (res.ok) {
                setStatus("online");
                setMessage(null);
            } else {
                setStatus("offline");
                setMessage(`${res.status} ${res.statusText}`);
            }
        } catch (e) {
            const end = performance.now();
            setLatency(Math.round(end - start));
            setStatus("offline");
            setLastChecked(Date.now());
            const detail = e instanceof Error ? e.message : "erro desconhecido";
            setMessage(`Falha ao conectar: ${detail}`);
        }
    };

    useEffect(() => {
        checkStatus();
        const id = setInterval(checkStatus, 10_000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="container mx-auto max-w-3xl px-4 py-2">
            <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
            <div className="grid gap-6">
                <section className="rounded-lg border p-4">
                    <h2 className="mb-2 font-medium">API Status</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span
                                className={
                                    status === "online"
                                        ? "inline-flex h-3 w-3 rounded-full bg-green-500"
                                        : status === "offline"
                                        ? "inline-flex h-3 w-3 rounded-full bg-red-500"
                                        : "inline-flex h-3 w-3 rounded-full bg-yellow-500"
                                }
                                aria-hidden
                            />
                            <span className="text-sm">
                                {status === "online" && "Online"}
                                {status === "offline" && "Offline"}
                                {status === "unknown" && "Checando..."}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {latency !== null ? `${latency}ms` : ""}
                            </span>
                        </div>
                        <button
                            onClick={checkStatus}
                            className="text-sm underline underline-offset-2 hover:opacity-80"
                        >
                            Verificar agora
                        </button>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                        <span>Servidor: {baseURL}</span>
                        {message ? <span className="ml-2">{message}</span> : null}
                        {lastChecked ? (
                            <span className="ml-2">Última verificação: {new Date(lastChecked).toLocaleTimeString()}</span>
                        ) : null}
                    </div>
                </section>
            </div>
        </div>
    );
}
