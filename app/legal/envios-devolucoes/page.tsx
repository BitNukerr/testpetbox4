import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Envios e Devolucoes | PetBox",
  description: "Informacao sobre entregas, devolucoes, reembolsos e direito de livre resolucao."
};

export default function ShippingReturnsPage() {
  return (
    <LegalPage
      title="Envios e Devolucoes"
      intro="Informacao essencial sobre entrega de encomendas PetBox e pedidos de devolucao."
      sections={[
        {
          title: "Envios",
          body: [
            "As entregas sao feitas para a morada indicada no checkout. O cliente deve confirmar nome, telefone, morada, cidade e codigo postal antes do pagamento.",
            "O custo de envio e apresentado antes da conclusao da compra. Prazos exactos podem variar conforme disponibilidade de stock, destino e transportadora."
          ]
        },
        {
          title: "Direito de livre resolucao",
          body: [
            "Nas compras online, o consumidor tem em regra 14 dias para resolver o contrato apos recepcao dos bens, sem indicar motivo.",
            "Produtos personalizados, usados, deteriorados, pereciveis ou que por razoes de higiene/seguranca nao possam ser revendidos podem ter limites ou exclusoes ao direito de devolucao."
          ]
        },
        {
          title: "Como pedir devolucao",
          body: [
            "Contacte a PetBox antes de enviar qualquer artigo, indicando numero de encomenda, email da compra e motivo do pedido.",
            "O artigo deve ser devolvido em bom estado, com embalagem e conteudo recebidos, salvo defeito ou erro imputavel a PetBox."
          ]
        },
        {
          title: "Reembolsos",
          body: [
            "Depois de receber e verificar a devolucao, o reembolso e feito pelo meio de pagamento disponivel ou por outro meio acordado com o cliente.",
            "Custos de devolucao podem ficar a cargo do cliente quando a lei o permita e quando essa informacao tenha sido prestada antes da compra."
          ]
        },
        {
          title: "Produtos danificados ou errados",
          body: [
            "Se receber um artigo danificado, errado ou incompleto, contacte a PetBox o mais rapidamente possivel com fotografias e numero de encomenda.",
            "Nestes casos, a PetBox avaliara substituicao, reenvio ou reembolso de acordo com a situacao concreta."
          ]
        }
      ]}
    />
  );
}
