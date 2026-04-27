"use client";

import { useState } from "react";
import { adminStore } from "@/lib/admin-store";
import type { AdminSubscription } from "@/data/admin";

const emptySub: AdminSubscription = {
  id: "",
  customer: "",
  plan: "Mensal",
  pet: "Cão",
  renewal: new Date().toISOString().slice(0, 10),
  status: "Ativa",
  value: 0
};

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

export default function AdminSubscriptionsClient() {
  const [subs, setSubs] = useState<AdminSubscription[]>(() => adminStore.subscriptions.get());
  const [editing, setEditing] = useState<AdminSubscription | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AdminSubscription>(emptySub);
  const [message, setMessage] = useState("");

  function save(next: AdminSubscription[], text: string) {
    setSubs(next);
    adminStore.subscriptions.set(next);
    setMessage(text);
  }

  function startNew() {
    setEditing(null);
    setFormOpen(true);
    setForm({ ...emptySub, id: `SUB-${Date.now().toString().slice(-4)}` });
    setMessage("");
  }

  function startEdit(sub: AdminSubscription) {
    setEditing(sub);
    setFormOpen(true);
    setForm(sub);
    setMessage("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(emptySub);
  }

  function saveSub() {
    if (!form.id || !form.customer) {
      setMessage("Preencha ID e cliente.");
      return;
    }
    const sub = { ...form, value: Number(form.value) };
    const exists = subs.some((item) => item.id === sub.id);
    save(exists ? subs.map((item) => item.id === sub.id ? sub : item) : [sub, ...subs], exists ? "Subscricao actualizada." : "Subscricao criada.");
    setEditing(sub);
    setFormOpen(false);
  }

  function deleteSub(id: string) {
    save(subs.filter((item) => item.id !== id), "Subscricao removida.");
    closeForm();
  }

  function resetSubs() {
    adminStore.subscriptions.reset();
    setSubs(adminStore.subscriptions.get());
    closeForm();
    setMessage("Subscricoes repostas.");
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div><h2 className="h4 mb-1">Subscricoes</h2><div className="text-muted">Crie, edite, pause e remova planos mensais ou trimestrais.</div></div>
        <div className="d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={startNew}>Nova subscricao</button><button className="admin-action-btn" onClick={resetSubs}>Repor subscricoes</button></div>
      </div>
      {formOpen ? <div className="card-body">
        <div className="row g-3">
          <div className="col-md-2"><label className="form-label fw-bold">ID</label><input className="admin-form-control" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Cliente</label><input className="admin-form-control" value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></div>
          <div className="col-md-2"><label className="form-label fw-bold">Plano</label><select className="admin-form-control" value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value as AdminSubscription["plan"] })}><option>Mensal</option><option>Trimestral</option></select></div>
          <div className="col-md-2"><label className="form-label fw-bold">Pet</label><select className="admin-form-control" value={form.pet} onChange={(event) => setForm({ ...form, pet: event.target.value as AdminSubscription["pet"] })}><option>Cão</option><option>Gato</option></select></div>
          <div className="col-md-2"><label className="form-label fw-bold">Valor</label><input className="admin-form-control" type="number" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Renovacao</label><input className="admin-form-control" value={form.renewal} onChange={(event) => setForm({ ...form, renewal: event.target.value })} /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Estado</label><select className="admin-form-control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AdminSubscription["status"] })}><option>Ativa</option><option>Pausada</option><option>Cancelamento agendado</option></select></div>
          <div className="col-12 d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={saveSub}>{editing ? "Guardar subscricao" : "Criar subscricao"}</button><button className="admin-action-btn" onClick={closeForm}>Fechar</button></div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div> : message ? <div className="card-body"><p className="text-muted mb-0">{message}</p></div> : null}
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Animal</th><th>Plano</th><th>Renovacao</th><th>Estado</th><th>Valor</th><th /></tr></thead>
          <tbody>{subs.map((sub) => <tr key={sub.id}><td className="fw-bold">{sub.id}</td><td>{sub.customer}</td><td>{sub.pet}</td><td>{sub.plan}</td><td>{sub.renewal}</td><td><span className={`admin-pill ${sub.status === "Ativa" ? "admin-pill-success" : "admin-pill-warning"}`}>{sub.status}</span></td><td className="fw-bold">{money(sub.value)}</td><td className="d-flex justify-content-end gap-2"><button className="admin-action-btn" onClick={() => startEdit(sub)}>Editar</button><button className="admin-action-btn" onClick={() => deleteSub(sub.id)}>Remover</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
