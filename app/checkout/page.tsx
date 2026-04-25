import CheckoutClient from "@/components/CheckoutClient";
import { pt } from "@/lib/translations";

export default function CheckoutPage() {
  return (
    <section className="section"><div className="container section-heading"><div><span className="eyebrow">Pagamento</span><h1>{pt.pages.checkoutTitle}</h1></div></div><CheckoutClient /></section>
  );
}
