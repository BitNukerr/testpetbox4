"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CheckoutError, CheckoutInstance, CheckoutOutput, CheckoutPaymentError } from "@easypaypt/checkout-sdk";
import { getCart, saveOrder, setCart } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";

export default function CheckoutClient() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutReady, setCheckoutReady] = useState(false);
  const checkoutRef = useRef<CheckoutInstance | null>(null);
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: ""
  });

  useEffect(() => { setItems(getCart()); }, []);
  useEffect(() => () => { checkoutRef.current?.unmount(); }, []);

  const total = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return subtotal + (subtotal > 0 ? 8 : 0);
  }, [items]);

  function updateCustomer(field: keyof typeof customer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function getCheckoutErrorMessage(err: CheckoutError | CheckoutPaymentError) {
    if (err.code === "checkout-expired") return "A sessão de pagamento expirou. Tente novamente.";
    if (err.code === "checkout-canceled") return "O pagamento foi cancelado. Pode tentar novamente.";
    if (err.code === "already-paid") return "Este pagamento já foi concluído.";
    if (err.code === "payment-failure") return "O pagamento falhou. Verifique os dados e tente novamente.";
    return "Não foi possível concluir o pagamento.";
  }

  async function startCheckout() {
    setLoading(true);
    setError("");
    setCheckoutReady(false);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer })
      });
      const data = await res.json();
      if (!res.ok || !data.manifest) throw new Error(data.error || "Não foi possível iniciar o pagamento.");

      checkoutRef.current?.unmount();
      const { startCheckout: startEasypayCheckout } = await import("@easypaypt/checkout-sdk");
      checkoutRef.current = startEasypayCheckout(data.manifest, {
        id: "easypay-checkout",
        display: "inline",
        language: "pt_PT",
        testing: data.testing,
        showLoading: true,
        hideSubscriptionSummary: true,
        logoUrl: `${window.location.origin}/favicon.svg`,
        backgroundColor: "#fff9f3",
        accentColor: "#231f1b",
        buttonBackgroundColor: "#231f1b",
        buttonBorderRadius: 24,
        inputBorderRadius: 16,
        buttonBoxShadow: false,
        onSuccess: (info: CheckoutOutput) => {
          const paymentId = info.payment.id || info.id;
          saveOrder({
            id: paymentId,
            title: "Encomenda PetBox",
            total: info.payment.value || total,
            date: new Date().toLocaleDateString("pt-PT"),
            status: "Confirmada",
            easypayCheckoutId: info.id,
            easypayPaymentId: paymentId,
            paymentMethod: info.payment.method
          });
          setCart([]);
          router.push(`/success?payment_id=${encodeURIComponent(paymentId)}`);
        },
        onError: (checkoutError: CheckoutError) => {
          setError(getCheckoutErrorMessage(checkoutError));
          setLoading(false);
        },
        onPaymentError: (paymentError: CheckoutPaymentError) => {
          setError(getCheckoutErrorMessage(paymentError));
          setLoading(false);
        },
        onClose: () => setLoading(false)
      });
      setCheckoutReady(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Não foi possível iniciar o pagamento.");
      setLoading(false);
    }
  }

  return (
    <div className="container section-grid">
      <div className="card">
        <div className="card-body">
          <h2>{pt.checkout.title}</h2>
          <p className="muted">{pt.checkout.intro}</p>
          <p className="muted">{pt.checkout.mbWayAvailable}</p>
          <div className="form-grid">
            <input placeholder={pt.checkout.firstName} value={customer.firstName} onChange={(event) => updateCustomer("firstName", event.target.value)} />
            <input placeholder={pt.checkout.lastName} value={customer.lastName} onChange={(event) => updateCustomer("lastName", event.target.value)} />
            <input placeholder={pt.checkout.email} value={customer.email} onChange={(event) => updateCustomer("email", event.target.value)} className="span-2" />
            <input placeholder={pt.checkout.phone} value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} className="span-2" />
            <input placeholder={pt.checkout.address} value={customer.address} onChange={(event) => updateCustomer("address", event.target.value)} className="span-2" />
            <input placeholder={pt.checkout.city} value={customer.city} onChange={(event) => updateCustomer("city", event.target.value)} />
            <input placeholder={pt.checkout.zip} value={customer.zip} onChange={(event) => updateCustomer("zip", event.target.value)} />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="btn checkout-pay-btn" disabled={items.length === 0 || loading} onClick={startCheckout}>
            {loading ? pt.checkout.loading : pt.checkout.pay}
          </button>
          <div id="easypay-checkout" className={checkoutReady ? "easypay-checkout-shell is-ready" : "easypay-checkout-shell"} />
        </div>
      </div>
      <aside className="card summary-card">
        <div className="card-body">
          <h3>{pt.common.summary}</h3>
          {items.map((item) => (
            <div key={item.id} className="summary-line">
              <span>{item.title} × {item.quantity}</span>
              <strong>{money(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="summary-line total"><span>{pt.common.total}</span><strong>{money(total)}</strong></div>
        </div>
      </aside>
    </div>
  );
}
