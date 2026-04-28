import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Politica de Cookies | PetBox",
  description: "Informacao sobre cookies e tecnologias semelhantes usadas pela PetBox."
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Politica de Cookies"
      intro="Informacao sobre cookies, armazenamento local e ferramentas de medicao usadas no website."
      sections={[
        {
          title: "O que sao cookies",
          body: [
            "Cookies e tecnologias semelhantes ajudam o website a funcionar, guardar preferencias e medir utilizacao.",
            "O website tambem usa armazenamento local do browser para carrinho, dados temporarios de conta e preferencias de administracao local."
          ]
        },
        {
          title: "Cookies necessarios",
          body: [
            "Podem ser usados cookies ou tokens necessarios para login, sessao de cliente, seguranca, carrinho e funcionamento do checkout.",
            "Sem estes dados, algumas funcionalidades essenciais podem nao funcionar correctamente."
          ]
        },
        {
          title: "Analytics",
          body: [
            "A PetBox usa Vercel Analytics para compreender visitas e desempenho das paginas.",
            "Estes dados ajudam a melhorar o website e devem ser configurados de acordo com as opcoes de privacidade e consentimento aplicaveis."
          ]
        },
        {
          title: "Gestao",
          body: [
            "Pode apagar cookies e dados locais nas definicoes do browser.",
            "Se forem activados cookies nao essenciais adicionais, deve ser apresentado um mecanismo de consentimento antes da sua utilizacao."
          ]
        }
      ]}
    />
  );
}
