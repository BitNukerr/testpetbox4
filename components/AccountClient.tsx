"use client";

import { useEffect, useState } from "react";
import { getCustomerId, getOrders } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";
import AuthClient from "@/components/AuthClient";

type SubscriptionInfo = { id?: string; status?: string; customerId?: string; };

export default function AccountClient() {
  const [orders, setOrders] = useState(getOrders());
  const [customerId, setCustomer] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionInfo>({});
  const [loading, setLoading] = useState<"" | "manage" | "billing">("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const refresh = () => { setOrders(getOrders()); setCustomer(getCustomerId()); };
    refresh();
    window.addEventListener("petbox-orders-changed", refresh);
    window.addEventListener("petbox-customer-changed", refresh);
    return () => { window.removeEventListener("petbox-orders-changed", refresh); window.removeEventListener("petbox-customer-changed", refresh); };
  }, []);

  useEffect(() => {
    async function load() {
      if (!customerId) return;
      const res = await fetch("/api/customer-subscription", { method: "POST", headers: { "Content-Type": "application/json"}, body: JSON.stringify({ customerId }) });
      const data = await res.json();
      if (res.ok) setSubscription(data);
    }
    load();
  }, [customerId]);

  async function openPortal(type: "manage" | "billing") {
    if (!customerId) { setMessage(pt.account.completeCheckout); return; }
    setLoading(type); setMessage("");
    try {
      const res = await fetch("/api/billing-portal", { method: "POST", headers: { "Content-Type": "application/json"}, body: JSON.stringify({ customerId, returnPath: "/account" }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Não foi possível abrir o portal.");
      window.location.href = data.url;
    } catch (err: any) { setMessage(err.message || "Não foi possível abrir o portal."); setLoading(""); }
  }

  return (
    <div className="container section-grid">
      <div className="account-stack">
        <AuthClient />
        <div className="card"><div className="card-body">
          <h2>{pt.account.subscription}</h2>
          <div className="detail-box">
            <p><strong>{pt.account.status}:</strong> {subscription.status || pt.account.noSubscription}</p>
            <p><strong>{pt.account.customer}:</strong> {customerId || pt.account.notConnected}</p>
            <p><strong>{pt.account.subscriptionId}:</strong> {subscription.id || "—"}</p>
          </div>
          <div className="action-row wrap">
            <button className="btn" onClick={() => openPortal("manage")} disabled={loading !== ""}>{loading === "manage" ? pt.common.loading : pt.account.manage}</button>
            <button className="btn btn-secondary" onClick={() => openPortal("billing")} disabled={loading !== ""}>{loading === "billing" ? pt.common.loading : pt.account.billing}</button>
          </div>
          {message ? <p className="error-text">{message}</p> : null}
        </div></div>
      </div>
      <div className="card"><div className="card-body">
        <h2>{pt.account.recentOrders}</h2>
        {orders.length === 0 ? <p className="muted">{pt.account.noOrders}</p> : orders.map((order) => (
          <div className="order-row" key={order.id}><div><strong>{order.title}</strong><p className="muted">{order.date} • {order.status}</p></div><strong>{money(order.total)}</strong></div>
        ))}
      </div></div>
    </div>
  );
}
