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
          <div className="footer-brand"><img src="/dog-paw.png" alt="" /><h3>PetBox</h3></div>
          <p>Caixas mensais e trimestrais para caes e gatos, com snacks, brinquedos e extras avulsos.</p>
        </div>
        <div>
          <h4>Explorar</h4>
          <Link href="/loja">Loja</Link>
          <Link href="/criar-caixa">Criar Caixa</Link>
          <Link href="/blog">Blog</Link>
        </div>
        <div>
          <h4>Empresa</h4>
          <Link href="/sobre">Sobre</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/entrar">Entrar</Link>
        </div>
        <div>
          <h4>Legal</h4>
          <Link href="/legal/termos">Termos</Link>
          <Link href="/legal/privacidade">Privacidade</Link>
          <Link href="/legal/envios-devolucoes">Envios e devolucoes</Link>
          <Link href="/legal/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
