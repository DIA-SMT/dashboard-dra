"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const router = useRouter();
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  const inicial = email ? email[0].toUpperCase() : "·";

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 md:px-10 h-14 md:h-16 flex items-center justify-between gap-4">
        <Link href="/" className="md:hidden flex items-center gap-2">
          <Image src="/logos/logoMuni-sm.png" alt="SMT" width={32} height={32} className="h-8 w-8" />
          <span className="text-sm font-semibold text-foreground">Intendencia</span>
        </Link>
        <p className="hidden md:block text-sm text-muted-foreground capitalize">{hoy}</p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right leading-tight">
            <span className="text-sm font-medium truncate max-w-[180px]">{email ?? "—"}</span>
            <span className="text-[11px] text-muted-foreground">Despacho de Intendencia</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[hsl(var(--smt-blue))] to-[hsl(var(--smt-sky))] text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            {inicial}
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
