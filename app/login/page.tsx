import AuthClient from "@/components/AuthClient";
import { pt } from "@/lib/translations";

export default function LoginPage() {
  return (
    <section className="container section narrow">
      <span className="eyebrow">{pt.nav.login}</span>
      <h1>{pt.pages.loginTitle}</h1>
      <p className="muted">{pt.pages.loginIntro}</p>
      <AuthClient />
    </section>
  );
}
