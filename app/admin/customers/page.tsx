import { adminCustomers } from "@/data/admin";

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

export default function AdminCustomersPage() {
  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Clientes</h2>
          <div className="text-muted">Perfis de cliente, animais e valor gerado.</div>
        </div>
        <button className="admin-action-btn">Adicionar cliente</button>
      </div>
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Animal</th><th>Subscrição</th><th>Valor total</th><th /></tr></thead>
          <tbody>
            {adminCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="fw-bold">{customer.id}</td>
                <td>{customer.name}<div className="text-muted small">{customer.email}</div></td>
                <td>{customer.pet}</td>
                <td>
                  <span className={`admin-pill ${customer.subscription === "Ativa" ? "admin-pill-success" : customer.subscription === "Pausada" ? "admin-pill-warning" : "admin-pill-info"}`}>
                    {customer.subscription}
                  </span>
                </td>
                <td className="fw-bold">{money(customer.lifetimeValue)}</td>
                <td><button className="admin-action-btn">Ver perfil</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
