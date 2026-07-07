import Configurator from "@/components/Configurator";
import { getCachedConfiguratorData } from "@/lib/site-data";

export const revalidate = 300;

export default async function CriarCaixaPage() {
  const configuratorData = await getCachedConfiguratorData();

  return (
    <section className="config-page section">
      <div className="container config-hero">
        <div className="config-hero-copy">
          <span className="eyebrow">Configurador</span>
          <h1>Crie uma caixa que parece feita para o seu animal.</h1>
          <p>Escolha o perfil, ajuste o estilo, veja a caixa mudar em tempo real e finalize quando estiver tudo certo.</p>
        </div>
        <div className="config-hero-steps">
          <div><span>01</span><strong>Perfil</strong><small>Animal, tamanho e idade.</small></div>
          <div><span>02</span><strong>Estilo</strong><small>Plano, personalidade e extras.</small></div>
          <div><span>03</span><strong>Resumo</strong><small>Preco e detalhes antes de pagar.</small></div>
        </div>
      </div>
      <div className="container">
        <Configurator {...configuratorData} />
      </div>
    </section>
  );
}
