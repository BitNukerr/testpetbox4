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
      <section className="container section">
        <div className="section-heading"><div><span className="eyebrow">{pt.home.plansEyebrow}</span><h2>{pt.home.plansTitle}</h2></div><Link href="/configure" className="btn btn-secondary">Personalizar</Link></div>
        <div className="grid two">{plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div>
      </section>
      <section className="container section">
        <div className="section-heading"><div><span className="eyebrow">{pt.home.addonsEyebrow}</span><h2>{pt.home.addonsTitle}</h2></div><Link href="/shop" className="btn btn-secondary">Ver todos</Link></div>
        <div className="grid three">{products.slice(0, 3).map((product) => <ProductCard key={product.slug} product={product} />)}</div>
      </section>
    </>
  );
}
