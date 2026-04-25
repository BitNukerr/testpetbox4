"use client";

import { useState } from "react";
import { adminStore } from "@/lib/admin-store";

export default function AdminSettingsClient() {
  const [storeName, setStoreName] = useState("PetBox");
  const [email, setEmail] = useState("rodrigoleite.96@gmail.com");
  const [note, setNote] = useState("Painel preparado para ligar a Supabase, Easypay e gestão real de encomendas.");
  const [message, setMessage] = useState("");

  function save() {
    localStorage.setItem("petbox-admin-settings", JSON.stringify({ storeName, email, note }));
    setMessage("Definições guardadas neste browser.");
  }

  function resetAll() {
    adminStore.resetAll();
    setMessage("Dados demo repostos em todo o painel.");
  }

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="admin-card">
          <div className="card-header"><h2 className="h4 mb-1">Definições da loja</h2><div className="text-muted">Configuração básica do painel administrativo.</div></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label fw-bold">Nome da loja</label><input className="admin-form-control" value={storeName} onChange={(event) => setStoreName(event.target.value)} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Email de suporte</label><input className="admin-form-control" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
              <div className="col-12"><label className="form-label fw-bold">Mensagem interna</label><textarea className="admin-form-control" rows={4} value={note} onChange={(event) => setNote(event.target.value)} /></div>
            </div>
            <div className="d-flex gap-2 flex-wrap mt-4"><button className="admin-action-btn" onClick={save}>Guardar alterações</button><button className="admin-action-btn" onClick={resetAll}>Repor dados demo</button></div>
            {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
          </div>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="admin-card">
          <div className="card-header"><h2 className="h5 mb-1">Integrações</h2><div className="text-muted small">Estado previsto das integrações.</div></div>
          <div className="card-body d-grid gap-3">
            <div className="d-flex justify-content-between align-items-center border rounded-4 p-3"><div><strong>Supabase</strong><div className="text-muted small">Auth e base de dados</div></div><span className="admin-pill admin-pill-success">Configurado</span></div>
            <div className="d-flex justify-content-between align-items-center border rounded-4 p-3"><div><strong>Easypay</strong><div className="text-muted small">MB WAY e checkout</div></div><span className="admin-pill admin-pill-info">Preparado</span></div>
            <div className="d-flex justify-content-between align-items-center border rounded-4 p-3"><div><strong>Resend</strong><div className="text-muted small">Emails do formulário</div></div><span className="admin-pill admin-pill-success">Configurado</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
