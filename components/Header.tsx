"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/client-store";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";

const publicNav = [
  [pt.nav.shop, "/loja"],
  [pt.nav.build, "/criar-caixa"],
  [pt.nav.journal, "/blog"],
  [pt.nav.about, "/sobre"],
  [pt.nav.contact, "/contacto"]
] as const;

function CartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6h14l-1.4 7.2a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.2 3.8H3" /><circle cx="9.5" cy="19" r="1.4" /><circle cx="17" cy="19" r="1.4" /></svg>;
}

function AccountIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>;
}

function LogoutIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" /><path d="M15 8l4 4-4 4" /><path d="M9 12h10" /></svg>;
}

function MenuIcon({ open }: { open: boolean }) {
  return open
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export default function Header() {
  const pathname = usePathname();
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

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand">
          <img src="/dog-paw.png" alt="" className="brand-logo" />
          <span>
            <strong><span>Pet</span>Box</strong>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navegacao principal">
          {publicNav.map(([label, href]) => (
            <Link key={href} href={href} className="nav-link">{label}</Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/carrinho" className="icon-btn cart-icon-btn" aria-label={`${pt.nav.cart}: ${count} item${count === 1 ? "" : "s"}`}>
            <CartIcon />
            {count ? <span>{count}</span> : null}
          </Link>
          {authChecked ? (
            <Link href="/conta" className="icon-btn" aria-label={accountLabel}>
              <AccountIcon />
            </Link>
          ) : null}
          {signedIn ? (
            <button className="icon-btn" onClick={signOut} aria-label={pt.account.signOut}>
              <LogoutIcon />
            </button>
          ) : null}
          <button className="menu-btn icon-btn" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu" aria-expanded={open}>
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="mobile-menu">
          <div className="container mobile-menu-inner">
            {publicNav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
            {authChecked ? <Link href="/conta" onClick={() => setOpen(false)}>{accountLabel}</Link> : null}
            <Link href="/carrinho" onClick={() => setOpen(false)}>{pt.nav.cart} ({count})</Link>
            {signedIn ? <button className="mobile-logout" onClick={() => { setOpen(false); signOut(); }}>{pt.account.signOut}</button> : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
