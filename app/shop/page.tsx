import ShopClient from "@/components/ShopClient";

export default function ShopPage() {
  return (
    <section className="container section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Loja</span>
          <h1>Snacks, brinquedos e acessórios para animais</h1>
        </div>
      </div>
      <ShopClient />
    </section>
  );
}
