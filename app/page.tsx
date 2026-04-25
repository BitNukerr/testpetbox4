import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import PlanCard from "@/components/PlanCard";
import { plans, products } from "@/data/products";
import Link from "next/link";
import { pt } from "@/lib/translations";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="container section premium-strip">
        <div className="strip-card"><span>1</span><strong>Escolha o animal</strong><p>Cão ou gato, com tamanho e perfil.</p></div>
        <div className="strip-card"><span>2</span><strong>Personalize a caixa</strong><p>Plano, tema e extras opcionais.</p></div>
        <div className="strip-card"><span>3</span><strong>Receba em casa</strong><p>Uma experiência surpresa todos os meses.</p></div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div><span className="eyebrow">{pt.home.plansEyebrow}</span><h2>{pt.home.plansTitle}</h2></div>
          <Link href="/configure" className="btn btn-secondary">Personalizar</Link>
        </div>
        <div className="grid two">{plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div>
      </section>

      <section className="container section split-showcase">
        <div className="showcase-copy">
          <span className="eyebrow">{pt.home.whyEyebrow}</span>
          <h2>{pt.home.whyTitle}</h2>
          <p>{pt.home.whyText}</p>
          <Link href="/about" className="btn btn-secondary">Conhecer a marca</Link>
        </div>
        <div className="showcase-card"><img src="/images/about-pets.svg" alt="Animais felizes com produtos PetBox" /></div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div><span className="eyebrow">{pt.home.addonsEyebrow}</span><h2>{pt.home.addonsTitle}</h2></div>
          <Link href="/shop" className="btn btn-secondary">Ver todos</Link>
        </div>
        <div className="grid three">{products.slice(0, 3).map((product) => <ProductCard key={product.slug} product={product} />)}</div>
      </section>

      <section className="container section ux-panel">
        <span className="eyebrow">{pt.home.mockupEyebrow}</span>
        <h2>{pt.home.mockupTitle}</h2>
        <p>{pt.home.mockupText}</p>
        <div className="ux-flow"><span>Início</span><span>Criar Caixa</span><span>Carrinho</span><span>Pagamento</span><span>Conta</span></div>
      </section>
    </>
  );
}
