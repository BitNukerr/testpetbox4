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
  { id: "caixa-mensal-petbox", name: "Caixa Mensal PetBox", cadence: "monthly", price: 39, description: "Brinquedos, snacks e surpresas novas todos os meses.", perks: ["Cancele quando quiser", "Para cães e gatos", "Inclui personalização"] },
  { id: "caixa-trimestral-premium", name: "Caixa Trimestral Premium", cadence: "quarterly", price: 99, description: "Uma caixa sazonal maior, com brinquedos premium e extras duradouros.", perks: ["Melhor valor", "Temas sazonais", "Ideal para oferecer"] }
];

export const products: Product[] = [
  { slug: "snacks-crocantes-pato", title: "Snacks Crocantes de Pato", category: "Snacks", species: "dog", price: 14, description: "Snacks crocantes para treino, recompensa e passeios com cães.", image: "/images/dog-treats.svg", tag: "Favorito dos cães", rating: 4.8 },
  { slug: "cana-penas-gatos", title: "Cana de Penas para Gatos", category: "Brinquedos", species: "cat", price: 16, description: "Brinquedo interactivo para gatos curiosos e sessões de brincadeira diária.", image: "/images/cat-toy.svg", tag: "Favorito dos gatos", rating: 4.9 },
  { slug: "balsamo-patas", title: "Bálsamo de Patas", category: "Cuidado", species: "both", price: 18, description: "Bálsamo suave para patas secas e narizes sensíveis.", image: "/images/paw-balm.svg", tag: "Cães + gatos", rating: 4.7 },
  { slug: "corda-aventura", title: "Corda de Aventura", category: "Brinquedos", species: "dog", price: 19, description: "Brinquedo resistente para puxar, roer e gastar energia.", image: "/images/rope-toy.svg", tag: "Para exterior", rating: 4.8 },
  { slug: "snacks-salmao-gatos", title: "Snacks Macios de Salmão", category: "Snacks", species: "cat", price: 13, description: "Snacks macios de salmão para gatos exigentes.", image: "/images/cat-treats.svg", tag: "Mordidas macias", rating: 4.6 },
  { slug: "bandana-pet", title: "Bandana Pet", category: "Acessórios", species: "both", price: 12, description: "Bandana suave para fotografias e momentos especiais.", image: "/images/bandana.svg", tag: "Extra sazonal", rating: 4.7 }
];

export const journalPosts = [
  { slug: "rotina-para-animais", title: "Como criar uma rotina melhor para o seu animal", excerpt: "Ideias simples para juntar brincadeira, recompensas e descanso.", date: "9 de Abril de 2026", body: "Uma boa rotina equilibra movimento, conforto, enriquecimento e recompensa. As caixas de subscrição funcionam melhor quando apoiam hábitos que o animal já adora." },
  { slug: "brinquedos-gatos-interior", title: "Melhores brinquedos para gatos de interior", excerpt: "De canas a surpresas com catnip, estes são os nossos favoritos.", date: "2 de Abril de 2026", body: "Gatos de interior precisam de novidade. Alternar brinquedos interactivos, snacks e desafios ajuda a evitar aborrecimento." },
  { slug: "caixa-subscricao-caes", title: "O que os cães adoram numa caixa de subscrição", excerpt: "Texturas, cheiros e recompensas fazem toda a diferença.", date: "26 de Março de 2026", body: "Os cães respondem muito a cheiro, textura e padrões de recompensa. Uma boa caixa inclui brinquedos resistentes, snacks de valor e produtos úteis." }
];
