import { adminOrders } from "@/data/admin";

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function StatusPill({ status }: { status: string }) {
  const cls = status === "Pago" || status === "Enviado"
    ? "admin-pill-success"
    : status === "Pendente"
      ? "admin-pill-warning"
      : "admin-pill-danger";
  return <span className={`admin-pill ${cls}`}>{status}</span>;
}

export default function AdminOrdersPage() {
  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Encomendas</h2>
          <div className="text-muted">Gestão de encomendas, pagamentos e expedição.</div>
        </div>
        <button className="admin-action-btn">Exportar CSV</button>
      </div>
      <div className="card-body">
        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <input className="admin-form-control" placeholder="Pesquisar por cliente, email ou ID" />
          </div>
          <div className="col-md-4">
            <select className="admin-form-control" defaultValue="">
              <option value="">Todos os estados</option>
              <option>Pago</option>
              <option>Pendente</option>
              <option>Enviado</option>
              <option>Cancelado</option>
            </select>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Pet</th><th>Plano</th><th>Data</th><th>Estado</th><th>Total</th><th /></tr></thead>
          <tbody>
            {adminOrders.map((order) => (
              <tr key={order.id}>
                <td className="fw-bold">{order.id}</td>
                <td>{order.customer}<div className="text-muted small">{order.email}</div></td>
                <td>{order.pet}</td>
                <td>{order.plan}</td>
                <td>{order.date}</td>
                <td><StatusPill status={order.status} /></td>
                <td className="fw-bold">{money(order.total)}</td>
                <td><button className="admin-action-btn">Detalhes</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
