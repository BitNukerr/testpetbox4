"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";

export default function Footer() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    supabase.auth.getUser().then(({ data }) => setIsSignedIn(Boolean(data.user)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.user));
    });

    return () => listener.subscription.unsubscribe();
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
          <Link href={isSignedIn ? "/account" : "/login"}>{isSignedIn ? pt.nav.account : pt.nav.login}</Link>
        </div>
      </div>
    </footer>
  );
}
