import CheckoutClient from "@/components/CheckoutClient";

export default function PagamentoPage() {
  return (
    <section className="section">
      <div className="container section-heading">
        <div>
          <span className="eyebrow">Pagamento</span>
          <h1>Pagamento seguro por MB WAY</h1>
        </div>
      </div>
      <CheckoutClient />
    </section>
  );
}
