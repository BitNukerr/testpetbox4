import ShopClient from "@/components/ShopClient";
import { getCachedProductsState } from "@/lib/site-data";

export const metadata = {
  title: "Loja PetBox | Snacks, brinquedos e acessorios",
  description: "Compre snacks, brinquedos, produtos de cuidado e acessorios para caes e gatos."
};

export const revalidate = 86400;

export default async function LojaPage() {
  const productsState = await getCachedProductsState();

  return (
    <section className="container section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Loja</span>
          <h1>Snacks, brinquedos e acessórios para animais</h1>
          <p className="muted">Explore produtos por categoria, animal e preço.</p>
        </div>
      </div>
      <ShopClient initialProducts={productsState.data} initialProductsLoaded={productsState.loaded} />
    </section>
  );
}
