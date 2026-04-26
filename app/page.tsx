import Hero from "@/components/Hero";
import HomeFeaturedProductsClient from "@/components/HomeFeaturedProductsClient";
import HomePlansClient from "@/components/HomePlansClient";
import Link from "next/link";
import { pt } from "@/lib/translations";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="container section">
        <div className="section-heading"><div><span className="eyebrow">{pt.home.plansEyebrow}</span><h2>{pt.home.plansTitle}</h2></div><Link href="/configure" className="btn btn-secondary">Personalizar</Link></div>
        <HomePlansClient />
      </section>
      <section className="container section">
        <div className="section-heading"><div><span className="eyebrow">{pt.home.addonsEyebrow}</span><h2>{pt.home.addonsTitle}</h2></div><Link href="/shop" className="btn btn-secondary">Ver todos</Link></div>
        <HomeFeaturedProductsClient />
      </section>
    </>
  );
}
