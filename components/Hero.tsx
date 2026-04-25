import Link from "next/link";
import { pt } from "@/lib/translations";

export default function Hero() {
  return (
    <section className="hero container">
      <div className="hero-copy">
        <span className="eyebrow">{pt.home.eyebrow}</span>
        <h1>{pt.home.title}</h1>
        <p>{pt.home.subtitle}</p>
        <div className="hero-actions">
          <Link href="/configure" className="btn">{pt.home.primaryCta}</Link>
          <Link href="/shop" className="btn btn-secondary">{pt.home.secondaryCta}</Link>
        </div>
      </div>
      <div className="hero-card">
        <img src="/images/hero-pets.svg" alt="Cães e gatos com caixas PetBox" />
        <div className="hero-stats">
          <div><strong>2 planos</strong><span>Mensal + trimestral</span></div>
          <div><strong>Cães + gatos</strong><span>Produtos por perfil</span></div>
          <div><strong>MB WAY</strong><span>Pagamento por Easypay</span></div>
        </div>
      </div>
    </section>
  );
}
