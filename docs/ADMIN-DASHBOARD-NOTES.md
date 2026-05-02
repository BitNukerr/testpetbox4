# Painel Admin PetBox

Resumo do painel administrativo actual da PetBox.

## Rotas

- `/admin`
- `/admin/home`
- `/admin/configurator`
- `/admin/orders`
- `/admin/products`
- `/admin/plans`
- `/admin/users`
- `/admin/customers`
- `/admin/subscriptions`
- `/admin/journal`
- `/admin/legal`
- `/admin/settings`

## Implementacao

O painel usa Bootstrap 5 para a estrutura e um CSS proprio em `app/admin/admin.css`. O Bootstrap e carregado apenas no layout admin, para nao alterar a loja publica.

## Fontes de dados

- Produtos, planos, posts, pagina inicial, configurador, paginas legais, utilizadores registados, encomendas e subscricoes usam rotas admin protegidas e Supabase.
- Encomendas sao criadas pelo checkout e podem ser acompanhadas no admin.
- Subscricoes sao criadas por encomendas pagas ou pelo admin.
- O preco de envio e guardado em `store_settings` e editado em `/admin/settings`.
- Os dados locais em `data/admin.ts` e `lib/admin-store.ts` continuam como fallback para desenvolvimento local antes do Supabase estar configurado.

## Seguranca

- Use `ADMIN_ACCESS_CODE` apenas como variavel privada, nunca `NEXT_PUBLIC_`.
- Mantenha `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_SESSION_SECRET` apenas no servidor.
- Use `supabase/petbox-rls-schema.sql` como schema actual da base de dados.
- Clientes nao podem criar ou alterar subscricoes directamente pelo browser.
