"use client";

import { useEffect, useState } from "react";
import { getCustomerId, getOrders } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";
import AuthClient from "@/components/AuthClient";

type SubscriptionInfo = { id?: string; status?: string; customerId?: string; };
type UserState = { email?: string } | null;

export default function AccountClient() {
  const [orders, setOrders] = useState(() => getOrders());
  const [customerId, setCustomer] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionInfo>({});
  const [user, setUser] = useState<UserState>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setAuthChecked(true);
      return;
    }

    let mounted = true;
    let initialSessionLoaded = false;

    const applySession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (!mounted) return;
      setUser(session?.user ? { email: session.user.email || "" } : null);
      setAuthChecked(true);
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

  useEffect(() => {
    const refresh = () => { setOrders(getOrders()); setCustomer(getCustomerId()); };
    refresh();
    window.addEventListener("petbox-orders-changed", refresh);
    window.addEventListener("petbox-customer-changed", refresh);
    return () => { window.removeEventListener("petbox-orders-changed", refresh); window.removeEventListener("petbox-customer-changed", refresh); };
  }, []);

  useEffect(() => {
    async function load() {
      if (!customerId || !user) return;
      const res = await fetch("/api/customer-subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerId }) });
      const data = await res.json();
      if (res.ok) setSubscription(data);
    }
    load();
  }, [customerId, user]);

  if (!authChecked) {
    return (
      <div className="container narrow">
        <div className="card"><div className="card-body">
          <h2>{pt.common.loading}</h2>
          <p className="muted">{pt.account.checkingSession}</p>
        </div></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container narrow">
        <div className="section-heading">
          <div><span className="eyebrow">{pt.nav.login}</span><h1>{pt.pages.loginTitle}</h1></div>
        </div>
        <AuthClient />
        <p className="muted account-note">{authChecked ? pt.account.loginRequired : pt.common.loading}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container section-heading">
        <div><span className="eyebrow">{pt.nav.account}</span><h1>{pt.pages.accountTitle}</h1></div>
      </div>
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
          </div></div>
        </div>
        <div className="card"><div className="card-body">
          <h2>{pt.account.recentOrders}</h2>
          {orders.length === 0 ? <p className="muted">{pt.account.noOrders}</p> : orders.map((order) => (
            <div className="order-row" key={order.id}><div><strong>{order.title}</strong><p className="muted">{order.date} • {order.status}</p></div><strong>{money(order.total)}</strong></div>
          ))}
        </div></div>
      </div>
    </>
  );
}
