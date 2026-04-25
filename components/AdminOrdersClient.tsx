"use client";

import { useState } from "react";
import { adminStore } from "@/lib/admin-store";
import type { AdminOrder } from "@/data/admin";

const emptyOrder: AdminOrder = {
  id: "",
  customer: "",
  email: "",
  pet: "Cão",
  plan: "Mensal",
  status: "Pendente",
  total: 0,
  date: new Date().toISOString().slice(0, 10)
};

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function StatusPill({ status }: { status: string }) {
  const cls = status === "Pago" || status === "Enviado" ? "admin-pill-success" : status === "Pendente" ? "admin-pill-warning" : "admin-pill-danger";
  return <span className={`admin-pill ${cls}`}>{status}</span>;
}

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>(() => adminStore.orders.get());
  const [editing, setEditing] = useState<AdminOrder | null>(null);
  const [form, setForm] = useState<AdminOrder>(emptyOrder);
  const [message, setMessage] = useState("");

  function save(next: AdminOrder[], text: string) {
    setOrders(next);
    adminStore.orders.set(next);
    setMessage(text);
  }

  function startNew() {
    setEditing(null);
    setForm({ ...emptyOrder, id: `PB-${Date.now().toString().slice(-4)}` });
    setMessage("");
  }

  function startEdit(order: AdminOrder) {
    setEditing(order);
    setForm(order);
    setMessage("");
  }

  function saveOrder() {
    if (!form.id || !form.customer || !form.email) {
      setMessage("Preencha ID, cliente e email.");
      return;
    }
    const order = { ...form, total: Number(form.total) };
    const exists = orders.some((item) => item.id === order.id);
    save(exists ? orders.map((item) => item.id === order.id ? order : item) : [order, ...orders], exists ? "Encomenda actualizada." : "Encomenda criada.");
    setEditing(order);
  }

  function deleteOrder(id: string) {
    save(orders.filter((item) => item.id !== id), "Encomenda removida.");
    startNew();
  }

  function resetOrders() {
    adminStore.orders.reset();
    setOrders(adminStore.orders.get());
    startNew();
    setMessage("Encomendas repostas.");
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div><h2 className="h4 mb-1">Encomendas</h2><div className="text-muted">Crie, edite estados, totais e dados de expedição.</div></div>
        <div className="d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={startNew}>Nova encomenda</button><button className="admin-action-btn" onClick={resetOrders}>Repor encomendas</button></div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-2"><label className="form-label fw-bold">ID</label><input className="admin-form-control" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Cliente</label><input className="admin-form-control" value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Email</label><input className="admin-form-control" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
          <div className="col-md-2"><label className="form-label fw-bold">Animal</label><select className="admin-form-control" value={form.pet} onChange={(event) => setForm({ ...form, pet: event.target.value as AdminOrder["pet"] })}><option>Cão</option><option>Gato</option></select></div>
          <div className="col-md-3"><label className="form-label fw-bold">Plano</label><select className="admin-form-control" value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value as AdminOrder["plan"] })}><option>Mensal</option><option>Trimestral</option><option>Compra única</option></select></div>
          <div className="col-md-3"><label className="form-label fw-bold">Estado</label><select className="admin-form-control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AdminOrder["status"] })}><option>Pago</option><option>Pendente</option><option>Enviado</option><option>Cancelado</option></select></div>
          <div className="col-md-2"><label className="form-label fw-bold">Total</label><input className="admin-form-control" type="number" value={form.total} onChange={(event) => setForm({ ...form, total: Number(event.target.value) })} /></div>
          <div className="col-md-2"><label className="form-label fw-bold">Data</label><input className="admin-form-control" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div>
          <div className="col-12 d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={saveOrder}>{editing ? "Guardar encomenda" : "Criar encomenda"}</button><button className="admin-action-btn" onClick={startNew}>Limpar</button></div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div>
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Pet</th><th>Plano</th><th>Data</th><th>Estado</th><th>Total</th><th /></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="fw-bold">{order.id}</td>
                <td>{order.customer}<div className="text-muted small">{order.email}</div></td>
                <td>{order.pet}</td><td>{order.plan}</td><td>{order.date}</td><td><StatusPill status={order.status} /></td><td className="fw-bold">{money(order.total)}</td>
                <td className="d-flex justify-content-end gap-2"><button className="admin-action-btn" onClick={() => startEdit(order)}>Editar</button><button className="admin-action-btn" onClick={() => deleteOrder(order.id)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
