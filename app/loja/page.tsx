import ShopClient from "@/components/ShopClient";

export const metadata = {
  title: "Loja PetBox | Snacks, brinquedos e acessorios",
  description: "Compre snacks, brinquedos, produtos de cuidado e acessorios para caes e gatos."
};

export default function LojaPage() {
  return (
    <section className="container section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Loja</span>
          <h1>Snacks, brinquedos e acessorios para animais</h1>
          <p className="muted">Explore produtos por categoria, animal e preco.</p>
        </div>
      </div>
      <ShopClient />
    </section>
  );
}
