export type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  pet: "Cão" | "Gato";
  plan: "Mensal" | "Trimestral" | "Compra única";
  status: "Pago" | "Pendente" | "Enviado" | "Cancelado";
  total: number;
  date: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  pet: string;
  subscription: "Ativa" | "Pausada" | "Sem subscrição";
  lifetimeValue: number;
};

export type AdminSubscription = {
  id: string;
  customer: string;
  plan: "Mensal" | "Trimestral";
  pet: "Cão" | "Gato";
  renewal: string;
  status: "Ativa" | "Pausada" | "Cancelamento agendado";
  value: number;
};

export type AdminJournalPost = {
  slug: string;
  title: string;
  status: "Publicado" | "Rascunho";
  author: string;
  date: string;
};

export const adminOrders: AdminOrder[] = [
  { id: "PB-1042", customer: "Mariana Silva", email: "mariana@email.com", pet: "Cão", plan: "Mensal", status: "Pago", total: 39, date: "2026-04-22" },
  { id: "PB-1041", customer: "João Martins", email: "joao@email.com", pet: "Gato", plan: "Trimestral", status: "Enviado", total: 99, date: "2026-04-21" },
  { id: "PB-1040", customer: "Inês Costa", email: "ines@email.com", pet: "Cão", plan: "Compra única", status: "Pendente", total: 28, date: "2026-04-20" },
  { id: "PB-1039", customer: "Rui Almeida", email: "rui@email.com", pet: "Gato", plan: "Mensal", status: "Cancelado", total: 39, date: "2026-04-19" }
];

export const adminCustomers: AdminCustomer[] = [
  { id: "CUS-001", name: "Mariana Silva", email: "mariana@email.com", pet: "Luna, cão médio", subscription: "Ativa", lifetimeValue: 238 },
  { id: "CUS-002", name: "João Martins", email: "joao@email.com", pet: "Mimi, gato adulto", subscription: "Ativa", lifetimeValue: 198 },
  { id: "CUS-003", name: "Inês Costa", email: "ines@email.com", pet: "Bolt, cão grande", subscription: "Sem subscrição", lifetimeValue: 56 },
  { id: "CUS-004", name: "Rui Almeida", email: "rui@email.com", pet: "Nina, gato sénior", subscription: "Pausada", lifetimeValue: 117 }
];

export const adminSubscriptions: AdminSubscription[] = [
  { id: "SUB-9001", customer: "Mariana Silva", plan: "Mensal", pet: "Cão", renewal: "2026-05-22", status: "Ativa", value: 39 },
  { id: "SUB-9002", customer: "João Martins", plan: "Trimestral", pet: "Gato", renewal: "2026-07-21", status: "Ativa", value: 99 },
  { id: "SUB-9003", customer: "Rui Almeida", plan: "Mensal", pet: "Gato", renewal: "Pausada", status: "Pausada", value: 39 }
];

export const adminJournalPosts: AdminJournalPost[] = [
  { slug: "como-escolher-snacks", title: "Como escolher snacks saudáveis para o seu animal", status: "Publicado", author: "Equipa PetBox", date: "2026-04-20" },
  { slug: "brinquedos-para-gatos", title: "Brinquedos ideais para gatos de interior", status: "Publicado", author: "Equipa PetBox", date: "2026-04-12" },
  { slug: "guia-caixas-mensais", title: "Guia das caixas mensais para cães e gatos", status: "Rascunho", author: "Marketing", date: "2026-04-02" }
];

export const adminStats = {
  revenue: 8420,
  activeSubscriptions: 128,
  pendingOrders: 7,
  customers: 312,
  conversionRate: 4.8,
  averageOrder: 47.6
};
