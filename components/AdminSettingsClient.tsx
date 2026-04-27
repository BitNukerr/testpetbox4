"use client";

import { useState } from "react";
import { adminStore, type StoreSettings } from "@/lib/admin-store";
import { money } from "@/lib/helpers";

export default function AdminSettingsClient() {
  const [form, setForm] = useState<StoreSettings>(() => adminStore.settings.get());
  const [message, setMessage] = useState("");

  function update(field: keyof StoreSettings, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function save() {
    const next = { ...form, shippingPrice: Math.max(0, Number(form.shippingPrice) || 0) };
    adminStore.settings.set(next);
    setForm(next);
    setMessage("Definicoes guardadas neste browser.");
  }

  function resetAll() {
    adminStore.resetAll();
    setForm(adminStore.settings.get());
    setMessage("Dados demo repostos em todo o painel.");
  }

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="admin-card">
          <div className="card-header">
            <h2 className="h4 mb-1">Definicoes da loja</h2>
            <div className="text-muted">Configuracao basica do painel administrativo.</div>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Nome da loja</label>
                <input className="admin-form-control" value={form.storeName} onChange={(event) => update("storeName", event.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Email de suporte</label>
                <input className="admin-form-control" value={form.email} onChange={(event) => update("email", event.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Preco de envio</label>
                <input className="admin-form-control" type="number" min="0" step="0.01" value={form.shippingPrice} onChange={(event) => update("shippingPrice", Number(event.target.value))} />
                <div className="text-muted small mt-2">Use 0 para envio gratis. Valor actual: {money(Number(form.shippingPrice) || 0)}</div>
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Mensagem interna</label>
                <textarea className="admin-form-control" rows={4} value={form.note} onChange={(event) => update("note", event.target.value)} />
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap mt-4">
              <button className="admin-action-btn" onClick={save}>Guardar alteracoes</button>
              <button className="admin-action-btn" onClick={resetAll}>Repor dados demo</button>
            </div>
            {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
          </div>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="admin-card">
          <div className="card-header">
            <h2 className="h5 mb-1">Integracoes</h2>
            <div className="text-muted small">Estado previsto das integracoes.</div>
          </div>
          <div className="card-body d-grid gap-3">
            <div className="d-flex justify-content-between align-items-center border rounded-4 p-3"><div><strong>Supabase</strong><div className="text-muted small">Auth e base de dados</div></div><span className="admin-pill admin-pill-success">Configurado</span></div>
            <div className="d-flex justify-content-between align-items-center border rounded-4 p-3"><div><strong>Easypay</strong><div className="text-muted small">MB WAY e checkout</div></div><span className="admin-pill admin-pill-info">Preparado</span></div>
            <div className="d-flex justify-content-between align-items-center border rounded-4 p-3"><div><strong>Resend</strong><div className="text-muted small">Emails do formulario</div></div><span className="admin-pill admin-pill-success">Configurado</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
