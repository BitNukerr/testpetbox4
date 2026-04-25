import Configurator from "@/components/Configurator";
import { pt } from "@/lib/translations";

export default function ConfigurePage() {
  return (
    <section className="container section">
      <div className="section-heading"><div><span className="eyebrow">{pt.configure.eyebrow}</span><h1>{pt.configure.title}</h1><p className="muted">{pt.configure.intro}</p></div></div>
      <Configurator />
    </section>
  );
}
