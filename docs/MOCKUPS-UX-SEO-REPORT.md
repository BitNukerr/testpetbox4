# PetBox UX, SEO e Mockups

Documento de referencia para manter o site alinhado com a direccao visual e funcional da PetBox.

## 1. Objectivo do projecto

A PetBox e uma loja online portuguesa para caixas misterio, produtos avulsos e planos recorrentes para caes e gatos. O objectivo e tornar a compra simples: descobrir produtos, criar uma caixa personalizada e pagar de forma segura.

## 2. Publico-alvo

- Donos de caes e gatos em Portugal.
- Pessoas que compram online e valorizam conveniencia.
- Clientes que procuram surpresa, personalizacao e produtos escolhidos com cuidado.

## 3. UX

- Navegacao curta: Loja, Criar Caixa, Blog, Sobre, Contacto e Conta.
- Loja com filtros fixos, categorias, pesquisa e ordenacao.
- Configurador dividido em passos: animal, tamanho, idade, plano, personalidade, extras e observacoes.
- Carrinho com imagem, resumo, quantidade, remover e total visivel.
- Admin com edicao de homepage, produtos, planos, blog, configurador, paginas legais e definicoes.

## 4. Jornada do utilizador

1. O utilizador entra na pagina inicial.
2. Explora caixas misterio, loja ou blog.
3. Cria uma caixa personalizada ou adiciona produtos ao carrinho.
4. Preenche dados de entrega.
5. Finaliza a compra com Easypay/MB WAY.
6. Recebe email de confirmacao.
7. Acede a conta para consultar encomendas e subscricoes.

## 5. SEO

### Palavras-chave principais

- caixa misterio para caes
- caixa misterio para gatos
- produtos para animais online
- snacks para caes
- brinquedos para gatos
- pet shop Portugal

### Tecnicas usadas

- Conteudo em portugues de Portugal.
- URLs simples: `/loja`, `/criar-caixa`, `/blog`, `/contacto`.
- Metadados por pagina.
- Imagens com texto alternativo.
- Paginas legais e cookies editaveis.
- Estrutura responsiva e mobile-first.

## 6. Direccao visual

- Logo com pata e texto PetBox.
- Pagina inicial em blocos editoriais, inspirada em layouts de e-commerce por cartoes.
- Azul claro como cor de destaque visual em blocos principais.
- Botoes arredondados, contrastados e consistentes.
- Imagens de produtos sempre dentro de areas estaveis para nao partir o layout.

## 7. Backend

- Supabase Auth para login e criacao de conta.
- RLS para proteger dados de cliente.
- Easypay Checkout para MB WAY.
- Webhook Easypay para confirmar encomendas.
- Resend para emails.
- Admin protegido por codigo privado e cookie de sessao assinado.

## 8. Melhorias futuras

- Quando a conta Easypay estiver pronta, testar pagamentos reais em producao.
- Adicionar cartao pela Easypay com `EASYPAY_PAYMENT_METHODS=mbw,cc`.
- Criar campanhas ou cupoes.
- Adicionar reviews de produtos e caixas.
