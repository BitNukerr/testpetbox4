import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { pt } from "@/lib/translations";

export default function ShopPage() {
  return (
    <section className="container section">
      <div className="section-heading">
        <div><span className="eyebrow">{pt.nav.shop}</span><h1>{pt.pages.shopTitle}</h1><p className="muted">{pt.pages.shopIntro}</p></div>
      </div>
      <div className="grid three">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
    </section>
  );
}
