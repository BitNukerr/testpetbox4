import CartClient from "@/components/CartClient";
import { getCachedStoreSettings } from "@/lib/site-data";

export const revalidate = 300;

export default async function CarrinhoPage() {
  const initialStoreSettings = await getCachedStoreSettings();

  return (
    <section className="section">
      <div className="container section-heading">
        <div>
          <span className="eyebrow">Carrinho</span>
          <h1>Reveja as escolhas para o seu animal</h1>
        </div>
      </div>
      <CartClient initialStoreSettings={initialStoreSettings} />
    </section>
  );
}
