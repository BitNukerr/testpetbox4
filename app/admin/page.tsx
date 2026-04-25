import Link from "next/link";
import { adminOrders, adminStats, adminSubscriptions } from "@/data/admin";

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function StatusPill({ status }: { status: string }) {
  const cls = status === "Pago" || status === "Ativa" || status === "Enviado"
    ? "admin-pill-success"
    : status === "Pendente" || status === "Pausada"
      ? "admin-pill-warning"
      : "admin-pill-danger";
  return <span className={`admin-pill ${cls}`}>{status}</span>;
}

export default function AdminDashboardPage() {
  return (
    <div className="row g-4">
      <div className="col-sm-6 col-xl-3">
        <div className="admin-card admin-stat">
          <div className="admin-stat-label">Receita</div>
          <div className="admin-stat-value">{money(adminStats.revenue)}</div>
          <div className="text-success fw-bold mt-2">+12% este mês</div>
        </div>
      </div>
      <div className="col-sm-6 col-xl-3">
        <div className="admin-card admin-stat">
          <div className="admin-stat-label">Subscrições ativas</div>
          <div className="admin-stat-value">{adminStats.activeSubscriptions}</div>
          <div className="text-muted mt-2">Planos mensais e trimestrais</div>
        </div>
      </div>
      <div className="col-sm-6 col-xl-3">
        <div className="admin-card admin-stat">
          <div className="admin-stat-label">Encomendas pendentes</div>
          <div className="admin-stat-value">{adminStats.pendingOrders}</div>
          <div className="text-warning fw-bold mt-2">Requer atenção</div>
        </div>
      </div>
      <div className="col-sm-6 col-xl-3">
        <div className="admin-card admin-stat">
          <div className="admin-stat-label">Clientes</div>
          <div className="admin-stat-value">{adminStats.customers}</div>
          <div className="text-muted mt-2">Base total</div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="admin-card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h5 mb-1">Encomendas recentes</h2>
              <div className="text-muted small">Resumo operacional da loja</div>
            </div>
            <Link href="/admin/orders" className="admin-action-btn text-decoration-none">Ver todas</Link>
          </div>
          <div className="table-responsive">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Cliente</th><th>Plano</th><th>Estado</th><th>Total</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.slice(0, 4).map((order) => (
                  <tr key={order.id}>
                    <td className="fw-bold">{order.id}</td>
                    <td>{order.customer}<div className="text-muted small">{order.email}</div></td>
                    <td>{order.plan}</td>
                    <td><StatusPill status={order.status} /></td>
                    <td className="fw-bold">{money(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-xl-4">
        <div className="admin-card h-100">
          <div className="card-header">
            <h2 className="h5 mb-1">Performance semanal</h2>
            <div className="text-muted small">Visual estilo OneUI / Bootstrap</div>
          </div>
          <div className="card-body">
            <div className="admin-chart" aria-hidden="true">
              <span style={{ height: "42%" }} />
              <span style={{ height: "64%" }} />
              <span style={{ height: "55%" }} />
              <span style={{ height: "82%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "92%" }} />
              <span style={{ height: "76%" }} />
            </div>
            <div className="row text-center mt-4">
              <div className="col">
                <strong>{adminStats.conversionRate}%</strong>
                <div className="text-muted small">Conversão</div>
              </div>
              <div className="col">
                <strong>{money(adminStats.averageOrder)}</strong>
                <div className="text-muted small">Ticket médio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="admin-card">
          <div className="card-header">
            <h2 className="h5 mb-1">Subscrições a acompanhar</h2>
            <div className="text-muted small">Renovações e estado dos planos</div>
          </div>
          <div className="table-responsive">
            <table className="table admin-table">
              <thead><tr><th>ID</th><th>Cliente</th><th>Pet</th><th>Plano</th><th>Renovação</th><th>Estado</th></tr></thead>
              <tbody>
                {adminSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="fw-bold">{sub.id}</td>
                    <td>{sub.customer}</td>
                    <td>{sub.pet}</td>
                    <td>{sub.plan}</td>
                    <td>{sub.renewal}</td>
                    <td><StatusPill status={sub.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
