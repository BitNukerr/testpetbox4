"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/client-store";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";

const publicNav = [
  [pt.nav.shop, "/shop"],
  [pt.nav.build, "/configure"],
  [pt.nav.journal, "/journal"],
  [pt.nav.about, "/about"],
  [pt.nav.contact, "/contact"]
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(!isSupabaseConfigured());

  useEffect(() => {
    const refresh = () => {
      const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
      setCount(total);
    };
    refresh();
    window.addEventListener("petbox-cart-changed", refresh);
    return () => window.removeEventListener("petbox-cart-changed", refresh);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSignedIn(Boolean(data.session));
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setAuthChecked(true);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const accountLabel = signedIn ? pt.nav.account : pt.nav.login;

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand">
          <img src="/favicon.svg" alt="" className="brand-logo brand-logo-badge" />
          <span>
            <strong><span>Pet</span>Box</strong>
            <small>{pt.brand.tagline}</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navegação principal">
          {publicNav.map(([label, href]) => (
            <Link key={href} href={href} className="nav-link">{label}</Link>
          ))}
          {authChecked ? <Link href={signedIn ? "/account" : "/login"} className="nav-link">{accountLabel}</Link> : null}
        </nav>

        <div className="header-actions">
          <Link href="/cart" className="cart-pill">{pt.nav.cart} <span>{count}</span></Link>
          <button className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Abrir menu" aria-expanded={open}>
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mobile-menu">
          <div className="container mobile-menu-inner">
            {publicNav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
            {authChecked ? <Link href={signedIn ? "/account" : "/login"} onClick={() => setOpen(false)}>{accountLabel}</Link> : null}
            <Link href="/cart" onClick={() => setOpen(false)}>{pt.nav.cart} ({count})</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
