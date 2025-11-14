"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

export default function AppHeader() {
    const pathname = usePathname();
    const hide = pathname === "/login";
    if (hide) return null;
    return <Header />;
}