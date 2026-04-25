# PetBox — UX, SEO e Mockups

## 1. Objectivo do projecto
A PetBox é uma plataforma de e-commerce para caixas de subscrição para cães e gatos. O objectivo é permitir que o utilizador escolha um plano mensal ou trimestral, personalize a caixa e finalize a compra de forma simples.

## 2. Público-alvo
- Donos de cães e gatos em Portugal.
- Pessoas entre os 20 e os 45 anos que compram online.
- Utilizadores que valorizam conveniência, surpresa e personalização.

## 3. UX — decisões principais
- Navegação curta e clara: Loja, Criar Caixa, Blog, Sobre, Contacto e Conta.
- CTA principal: “Criar a minha caixa”.
- Configurador dividido em passos: Animal, Tamanho, Plano, Estilo e Extras.
- Carrinho com imagem, resumo, quantidade e total visíveis.
- Design mobile-first para facilitar compras no telemóvel.

## 4. Fluxo de utilizador
1. O utilizador entra na homepage.
2. Clica em “Criar a minha caixa”.
3. Escolhe cão ou gato, tamanho, plano e extras.
4. Adiciona ao carrinho.
5. Finaliza a compra com Stripe.
6. Acede à conta para gerir subscrição e pagamento.

## 5. SEO
### Palavras-chave principais
- caixa para animais
- caixa de subscrição para cães
- caixa de subscrição para gatos
- snacks para cães
- brinquedos para gatos
- produtos para animais online

### Técnicas usadas
- Título optimizado: “PetBox - Caixa de Subscrição para Animais”.
- Descrição meta com palavras-chave relevantes.
- URLs simples e claras: `/shop`, `/configure`, `/contact`.
- Conteúdo em português de Portugal.
- Estrutura responsiva e mobile-friendly.

## 6. Mockups para Figma
Crie 5 frames:

### Frame 1 — Homepage desktop
- Header com logo PetBox.
- Hero com título, texto e 2 botões.
- Secção “Como funciona” com 3 cards.
- Planos mensal e trimestral.
- Produtos em destaque.

### Frame 2 — Loja
- Grelha de produtos com imagem, preço e botão.
- Filtros por tipo de animal.

### Frame 3 — Configurador
- Barra de progresso com 5 passos.
- Cartões para escolher cão/gato.
- Opções de tamanho, plano, tema e extras.
- Resumo em tempo real à direita.

### Frame 4 — Carrinho/Checkout
- Lista de itens com imagem.
- Quantidade, remover e resumo de encomenda.
- Botão “Finalizar compra”.

### Frame 5 — Mobile
- Header com menu hambúrguer.
- Layout em coluna.
- Botões grandes e fáceis de tocar.

## 7. Backend
O projecto inclui uma base para backend com:
- Supabase Auth para login/criação de conta.
- SQL para tabelas de perfis, encomendas e subscrições.
- Stripe e Billing Portal.
- Formulário de contacto enviado por email via Resend.

## 8. Melhorias futuras
- Guardar encomendas reais na base de dados via Stripe webhook.
- Área de cliente completa com histórico persistente.
- Blog gerido por CMS.
- Testes A/B nas chamadas para acção.
