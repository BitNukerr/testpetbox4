# Configuracao Supabase RLS da PetBox

Este ficheiro explica como aplicar a base de dados da PetBox com Row Level Security.

## 1. Correr o SQL

1. Abra o Supabase.
2. Entre em **SQL Editor**.
3. Cole todo o conteudo de `supabase/petbox-rls-schema.sql`.
4. Clique em **Run**.

O SQL cria as tabelas de perfis, moradas, animais, subscricoes, encomendas, detalhes de entrega, produtos, planos, blog, definicoes da loja, pagina inicial, configurador, paginas legais e administradores. Tambem liga encomendas pagas de planos a subscricoes atraves de `customer_subscriptions.source_order_id`, guarda o preco de envio editavel no admin e marca encomendas depois do email de confirmacao atraves de `orders.confirmation_email_sent_at`.

Pode voltar a correr o ficheiro sempre que o projecto for actualizado. O script usa `create table if not exists`, `alter table ... add column if not exists` e `drop/create policy`, por isso serve como migracao simples.

## 2. Adicionar o seu utilizador como admin

Depois de iniciar sessao no site uma vez com o email de administrador, corra isto no Supabase SQL Editor:

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where email = 'YOUR_EMAIL_HERE'
on conflict (user_id) do nothing;
```

Substitua `YOUR_EMAIL_HERE` pelo email real da sua conta.

## 3. Variaveis no Vercel

Mantenha estas variaveis no Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`, apenas no servidor
- `ADMIN_ACCESS_CODE`
- `ADMIN_SESSION_SECRET`
- `SUPABASE_STORAGE_BUCKET`, opcional, usa `petbox-images` por defeito
- `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`
- `ORDER_NOTIFICATION_EMAIL`, opcional, usa `CONTACT_TO_EMAIL` se estiver vazio
- `SHIPPING_PRICE_EUR`, opcional, usado apenas como fallback inicial

Nunca coloque uma secret/service key numa variavel `NEXT_PUBLIC_`.

## 4. O que fica protegido

- Clientes podem ler as suas proprias encomendas e subscricoes.
- Clientes podem editar apenas o proprio perfil, moradas e animais.
- Subscricoes sao criadas ou alteradas apenas depois de pagamento confirmado ou pelo painel admin.
- Visitantes publicos podem ler produtos activos, planos activos, posts publicados e definicoes publicas do site.
- Apenas utilizadores em `admin_users` podem gerir dados da loja.
- A chave secret/service fica sempre no servidor.

## 5. Checkout

O checkout valida produtos activos, planos activos, opcoes da caixa personalizada e preco de envio no servidor antes de criar o pagamento Easypay, desde que `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` esteja configurada.

O preco de envio deve ser editado em `/admin/settings`. A variavel `SHIPPING_PRICE_EUR` fica apenas como fallback enquanto a tabela `store_settings` ainda nao existir ou estiver vazia.
