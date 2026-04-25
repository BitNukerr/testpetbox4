import Link from "next/link";
import { pt } from "@/lib/translations";

export default function Hero() {
  return (
    <section className="hero premium-hero container">
      <div className="hero-copy">
        <span className="eyebrow">{pt.home.eyebrow}</span>
        <h1>{pt.home.title}</h1>
        <p>{pt.home.subtitle}</p>
        <div className="hero-actions">
          <Link href="/configure" className="btn">{pt.home.primaryCta}</Link>
          <Link href="/shop" className="btn btn-secondary">{pt.home.secondaryCta}</Link>
        </div>
        <div className="trust-row" aria-label="Vantagens PetBox">
          {pt.home.stats.map((item) => <span key={item}>✓ {item}</span>)}
        </div>
      </div>
      <div className="hero-card premium-card">
        <div className="hero-badge">PetBox</div>
        <img src="/images/hero-pets.svg" alt="Cão e gato com caixas PetBox" />
        <div className="hero-stats">
          <div><strong>2 planos</strong><span>Mensal + trimestral</span></div>
          <div><strong>Cães + gatos</strong><span>Produtos por perfil</span></div>
          <div><strong>Mobile first</strong><span>Compra simples no telemóvel</span></div>
        </div>
      </div>
    </section>
  );
}
