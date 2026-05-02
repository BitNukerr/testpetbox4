"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartItem, getCart, setCart } from "@/lib/client-store";
import { loadRemoteStoreSettings } from "@/lib/admin-db";
import { adminStore } from "@/lib/admin-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";

function getCartImage(item: CartItem) {
  if (item.image) return item.image;
  if (item.type === "plan") return "/images/box-generic.svg";
  if (item.species === "cat") return "/images/cat-box.svg";
  if (item.species === "dog") return "/images/dog-box.svg";
  return "/images/box-generic.svg";
}

function speciesLabel(species?: CartItem["species"]) {
  if (species === "dog") return pt.configure.dog;
  if (species === "cat") return pt.configure.cat;
  if (species === "both") return pt.configure.both;
  return "";
}

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState(() => adminStore.settings.get());
  useEffect(() => { const refresh = () => setItems(getCart()); refresh(); window.addEventListener("petbox-cart-changed", refresh); return () => window.removeEventListener("petbox-cart-changed", refresh); }, []);
  useEffect(() => {
    const refresh = () => setSettings(adminStore.settings.get());
    refresh();
    loadRemoteStoreSettings(adminStore.settings.get())
      .then((remoteSettings) => {
        setSettings(remoteSettings);
        adminStore.settings.set(remoteSettings);
      })
      .catch(() => null);
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const shipping = subtotal > 0 ? Number(settings.shippingPrice || 0) : 0;

  function updateQty(id: string, quantity: number) {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setCart(items.map((item) => item.id === id ? { ...item, quantity } : item));
  }

  function removeItem(id: string) {
    setCart(items.filter((item) => item.id !== id));
  }

  return (
    <div className="container section-grid cart-layout">
      <div>
        {items.length === 0 ? (
          <div className="card"><div className="card-body empty-cart"><h2>{pt.cart.emptyTitle}</h2><p className="muted">{pt.cart.emptyText}</p><Link href="/loja" className="btn">{pt.cart.shopNow}</Link></div></div>
        ) : items.map((item) => (
          <article key={item.id} className="card cart-item-card">
            <div className="cart-media-wrap"><img src={getCartImage(item)} alt={item.title} className="cart-thumb" /></div>
            <div className="cart-main">
              <div className="cart-copy-top">
                <span className="tag">{item.type === "plan" ? pt.cart.subscription : item.type === "custom-box" ? pt.cart.customBox : item.category || pt.cart.product}</span>
                <h3>{item.title}</h3>
                <p className="muted cart-subline">{item.category || "PetBox"}{item.cadence ? ` | ${item.cadence === "monthly" ? pt.configure.monthly : pt.configure.quarterly}` : ""}{speciesLabel(item.species) ? ` | ${speciesLabel(item.species)}` : ""}</p>
              </div>
              {item.metadata ? <div className="cart-meta-row">{Object.entries(item.metadata).map(([key, value]) => value ? <span key={key} className="meta-pill"><strong>{key}</strong>: {value}</span> : null)}</div> : null}
            </div>
            <div className="cart-actions">
              <div className="qty-row" aria-label={`${pt.common.quantity}: ${item.title}`}><button onClick={() => updateQty(item.id, item.quantity - 1)} aria-label="Diminuir quantidade">-</button><span>{item.quantity}</span><button onClick={() => updateQty(item.id, item.quantity + 1)} aria-label="Aumentar quantidade">+</button></div>
              <strong className="cart-price">{money(item.price * item.quantity)}</strong>
              <button className="link-btn remove-btn" onClick={() => removeItem(item.id)}>{pt.common.remove}</button>
            </div>
          </article>
        ))}
      </div>
      <aside className="card summary-card"><div className="card-body"><h3>{pt.cart.orderSummary}</h3><p className="muted">{pt.cart.orderText}</p><div className="summary-line"><span>{pt.common.subtotal}</span><strong>{money(subtotal)}</strong></div><div className="summary-line"><span>{pt.common.shipping}</span><strong>{money(shipping)}</strong></div><div className="summary-line total"><span>{pt.common.total}</span><strong>{money(subtotal + shipping)}</strong></div><Link href="/pagamento" className="btn full">{pt.common.checkout}</Link></div></aside>
    </div>
  );
}
