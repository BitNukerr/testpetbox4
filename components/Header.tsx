"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/client-store";
import { pt } from "@/lib/translations";

const nav = [[pt.nav.shop, "/shop"], [pt.nav.build, "/configure"], [pt.nav.journal, "/journal"], [pt.nav.about, "/about"], [pt.nav.contact, "/contact"], [pt.nav.account, "/account"]] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
    refresh();
    window.addEventListener("petbox-cart-changed", refresh);
    return () => window.removeEventListener("petbox-cart-changed", refresh);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand">
          <span className="brand-badge">🐾</span>
          <span><strong>PetBox</strong><small>{pt.brand.tagline}</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">{nav.map(([label, href]) => <Link key={href} href={href} className="nav-link">{label}</Link>)}</nav>
        <div className="header-actions">
          <Link href="/cart" className="cart-pill">{pt.nav.cart} <span>{count}</span></Link>
          <button className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Abrir menu" aria-expanded={open}>{open ? "✕" : "☰"}</button>
        </div>
      </div>
      {open ? <div className="mobile-menu"><div className="container mobile-menu-inner">{nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}<Link href="/cart" onClick={() => setOpen(false)}>{pt.nav.cart} ({count})</Link></div></div> : null}
    </header>
  );
}
