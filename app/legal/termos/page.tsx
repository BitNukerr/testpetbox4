import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Termos e Condicoes | PetBox",
  description: "Termos de utilizacao e compra da loja PetBox."
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos e Condicoes"
      intro="Regras principais para utilizacao do website, encomendas, pagamentos e subscricoes PetBox."
      sections={[
        {
          title: "Identificacao da loja",
          body: [
            "A PetBox comercializa caixas misterio, produtos e extras para caes e gatos em Portugal.",
            "Os dados completos da entidade titular, NIF, morada fiscal e contactos legais devem ser preenchidos antes da abertura oficial da loja."
          ]
        },
        {
          title: "Produtos e subscricoes",
          body: [
            "As caixas podem ser configuradas de acordo com animal, tamanho, idade, personalidade, extras e observacoes indicadas pelo cliente.",
            "As imagens e descricoes no website representam o tipo de produto esperado, podendo existir variacoes de acordo com stock, perfil do animal e seleccao da equipa."
          ]
        },
        {
          title: "Precos e pagamentos",
          body: [
            "Os precos sao apresentados em euros e podem incluir ou nao custos de envio, conforme indicado no checkout.",
            "Os pagamentos sao processados atraves da Easypay, incluindo MB WAY e outros metodos que venham a ser activados."
          ]
        },
        {
          title: "Conta de cliente",
          body: [
            "O cliente e responsavel por manter os dados da conta, morada e contacto actualizados.",
            "A PetBox pode recusar, cancelar ou reembolsar encomendas em caso de erro tecnico, fraude, indisponibilidade de stock ou dados insuficientes para entrega."
          ]
        },
        {
          title: "Reclamacoes",
          body: [
            "Para resolver qualquer questao, contacte primeiro a PetBox atraves da pagina de contacto.",
            "O consumidor pode tambem usar o Livro de Reclamacoes Electronico em https://www.livroreclamacoes.pt."
          ]
        }
      ]}
    />
  );
}
