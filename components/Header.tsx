"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/client-store";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";

const baseNav = [
  [pt.nav.shop, "/shop"],
  [pt.nav.build, "/configure"],
  [pt.nav.journal, "/journal"],
  [pt.nav.about, "/about"],
  [pt.nav.contact, "/contact"]
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [authStatus, setAuthStatus] = useState<"checking" | "signed-in" | "signed-out">("checking");

  useEffect(() => {
    const refresh = () => setCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
    refresh();
    window.addEventListener("petbox-cart-changed", refresh);
    return () => window.removeEventListener("petbox-cart-changed", refresh);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setAuthStatus("signed-out");
      return;
    }

    supabase.auth.getUser().then(({ data }) => setAuthStatus(data.user ? "signed-in" : "signed-out"));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthStatus(session?.user ? "signed-in" : "signed-out");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const authNav = authStatus === "signed-in"
    ? [pt.nav.account, "/account"] as const
    : [pt.nav.login, "/login"] as const;
  const nav = authStatus === "checking" ? baseNav : [...baseNav, authNav] as const;

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand">
          <span className="brand-badge" aria-hidden="true">🐾</span>
          <span><strong>PetBox</strong><small>{pt.brand.tagline}</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {nav.map(([label, href]) => <Link key={href} href={href} className="nav-link">{label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link href="/cart" className="cart-pill">{pt.nav.cart} <span>{count}</span></Link>
          <button className="menu-btn" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu" aria-expanded={open}>{open ? "×" : "☰"}</button>
        </div>
      </div>
      {open ? (
        <div className="mobile-menu">
          <div className="container mobile-menu-inner">
            {nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
            <Link href="/cart" onClick={() => setOpen(false)}>{pt.nav.cart} ({count})</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
