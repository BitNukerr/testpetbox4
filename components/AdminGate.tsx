"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "petbox-admin-unlocked";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function unlock() {
    const expected = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || "petbox-admin";
    if (code.trim() !== expected) {
      setError("Código de acesso inválido.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, "true");
    setUnlocked(true);
  }

  if (unlocked) return <>{children}</>;

  return (
    <section className="admin-login-shell">
      <div className="admin-login-card">
        <span className="admin-pill admin-pill-info">Admin</span>
        <h1>Área administrativa PetBox</h1>
        <p className="text-muted">Introduza o código de acesso para abrir o painel.</p>
        <input className="admin-form-control" type="password" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código de acesso" />
        {error ? <p className="admin-error">{error}</p> : null}
        <button className="admin-action-btn mt-3" onClick={unlock}>Entrar</button>
      </div>
    </section>
  );
}
