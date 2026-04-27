import Link from "next/link";
import AdminGate from "@/components/AdminGate";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import "bootstrap/dist/css/bootstrap.min.css";
import "./admin.css";

const adminNav = [
  ["Dashboard", "/admin", "⌂"],
  ["Pagina inicial", "/admin/home", "✦"],
  ["Criar caixa", "/admin/configurator", "□"],
  ["Encomendas", "/admin/orders", "▣"],
  ["Produtos", "/admin/products", "◇"],
  ["Planos", "/admin/plans", "◎"],
  ["Clientes", "/admin/customers", "○"],
  ["Subscricoes", "/admin/subscriptions", "↻"],
  ["Blog", "/admin/journal", "✎"],
  ["Definicoes", "/admin/settings", "⚙"]
] as const;

export const metadata = {
  title: "Admin | PetBox",
  description: "Painel de administracao PetBox"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <section className="admin-shell py-4">
        <div className="container-fluid px-3 px-lg-4">
          <div className="row g-4">
            <aside className="col-lg-3 col-xl-2">
              <div className="admin-sidebar">
                <div className="admin-logo">
                  <img src="/logo-paw.svg" alt="" className="admin-logo-icon" />
                  <div>
                    <strong>PetBox Admin</strong>
                    <div className="small text-white-50">Gestao da loja</div>
                  </div>
                </div>

                <nav className="admin-nav" aria-label="Admin navigation">
                  {adminNav.map(([label, href, icon]) => (
                    <Link key={href} href={href}><span>{icon}</span>{label}</Link>
                  ))}
                </nav>

                <div className="mt-4 pt-4 border-top border-secondary">
                  <div className="d-grid gap-2">
                    <Link href="/" className="admin-action-btn d-inline-flex text-decoration-none justify-content-center">
                      Ver website
                    </Link>
                    <AdminLogoutButton />
                  </div>
                </div>
              </div>
            </aside>

            <div className="col-lg-9 col-xl-10">
              <div className="admin-topbar mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div>
                  <div className="text-muted fw-bold small text-uppercase">Painel interno</div>
                  <h1 className="h3 fw-black mb-0">Administracao PetBox</h1>
                </div>
                <div className="d-flex gap-2">
                  <span className="admin-pill admin-pill-success">Online</span>
                  <span className="admin-pill admin-pill-info">Marca PetBox</span>
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </section>
    </AdminGate>
  );
}
