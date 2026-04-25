"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminStore } from "@/lib/admin-store";
import type { AdminOrder, AdminSubscription } from "@/data/admin";

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function StatusPill({ status }: { status: string }) {
  const cls = status === "Pago" || status === "Ativa" || status === "Enviado" ? "admin-pill-success" : status === "Pendente" || status === "Pausada" ? "admin-pill-warning" : "admin-pill-danger";
  return <span className={`admin-pill ${cls}`}>{status}</span>;
}

export default function AdminDashboardClient() {
  const [orders, setOrders] = useState<AdminOrder[]>(() => adminStore.orders.get());
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>(() => adminStore.subscriptions.get());
  const [customers, setCustomers] = useState(() => adminStore.customers.get());
  const [message, setMessage] = useState("");

  function refresh() {
    setOrders(adminStore.orders.get());
    setSubscriptions(adminStore.subscriptions.get());
    setCustomers(adminStore.customers.get());
  }

  useEffect(() => {
    refresh();
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.filter((order) => order.status !== "Cancelado").reduce((sum, order) => sum + Number(order.total || 0), 0);
    return {
      revenue,
      activeSubscriptions: subscriptions.filter((sub) => sub.status === "Ativa").length,
      pendingOrders: orders.filter((order) => order.status === "Pendente").length,
      customers: customers.length,
      conversionRate: orders.length ? Math.min(12, Math.round((orders.length / Math.max(customers.length, 1)) * 1000) / 10) : 0,
      averageOrder: orders.length ? revenue / orders.length : 0
    };
  }, [customers, orders, subscriptions]);

  function resetAll() {
    adminStore.resetAll();
    refresh();
    setMessage("Dados administrativos repostos.");
  }

  return (
    <div className="row g-4">
      <div className="col-12 d-flex justify-content-end">
        <button className="admin-action-btn" onClick={resetAll}>Repor todos os dados demo</button>
      </div>
      {message ? <div className="col-12"><div className="admin-card p-3 text-muted">{message}</div></div> : null}
      <div className="col-sm-6 col-xl-3"><div className="admin-card admin-stat"><div className="admin-stat-label">Receita</div><div className="admin-stat-value">{money(stats.revenue)}</div><div className="text-success fw-bold mt-2">Dados editáveis</div></div></div>
      <div className="col-sm-6 col-xl-3"><div className="admin-card admin-stat"><div className="admin-stat-label">Subscrições activas</div><div className="admin-stat-value">{stats.activeSubscriptions}</div><div className="text-muted mt-2">Mensais e trimestrais</div></div></div>
      <div className="col-sm-6 col-xl-3"><div className="admin-card admin-stat"><div className="admin-stat-label">Encomendas pendentes</div><div className="admin-stat-value">{stats.pendingOrders}</div><div className="text-warning fw-bold mt-2">Requer atenção</div></div></div>
      <div className="col-sm-6 col-xl-3"><div className="admin-card admin-stat"><div className="admin-stat-label">Clientes</div><div className="admin-stat-value">{stats.customers}</div><div className="text-muted mt-2">Base total</div></div></div>

      <div className="col-xl-8">
        <div className="admin-card">
          <div className="card-header d-flex justify-content-between align-items-center"><div><h2 className="h5 mb-1">Encomendas recentes</h2><div className="text-muted small">Resumo operacional da loja</div></div><Link href="/admin/orders" className="admin-action-btn text-decoration-none">Gerir</Link></div>
          <div className="table-responsive">
            <table className="table admin-table"><thead><tr><th>ID</th><th>Cliente</th><th>Plano</th><th>Estado</th><th>Total</th></tr></thead><tbody>{orders.slice(0, 4).map((order) => <tr key={order.id}><td className="fw-bold">{order.id}</td><td>{order.customer}<div className="text-muted small">{order.email}</div></td><td>{order.plan}</td><td><StatusPill status={order.status} /></td><td className="fw-bold">{money(order.total)}</td></tr>)}</tbody></table>
          </div>
        </div>
      </div>
      <div className="col-xl-4">
        <div className="admin-card h-100">
          <div className="card-header"><h2 className="h5 mb-1">Performance semanal</h2><div className="text-muted small">Visual estilo OneUI / Bootstrap</div></div>
          <div className="card-body"><div className="admin-chart" aria-hidden="true"><span style={{ height: "42%" }} /><span style={{ height: "64%" }} /><span style={{ height: "55%" }} /><span style={{ height: "82%" }} /><span style={{ height: "70%" }} /><span style={{ height: "92%" }} /><span style={{ height: "76%" }} /></div><div className="row text-center mt-4"><div className="col"><strong>{stats.conversionRate}%</strong><div className="text-muted small">Conversão</div></div><div className="col"><strong>{money(stats.averageOrder)}</strong><div className="text-muted small">Ticket médio</div></div></div></div>
        </div>
      </div>
      <div className="col-12">
        <div className="admin-card">
          <div className="card-header d-flex justify-content-between align-items-center"><div><h2 className="h5 mb-1">Subscrições a acompanhar</h2><div className="text-muted small">Renovações e estado dos planos</div></div><Link href="/admin/subscriptions" className="admin-action-btn text-decoration-none">Gerir</Link></div>
          <div className="table-responsive"><table className="table admin-table"><thead><tr><th>ID</th><th>Cliente</th><th>Pet</th><th>Plano</th><th>Renovação</th><th>Estado</th></tr></thead><tbody>{subscriptions.map((sub) => <tr key={sub.id}><td className="fw-bold">{sub.id}</td><td>{sub.customer}</td><td>{sub.pet}</td><td>{sub.plan}</td><td>{sub.renewal}</td><td><StatusPill status={sub.status} /></td></tr>)}</tbody></table></div>
        </div>
      </div>
    </div>
  );
}
