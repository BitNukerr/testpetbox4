"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand"><img src="/logo-paw.svg" alt="" /><h3>PetBox</h3></div>
          <p>Caixas mensais e trimestrais para caes e gatos, com snacks, brinquedos e extras avulsos.</p>
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
