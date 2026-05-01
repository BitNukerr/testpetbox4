import CartClient from "@/components/CartClient";

export default function CarrinhoPage() {
  return (
    <section className="section">
      <div className="container section-heading">
        <div>
          <span className="eyebrow">Carrinho</span>
          <h1>Reveja as escolhas para o seu animal</h1>
        </div>
      </div>
      <CartClient />
    </section>
  );
}
