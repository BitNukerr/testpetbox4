"use client";

import { useState } from "react";
import { adminStore } from "@/lib/admin-store";
import type { AdminCustomer } from "@/data/admin";

const emptyCustomer: AdminCustomer = {
  id: "",
  name: "",
  email: "",
  pet: "",
  subscription: "Sem subscrição",
  lifetimeValue: 0
};

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

export default function AdminCustomersClient() {
  const [customers, setCustomers] = useState<AdminCustomer[]>(() => adminStore.customers.get());
  const [editing, setEditing] = useState<AdminCustomer | null>(null);
  const [form, setForm] = useState<AdminCustomer>(emptyCustomer);
  const [message, setMessage] = useState("");

  function save(next: AdminCustomer[], text: string) {
    setCustomers(next);
    adminStore.customers.set(next);
    setMessage(text);
  }

  function startNew() {
    setEditing(null);
    setForm({ ...emptyCustomer, id: `CUS-${String(customers.length + 1).padStart(3, "0")}` });
    setMessage("");
  }

  function startEdit(customer: AdminCustomer) {
    setEditing(customer);
    setForm(customer);
    setMessage("");
  }

  function saveCustomer() {
    if (!form.id || !form.name || !form.email) {
      setMessage("Preencha ID, nome e email.");
      return;
    }
    const customer = { ...form, lifetimeValue: Number(form.lifetimeValue) };
    const exists = customers.some((item) => item.id === customer.id);
    save(exists ? customers.map((item) => item.id === customer.id ? customer : item) : [...customers, customer], exists ? "Cliente actualizado." : "Cliente criado.");
    setEditing(customer);
  }

  function deleteCustomer(id: string) {
    save(customers.filter((item) => item.id !== id), "Cliente removido.");
    startNew();
  }

  function resetUsers() {
    adminStore.customers.reset();
    setCustomers(adminStore.customers.get());
    startNew();
    setMessage("Utilizadores repostos para os dados demo.");
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div><h2 className="h4 mb-1">Clientes</h2><div className="text-muted">Adicione, edite, remova ou reponha utilizadores demo.</div></div>
        <div className="d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={startNew}>Adicionar cliente</button><button className="admin-action-btn" onClick={resetUsers}>Repor utilizadores</button></div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-2"><label className="form-label fw-bold">ID</label><input className="admin-form-control" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} /></div>
          <div className="col-md-5"><label className="form-label fw-bold">Nome</label><input className="admin-form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
          <div className="col-md-5"><label className="form-label fw-bold">Email</label><input className="admin-form-control" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
          <div className="col-md-5"><label className="form-label fw-bold">Animal</label><input className="admin-form-control" value={form.pet} onChange={(event) => setForm({ ...form, pet: event.target.value })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Subscrição</label><select className="admin-form-control" value={form.subscription} onChange={(event) => setForm({ ...form, subscription: event.target.value as AdminCustomer["subscription"] })}><option>Ativa</option><option>Pausada</option><option>Sem subscrição</option></select></div>
          <div className="col-md-3"><label className="form-label fw-bold">Valor total</label><input className="admin-form-control" type="number" value={form.lifetimeValue} onChange={(event) => setForm({ ...form, lifetimeValue: Number(event.target.value) })} /></div>
          <div className="col-12 d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={saveCustomer}>{editing ? "Guardar cliente" : "Criar cliente"}</button><button className="admin-action-btn" onClick={startNew}>Limpar</button></div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div>
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Animal</th><th>Subscrição</th><th>Valor total</th><th /></tr></thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="fw-bold">{customer.id}</td>
                <td>{customer.name}<div className="text-muted small">{customer.email}</div></td>
                <td>{customer.pet}</td>
                <td><span className={`admin-pill ${customer.subscription === "Ativa" ? "admin-pill-success" : customer.subscription === "Pausada" ? "admin-pill-warning" : "admin-pill-info"}`}>{customer.subscription}</span></td>
                <td className="fw-bold">{money(customer.lifetimeValue)}</td>
                <td className="d-flex justify-content-end gap-2"><button className="admin-action-btn" onClick={() => startEdit(customer)}>Editar</button><button className="admin-action-btn" onClick={() => deleteCustomer(customer.id)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
