"use client";

import { useEffect, useState } from "react";
import { loadAdminOrdersForAdmin, saveAdminOrderStatus } from "@/lib/admin-db";
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
  const cls = status === "Confirmada" || status === "Pago" || status === "Enviado" ? "admin-pill-success" : status === "Pendente" ? "admin-pill-warning" : "admin-pill-danger";
  return <span className={`admin-pill ${cls}`}>{status}</span>;
}

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>(() => adminStore.orders.get());
  const [editing, setEditing] = useState<AdminOrder | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AdminOrder>(emptyOrder);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  function saveLocal(next: AdminOrder[], text: string) {
    setOrders(next);
    adminStore.orders.set(next);
    setMessage(text);
  }

  async function loadOrders() {
    setLoading(true);
    try {
      const remoteOrders = await loadAdminOrdersForAdmin();
      setOrders(remoteOrders);
      adminStore.orders.set(remoteOrders);
      setMessage(remoteOrders.length ? "Encomendas reais carregadas do Supabase." : "Ainda nao existem encomendas reais no Supabase.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel carregar encomendas reais. A mostrar dados locais.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  function startEdit(order: AdminOrder) {
    setEditing(order);
    setFormOpen(true);
    setForm(order);
    setMessage("");
  }

  async function saveOrder() {
    if (!form.id) {
      setMessage("ID de encomenda em falta.");
      return;
    }

    try {
      const saved = await saveAdminOrderStatus(form);
      saveLocal(orders.map((item) => item.id === saved.id ? saved : item), "Estado da encomenda actualizado no Supabase.");
      setEditing(saved);
      setFormOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel guardar a encomenda.");
    }
  }

  async function cancelOrder(order: AdminOrder) {
    try {
      const saved = await saveAdminOrderStatus({ ...order, status: "Cancelado" });
      saveLocal(orders.map((item) => item.id === saved.id ? saved : item), "Encomenda marcada como cancelada.");
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel cancelar a encomenda.");
    }
  }

  function resetOrders() {
    adminStore.orders.reset();
    setOrders(adminStore.orders.get());
    setFormOpen(false);
    setEditing(null);
    setMessage("A mostrar dados locais.");
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div><h2 className="h4 mb-1">Encomendas</h2><div className="text-muted">Veja encomendas reais do checkout e actualize o estado operacional.</div></div>
        <div className="d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={loadOrders} disabled={loading}>{loading ? "A carregar" : "Actualizar"}</button><button className="admin-action-btn" onClick={resetOrders}>Usar dados locais</button></div>
      </div>
      {formOpen ? <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3"><label className="form-label fw-bold">ID</label><input className="admin-form-control" value={form.id} readOnly /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Cliente</label><input className="admin-form-control" value={form.customer} readOnly /></div>
          <div className="col-md-5"><label className="form-label fw-bold">Email</label><input className="admin-form-control" value={form.email} readOnly /></div>
          <div className="col-md-3"><label className="form-label fw-bold">Estado</label><select className="admin-form-control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AdminOrder["status"] })}><option>Confirmada</option><option>Pago</option><option>Pendente</option><option>Enviado</option><option>Cancelado</option></select></div>
          <div className="col-md-3"><label className="form-label fw-bold">Total</label><input className="admin-form-control" value={money(form.total)} readOnly /></div>
          <div className="col-md-3"><label className="form-label fw-bold">Data</label><input className="admin-form-control" value={form.date} readOnly /></div>
          <div className="col-md-3"><label className="form-label fw-bold">Tipo</label><input className="admin-form-control" value={`${form.pet} - ${form.plan}`} readOnly /></div>
          <div className="col-12"><label className="form-label fw-bold">Itens e observacoes</label><textarea className="admin-form-control" rows={3} value={form.details || ""} readOnly /></div>
          <div className="col-12 d-flex gap-2 flex-wrap"><button className="admin-action-btn admin-action-primary" onClick={saveOrder}>{editing ? "Guardar estado" : "Guardar"}</button><button className="admin-action-btn" onClick={() => { setFormOpen(false); setEditing(null); setForm(emptyOrder); }}>Fechar</button></div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div> : message ? <div className="card-body"><p className="text-muted mb-0">{message}</p></div> : null}
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Pet</th><th>Plano</th><th>Data</th><th>Estado</th><th>Total</th><th /></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="fw-bold">{order.id}</td>
                <td>{order.customer}<div className="text-muted small">{order.email}</div></td>
                <td>{order.pet}</td><td>{order.plan}<div className="text-muted small">{order.details}</div></td><td>{order.date}</td><td><StatusPill status={order.status} /></td><td className="fw-bold">{money(order.total)}</td>
                <td className="d-flex justify-content-end gap-2"><button className="admin-action-btn" onClick={() => startEdit(order)}>Estado</button><button className="admin-action-btn" onClick={() => cancelOrder(order)}>Cancelar</button></td>
              </tr>
            ))}
            {!orders.length ? <tr><td colSpan={8} className="text-muted text-center py-4">Sem encomendas para mostrar.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
