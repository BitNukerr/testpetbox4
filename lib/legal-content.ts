export type LegalSection = {
  title: string;
  body: string[];
};

export type LegalPageKey = "termos" | "privacidade" | "envios-devolucoes" | "cookies";

export type LegalPageContent = {
  label: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalSettings = Record<LegalPageKey, LegalPageContent>;

export const legalPageOrder: LegalPageKey[] = ["termos", "privacidade", "envios-devolucoes", "cookies"];

export const defaultLegalSettings: LegalSettings = {
  termos: {
    label: "Termos",
    title: "Termos e Condicoes",
    intro: "Regras principais para utilizacao do website, encomendas, pagamentos e subscricoes PetBox.",
    sections: [
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
          "Os precos sao apresentados em euros e podem incluir ou nao custos de envio, conforme indicado no pagamento.",
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
    ]
  },
  privacidade: {
    label: "Privacidade",
    title: "Politica de Privacidade",
    intro: "Resumo da forma como a PetBox trata dados de clientes e visitantes.",
    sections: [
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
    ]
  },
  "envios-devolucoes": {
    label: "Envios e devolucoes",
    title: "Envios e Devolucoes",
    intro: "Informacao essencial sobre entrega de encomendas PetBox e pedidos de devolucao.",
    sections: [
      {
        title: "Envios",
        body: [
          "As entregas sao feitas para a morada indicada no pagamento. O cliente deve confirmar nome, telefone, morada, cidade e codigo postal antes de concluir a compra.",
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
    ]
  },
  cookies: {
    label: "Cookies",
    title: "Politica de Cookies",
    intro: "Informacao sobre cookies, armazenamento local e ferramentas de medicao usadas no website.",
    sections: [
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
          "Podem ser usados cookies ou tokens necessarios para entrada na conta, sessao de cliente, seguranca, carrinho e funcionamento do pagamento.",
          "Sem estes dados, algumas funcionalidades essenciais podem nao funcionar correctamente."
        ]
      },
      {
        title: "Analytics",
        body: [
          "A PetBox usa Vercel Analytics para compreender visitas e desempenho das paginas.",
          "O componente de Analytics so e carregado depois de aceitar essa opcao no aviso de cookies."
        ]
      },
      {
        title: "Gestao",
        body: [
          "Pode recusar analytics no aviso inicial ou apagar cookies e dados locais nas definicoes do browser para voltar a escolher.",
          "Se forem activados cookies nao essenciais adicionais, deve ser apresentado um mecanismo de consentimento antes da sua utilizacao."
        ]
      }
    ]
  }
};

export function mergeLegalSettings(settings?: Partial<Record<LegalPageKey, Partial<LegalPageContent>>> | null): LegalSettings {
  const next = { ...defaultLegalSettings } as LegalSettings;
  for (const key of legalPageOrder) {
    const page = settings?.[key];
    if (!page) continue;
    next[key] = {
      ...defaultLegalSettings[key],
      ...page,
      sections: Array.isArray(page.sections) && page.sections.length ? page.sections : defaultLegalSettings[key].sections
    };
  }
  return next;
}
