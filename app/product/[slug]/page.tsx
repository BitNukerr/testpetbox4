import { products } from "@/data/products";
import { notFound } from "next/navigation";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((item) => item.slug === params.slug);
  if (!product) return notFound();
  const species = product.species === "dog" ? pt.configure.dog : product.species === "cat" ? pt.configure.cat : pt.configure.both;

  return (
    <section className="container section">
      <div className="product-detail">
        <img src={product.image} alt={product.title} className="detail-image" />
        <div className="card">
          <div className="card-body">
            <span className="tag">{product.tag}</span>
            <h1>{product.title}</h1>
            <p className="muted">{product.category} | {species}</p>
            <p>{product.description}</p>
            <p className="price">{money(product.price)}</p>
            <a href="/shop" className="btn">Voltar à loja</a>
          </div>
        </div>
      </div>
    </section>
  );
}
