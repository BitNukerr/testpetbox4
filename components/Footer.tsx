import Link from "next/link";
import { pt } from "@/lib/translations";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><h3>PetBox</h3><p>Caixas mensais e trimestrais para cães e gatos, com snacks, brinquedos e extras avulsos.</p></div>
        <div><h4>Explorar</h4><Link href="/shop">{pt.nav.shop}</Link><Link href="/configure">{pt.nav.build}</Link><Link href="/journal">{pt.nav.journal}</Link></div>
        <div><h4>Empresa</h4><Link href="/about">{pt.nav.about}</Link><Link href="/contact">{pt.nav.contact}</Link><Link href="/account">{pt.nav.account}</Link></div>
      </div>
    </footer>
  );
}
