import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Politica de Privacidade | PetBox",
  description: "Como a PetBox recolhe, usa e protege dados pessoais."
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politica de Privacidade"
      intro="Resumo da forma como a PetBox trata dados de clientes e visitantes."
      sections={[
        {
          title: "Dados recolhidos",
          body: [
            "Podemos recolher nome, email, telefone, morada, codigo postal, NIF quando indicado, dados dos animais, preferencias, encomendas e mensagens enviadas pelo formulario de contacto.",
            "Tambem podem ser recolhidos dados tecnicos, como paginas visitadas, atraves de ferramentas de analytics."
          ]
        },
        {
          title: "Finalidades",
          body: [
            "Os dados sao usados para criar conta, processar encomendas, preparar caixas personalizadas, gerir pagamentos, responder a contactos, melhorar a experiencia e cumprir obrigacoes legais.",
            "As observacoes sobre animais sao usadas apenas para preparar melhor a caixa e evitar escolhas inadequadas."
          ]
        },
        {
          title: "Servicos externos",
          body: [
            "A PetBox usa Supabase para autenticacao e base de dados, Easypay para pagamentos, Vercel para alojamento e analytics, e Resend para emails transaccionais ou de contacto.",
            "Cada fornecedor trata dados de acordo com as suas proprias politicas e com as instrucoes necessarias para prestar o servico."
          ]
        },
        {
          title: "Conservacao e direitos",
          body: [
            "Os dados sao conservados durante o periodo necessario para gerir a relacao comercial, cumprir obrigacoes legais e resolver pedidos de suporte.",
            "O cliente pode pedir acesso, rectificacao, apagamento, limitacao ou oposicao ao tratamento dos seus dados atraves da pagina de contacto."
          ]
        },
        {
          title: "Seguranca",
          body: [
            "A area de cliente usa autenticacao Supabase e as areas administrativas usam sessao protegida.",
            "Nenhuma chave secreta deve ser exposta em variaveis publicas do website."
          ]
        }
      ]}
    />
  );
}
