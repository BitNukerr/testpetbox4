"use client";

import { useEffect, useState } from "react";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((data) => setUnlocked(Boolean(data.authenticated)))
      .catch(() => setUnlocked(false))
      .finally(() => setChecking(false));
  }, []);

  async function unlock(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Codigo de acesso invalido.");
      return;
    }

    setUnlocked(true);
  }

  if (checking) return null;
  if (unlocked) return <>{children}</>;

  return (
    <section className="admin-login-shell">
      <form className="admin-login-card" onSubmit={unlock}>
        <span className="admin-pill admin-pill-info">Admin</span>
        <h1>Area administrativa PetBox</h1>
        <p className="text-muted">Introduza o codigo de acesso para abrir o painel.</p>
        <input className="admin-form-control" type="password" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Codigo de acesso" autoComplete="current-password" />
        {error ? <p className="admin-error">{error}</p> : null}
        <button className="admin-action-btn mt-3" disabled={loading}>{loading ? "A entrar..." : "Entrar"}</button>
      </form>
    </section>
  );
}
