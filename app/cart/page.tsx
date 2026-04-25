import CartClient from "@/components/CartClient";
import { pt } from "@/lib/translations";

export default function CartPage() {
  return (
    <section className="section"><div className="container section-heading"><div><span className="eyebrow">{pt.nav.cart}</span><h1>{pt.pages.cartTitle}</h1></div></div><CartClient /></section>
  );
}
