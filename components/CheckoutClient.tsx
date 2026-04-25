"use client";

import { useEffect, useMemo, useState } from "react";
import { getCart } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";

export default function CheckoutClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setItems(getCart()); }, []);
  const total = useMemo(() => { const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0); return subtotal + (subtotal > 0 ? 8 : 0); }, [items]);

  async function startCheckout() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout falhou.");
      window.location.href = data.url;
    } catch (err: any) { setError(err.message || "Checkout falhou."); setLoading(false); }
  }

  return (
    <div className="container section-grid">
      <div className="card"><div className="card-body"><h2>{pt.checkout.title}</h2><p className="muted">{pt.checkout.intro}</p><div className="form-grid"><input placeholder={pt.checkout.firstName} defaultValue="Rodrigo" /><input placeholder={pt.checkout.lastName} defaultValue="Leite" /><input placeholder={pt.checkout.email} defaultValue="cliente@example.com" className="span-2" /><input placeholder={pt.checkout.address} defaultValue="Rua Principal 123" className="span-2" /><input placeholder={pt.checkout.city} defaultValue="Lisboa" /><input placeholder={pt.checkout.zip} defaultValue="1000-001" /></div>{error ? <p className="error-text">{error}</p> : null}<button className="btn" disabled={items.length === 0 || loading} onClick={startCheckout}>{loading ? pt.checkout.redirecting : pt.checkout.pay}</button></div></div>
      <aside className="card summary-card"><div className="card-body"><h3>{pt.common.summary}</h3>{items.map((item) => <div key={item.id} className="summary-line"><span>{item.title} × {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>)}<div className="summary-line total"><span>{pt.common.total}</span><strong>{money(total)}</strong></div></div></aside>
    </div>
  );
}
