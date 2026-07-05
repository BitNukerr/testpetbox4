import CheckoutClient from "@/components/CheckoutClient";
import { getCachedStoreSettings } from "@/lib/site-data";

export const revalidate = 300;

export default async function PagamentoPage() {
  const initialStoreSettings = await getCachedStoreSettings();

  return (
    <section className="section">
      <div className="container section-heading">
        <div>
          <span className="eyebrow">Pagamento</span>
          <h1>Pagamento seguro por MB WAY</h1>
        </div>
      </div>
      <CheckoutClient initialStoreSettings={initialStoreSettings} />
    </section>
  );
}
