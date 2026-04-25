import AccountClient from "@/components/AccountClient";
import { pt } from "@/lib/translations";

export default function AccountPage() {
  return (
    <section className="section">
      <div className="container section-heading"><div><span className="eyebrow">{pt.nav.account}</span><h1>{pt.pages.accountTitle}</h1></div></div>
      <AccountClient />
    </section>
  );
}
