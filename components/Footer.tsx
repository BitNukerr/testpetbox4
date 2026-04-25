"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";

export default function Footer() {
  const [authStatus, setAuthStatus] = useState<"checking" | "signed-in" | "signed-out">("checking");

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setAuthStatus("signed-out");
      return;
    }

    let mounted = true;
    let initialSessionLoaded = false;

    const applySession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (!mounted) return;
      setAuthStatus(session?.user ? "signed-in" : "signed-out");
    };

    supabase.auth.getSession().then(({ data }) => {
      initialSessionLoaded = true;
      applySession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!initialSessionLoaded && event !== "SIGNED_IN") return;
      applySession(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><h3>PetBox</h3><p>Caixas mensais e trimestrais para cães e gatos, com snacks, brinquedos e extras avulsos.</p></div>
        <div><h4>Explorar</h4><Link href="/shop">{pt.nav.shop}</Link><Link href="/configure">{pt.nav.build}</Link><Link href="/journal">{pt.nav.journal}</Link></div>
        <div>
          <h4>Empresa</h4>
          <Link href="/about">{pt.nav.about}</Link>
          <Link href="/contact">{pt.nav.contact}</Link>
          {authStatus === "checking" ? null : <Link href={authStatus === "signed-in" ? "/account" : "/login"}>{authStatus === "signed-in" ? pt.nav.account : pt.nav.login}</Link>}
        </div>
      </div>
    </footer>
  );
}
