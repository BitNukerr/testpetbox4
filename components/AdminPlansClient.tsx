"use client";

import { useMemo, useState } from "react";
import type { Plan } from "@/data/products";
import { adminStore, slugify } from "@/lib/admin-store";

const emptyPlan: Plan = {
  id: "",
  name: "",
  cadence: "monthly",
  price: 0,
  description: "",
  perks: []
};

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function cadenceLabel(cadence: Plan["cadence"]) {
  return cadence === "monthly" ? "Mensal" : "Trimestral";
}

export default function AdminPlansClient() {
  const [plans, setPlans] = useState<Plan[]>(() => adminStore.plans.get());
  const [editing, setEditing] = useState<Plan | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Plan>(emptyPlan);
  const [perksText, setPerksText] = useState("");
  const [message, setMessage] = useState("");

  const sortedPlans = useMemo(() => [...plans].sort((a, b) => a.price - b.price), [plans]);

  function startNew() {
    setEditing(null);
    setFormOpen(true);
    setForm(emptyPlan);
    setPerksText("");
    setMessage("");
  }

  function startEdit(plan: Plan) {
    setEditing(plan);
    setFormOpen(true);
    setForm(plan);
    setPerksText(plan.perks.join("\n"));
    setMessage("");
  }

  function savePlans(next: Plan[], text: string) {
    setPlans(next);
    adminStore.plans.set(next);
    setMessage(text);
  }

  function savePlan() {
    const id = form.id || slugify(form.name);
    if (!id || !form.name || !form.description) {
      setMessage("Preencha pelo menos nome, id e descricao.");
      return;
    }

    const plan: Plan = {
      ...form,
      id,
      price: Number(form.price),
      perks: perksText.split(/\r?\n/).map((perk) => perk.trim()).filter(Boolean)
    };
    const exists = plans.some((item) => item.id === id);
    const next = exists ? plans.map((item) => item.id === id ? plan : item) : [...plans, plan];
    savePlans(next, exists ? "Plano actualizado." : "Plano criado.");
    setEditing(plan);
    setForm(plan);
    setFormOpen(false);
  }

  function deletePlan(id: string) {
    savePlans(plans.filter((plan) => plan.id !== id), "Plano removido.");
    startNew();
  }

  function resetPlans() {
    adminStore.plans.reset();
    setPlans(adminStore.plans.get());
    startNew();
    setFormOpen(false);
    setMessage("Planos repostos.");
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Planos</h2>
          <div className="text-muted">Crie, edite, remova e reponha planos de subscricao.</div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="admin-action-btn" onClick={startNew}>Novo plano</button>
          <button className="admin-action-btn" onClick={resetPlans}>Repor planos</button>
        </div>
      </div>

      {formOpen ? <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label fw-bold">Nome</label><input className="admin-form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, id: editing ? form.id : slugify(event.target.value) })} /></div>
          <div className="col-md-6"><label className="form-label fw-bold">ID</label><input className="admin-form-control" value={form.id} onChange={(event) => setForm({ ...form, id: slugify(event.target.value) })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Periodicidade</label><select className="admin-form-control" value={form.cadence} onChange={(event) => setForm({ ...form, cadence: event.target.value as Plan["cadence"] })}><option value="monthly">Mensal</option><option value="quarterly">Trimestral</option></select></div>
          <div className="col-md-4"><label className="form-label fw-bold">Preco</label><input className="admin-form-control" type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></div>
          <div className="col-12"><label className="form-label fw-bold">Descricao</label><textarea className="admin-form-control" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
          <div className="col-12"><label className="form-label fw-bold">Vantagens</label><textarea className="admin-form-control" rows={4} value={perksText} onChange={(event) => setPerksText(event.target.value)} placeholder="Uma vantagem por linha" /></div>
          <div className="col-12 d-flex gap-2 flex-wrap"><button className="admin-action-btn admin-action-primary" onClick={savePlan}>{editing ? "Guardar plano" : "Criar plano"}</button><button className="admin-action-btn" onClick={() => { setFormOpen(false); setEditing(null); setForm(emptyPlan); setPerksText(""); }}>Fechar</button></div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div> : message ? <div className="card-body"><p className="text-muted mb-0">{message}</p></div> : null}

      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>Plano</th><th>Periodicidade</th><th>Preco</th><th>Vantagens</th><th className="admin-actions-heading">Acoes</th></tr></thead>
          <tbody>
            {sortedPlans.map((plan) => (
              <tr key={plan.id}>
                <td><strong>{plan.name}</strong><div className="text-muted small">/{plan.id}</div><div className="text-muted small">{plan.description}</div></td>
                <td>{cadenceLabel(plan.cadence)}</td>
                <td className="fw-bold">{money(plan.price)}</td>
                <td>{plan.perks.length}</td>
                <td><div className="admin-table-actions"><button className="admin-action-btn" onClick={() => startEdit(plan)}>Editar</button><button className="admin-action-btn" onClick={() => deletePlan(plan.id)}>Remover</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
