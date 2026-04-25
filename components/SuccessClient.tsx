"use client";

import { useEffect, useState } from "react";

export default function SuccessClient({ paymentId }: { paymentId: string }) {
  const [status, setStatus] = useState("A verificar a encomenda...");

  useEffect(() => {
    if (paymentId) {
      setStatus("Sucesso! A sua encomenda foi confirmada e associada à sua conta.");
      return;
    }
    setStatus("A encomenda foi recebida. Se o pagamento não aparecer, tente novamente a partir do carrinho.");
  }, [paymentId]);

  return <p>{status}</p>;
}
