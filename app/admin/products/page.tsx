import Image from "next/image";
import { products, plans } from "@/data/products";

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

export default function AdminProductsPage() {
  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="admin-card">
          <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
            <div>
              <h2 className="h4 mb-1">Produtos</h2>
              <div className="text-muted">Catálogo, add-ons e planos de subscrição.</div>
            </div>
            <button className="admin-action-btn">Novo produto</button>
          </div>
          <div className="table-responsive">
            <table className="table admin-table">
              <thead><tr><th>Produto</th><th>Categoria</th><th>Animal</th><th>Preço</th><th>Avaliação</th><th /></tr></thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.slug}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <Image src={product.image} alt={product.title} width={52} height={52} />
                        <div>
                          <strong>{product.title}</strong>
                          <div className="text-muted small">{product.tag}</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.species === "dog" ? "Cão" : product.species === "cat" ? "Gato" : "Ambos"}</td>
                    <td className="fw-bold">{money(product.price)}</td>
                    <td>{product.rating}</td>
                    <td><button className="admin-action-btn">Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="admin-card">
          <div className="card-header">
            <h2 className="h5 mb-1">Planos ativos</h2>
            <div className="text-muted small">Planos que aparecem no website e no configurador.</div>
          </div>
          <div className="row g-3 p-3">
            {plans.map((plan) => (
              <div className="col-md-6" key={plan.id}>
                <div className="border rounded-4 p-4 bg-white h-100">
                  <div className="text-uppercase text-muted fw-bold small">{plan.cadence === "monthly" ? "Mensal" : "Trimestral"}</div>
                  <h3 className="h5 mt-2">{plan.name}</h3>
                  <p className="text-muted">{plan.description}</p>
                  <div className="h4 fw-bold">{money(plan.price)}</div>
                  <button className="admin-action-btn mt-3">Editar plano</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
