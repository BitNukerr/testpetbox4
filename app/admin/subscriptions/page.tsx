import { adminSubscriptions } from "@/data/admin";

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

export default function AdminSubscriptionsPage() {
  return (
    <div className="admin-card">
      <div className="card-header">
        <h2 className="h4 mb-1">Subscrições</h2>
        <div className="text-muted">Monitorização dos planos mensais e trimestrais.</div>
      </div>
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Animal</th><th>Plano</th><th>Renovação</th><th>Estado</th><th>Valor</th><th /></tr></thead>
          <tbody>
            {adminSubscriptions.map((sub) => (
              <tr key={sub.id}>
                <td className="fw-bold">{sub.id}</td>
                <td>{sub.customer}</td>
                <td>{sub.pet}</td>
                <td>{sub.plan}</td>
                <td>{sub.renewal}</td>
                <td>
                  <span className={`admin-pill ${sub.status === "Ativa" ? "admin-pill-success" : "admin-pill-warning"}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="fw-bold">{money(sub.value)}</td>
                <td><button className="admin-action-btn">Gerir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
