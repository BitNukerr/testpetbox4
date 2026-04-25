"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartItem, getCart, setCart } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";

function getCartImage(item: CartItem) {
  if (item.image) return item.image;
  if (item.type === "plan") return "/images/box-generic.svg";
  if (item.species === "cat") return "/images/cat-box.svg";
  if (item.species === "dog") return "/images/dog-box.svg";
  return "/images/box-generic.svg";
}

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => { const refresh = () => setItems(getCart()); refresh(); window.addEventListener("petbox-cart-changed", refresh); return () => window.removeEventListener("petbox-cart-changed", refresh); }, []);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  function updateQty(id: string, quantity: number) { setCart(items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)); }
  function removeItem(id: string) { setCart(items.filter((item) => item.id !== id)); }
  const shipping = subtotal > 0 ? 8 : 0;

  return (
    <div className="container section-grid cart-layout">
      <div>
        {items.length === 0 ? <div className="card"><div className="card-body empty-cart"><h2>{pt.cart.emptyTitle}</h2><p className="muted">{pt.cart.emptyText}</p><Link href="/shop" className="btn">{pt.cart.shopNow}</Link></div></div> : items.map((item) => (
          <article key={item.id} className="card cart-item-card">
            <div className="cart-media-wrap"><img src={getCartImage(item)} alt={item.title} className="cart-thumb" /></div>
            <div className="cart-main">
              <div className="cart-copy-top"><span className="tag">{item.type === "plan" ? pt.cart.subscription : item.type === "custom-box" ? pt.cart.customBox : item.category || pt.cart.product}</span><h3>{item.title}</h3><p className="muted cart-subline">{item.category || "PetBox"}{item.cadence ? ` • ${item.cadence === "monthly" ? pt.configure.monthly : pt.configure.quarterly}` : ""}{item.species ? ` • ${item.species === "dog" ? pt.configure.dog : item.species === "cat" ? pt.configure.cat : "Cão + gato"}` : ""}</p></div>
              {item.metadata ? <div className="cart-meta-row">{Object.entries(item.metadata).map(([key, value]) => value ? <span key={key} className="meta-pill"><strong>{key}</strong>: {value}</span> : null)}</div> : null}
            </div>
            <div className="cart-actions"><div className="qty-row" aria-label={`${pt.common.quantity}: ${item.title}`}><button onClick={() => updateQty(item.id, item.quantity - 1)} aria-label="Diminuir quantidade">-</button><span>{item.quantity}</span><button onClick={() => updateQty(item.id, item.quantity + 1)} aria-label="Aumentar quantidade">+</button></div><strong className="cart-price">{money(item.price * item.quantity)}</strong><button className="link-btn remove-btn" onClick={() => removeItem(item.id)}>{pt.common.remove}</button></div>
          </article>
        ))}
      </div>
      <aside className="card summary-card"><div className="card-body"><h3>{pt.cart.orderSummary}</h3><p className="muted">{pt.cart.orderText}</p><div className="summary-line"><span>{pt.common.subtotal}</span><strong>{money(subtotal)}</strong></div><div className="summary-line"><span>{pt.common.shipping}</span><strong>{money(shipping)}</strong></div><div className="summary-line total"><span>{pt.common.total}</span><strong>{money(subtotal + shipping)}</strong></div><Link href="/checkout" className="btn full">{pt.common.checkout}</Link></div></aside>
    </div>
  );
}
