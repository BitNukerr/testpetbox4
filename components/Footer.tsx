import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>PetBox</h3>
          <p>Caixas mensais e trimestrais para cães e gatos, com snacks, brinquedos e extras avulsos.</p>
        </div>
        <div>
          <h4>Explorar</h4>
          <Link href="/shop">Loja</Link>
          <Link href="/configure">Criar Caixa</Link>
          <Link href="/journal">Blog</Link>
        </div>
        <div>
          <h4>Empresa</h4>
          <Link href="/about">Sobre</Link>
          <Link href="/contact">Contacto</Link>
          <Link href="/login">Entrar</Link>
        </div>
      </div>
    </footer>
  );
}
