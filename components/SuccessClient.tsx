"use client";

import { useEffect, useState } from "react";
import { saveOrder, setCart, setCustomerId } from "@/lib/client-store";

export default function SuccessClient({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState("A verificar a encomenda...");

  useEffect(() => {
    async function run() {
      if (!sessionId) { setStatus("Falta o ID da sessão Stripe."); return; }
      const res = await fetch("/api/checkout/session", { method: "POST", headers: { "Content-Type": "application/json"}, body: JSON.stringify({ sessionId }) });
      const data = await res.json();
      if (!res.ok) { setStatus(data.error || "Não foi possível verificar a sessão."); return; }
      if (data.customerId) setCustomerId(data.customerId);
      saveOrder({ id: data.sessionId, title: data.subscriptionId ? "Encomenda de subscrição" : "Encomenda da loja", total: (data.amountTotal || 0) / 100, date: new Date().toLocaleDateString("pt-PT"), status: "Confirmada", stripeCustomerId: data.customerId, stripeSubscriptionId: data.subscriptionId, stripeSessionId: data.sessionId });
      setCart([]);
      setStatus("Sucesso! A sua encomenda foi confirmada e associada à conta de demonstração.");
    }
    run();
  }, [sessionId]);

  return <p>{status}</p>;
}
