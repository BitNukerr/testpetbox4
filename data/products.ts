export type Product = {
  slug: string;
  title: string;
  category: string;
  species: "dog" | "cat" | "both";
  price: number;
  description: string;
  image: string;
  tag: string;
  rating: number;
};

export type Plan = {
  id: string;
  name: string;
  cadence: "monthly" | "quarterly";
  price: number;
  description: string;
  perks: string[];
};

export const plans: Plan[] = [
  {
    id: "caixa-mensal-petbox",
    name: "Caixa Mensal PetBox",
    cadence: "monthly",
    price: 39,
    description: "Brinquedos, snacks e surpresas temáticas todos os meses.",
    perks: ["Cancelar quando quiser", "Para cães e gatos", "Configurador incluído"]
  },
  {
    id: "caixa-trimestral-premium",
    name: "Caixa Trimestral Premium",
    cadence: "quarterly",
    price: 99,
    description: "Uma caixa sazonal maior, com produtos premium e maior valor percebido.",
    perks: ["Melhor valor", "Temas sazonais", "Ideal para oferecer"]
  }
];

export const products: Product[] = [
  { slug: "snacks-crocantes-pato", title: "Snacks Crocantes de Pato", category: "Snacks", species: "dog", price: 14, description: "Snacks de treino crocantes para cães brincalhões e momentos de recompensa.", image: "/images/dog-treats.svg", tag: "Favorito dos cães", rating: 4.8 },
  { slug: "cana-de-penas", title: "Cana de Penas Divertida", category: "Brinquedos", species: "cat", price: 16, description: "Um brinquedo interactivo para gatos curiosos e sessões diárias de brincadeira.", image: "/images/cat-toy.svg", tag: "Favorito dos gatos", rating: 4.9 },
  { slug: "balsamo-patas", title: "Bálsamo para Patas", category: "Cuidado", species: "both", price: 18, description: "Bálsamo suave para patas e nariz secos, adequado a cães e gatos.", image: "/images/paw-balm.svg", tag: "Cães e gatos", rating: 4.7 },
  { slug: "brinquedo-corda-aventura", title: "Brinquedo de Corda Aventura", category: "Brinquedos", species: "dog", price: 19, description: "Brinquedo resistente para roer, puxar e gastar energia ao ar livre.", image: "/images/rope-toy.svg", tag: "Escolha outdoor", rating: 4.8 },
  { slug: "snacks-macios-salmao", title: "Snacks Macios de Salmão", category: "Snacks", species: "cat", price: 13, description: "Snacks macios de salmão para gatos exigentes e rotinas de recompensa.", image: "/images/cat-treats.svg", tag: "Mordidas suaves", rating: 4.6 },
  { slug: "bandana-conforto", title: "Bandana Conforto", category: "Acessórios", species: "both", price: 12, description: "Bandana sazonal suave para momentos de unboxing e fotografias especiais.", image: "/images/bandana.svg", tag: "Extra sazonal", rating: 4.7 }
];

export const journalPosts = [
  { slug: "rotina-melhor-para-animais", title: "Como Criar uma Rotina Melhor para o seu Animal", excerpt: "Formas simples de combinar brincadeira, recompensa e enriquecimento durante a semana.", date: "9 de abril de 2026", body: "Uma boa rotina equilibra movimento, conforto, enriquecimento e recompensa. As caixas de subscrição funcionam melhor quando apoiam hábitos que o animal já adora: brincadeira diária para gatos, mastigação saudável para cães e momentos calmos de ligação para ambos." },
  { slug: "melhores-itens-gatos-interior", title: "Melhores Produtos para Gatos de Interior", excerpt: "De brinquedos com penas a snacks surpresa, estas são as nossas escolhas favoritas.", date: "2 de abril de 2026", body: "Gatos de interior beneficiam muito de novidade. Alternar brinquedos, snacks de puzzle, mordidas suaves e estímulos sensoriais ajuda a evitar o tédio e mantém o gato activo." },
  { slug: "o-que-caes-adoram-numa-caixa", title: "O que os Cães Adoram numa Caixa de Subscrição", excerpt: "Texturas, cheiros e recompensas importam mais do que parece.", date: "26 de março de 2026", body: "Os cães respondem muito ao cheiro, à textura e ao padrão de recompensa. As melhores caixas incluem brinquedos resistentes, snacks de alto valor e produtos de cuidado adequados ao tamanho e energia do cão." }
];
