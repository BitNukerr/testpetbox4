# PetBox

Loja em Next.js para caixas de subscricao para caes e gatos, com Supabase Auth, Easypay Checkout, MB WAY, Vercel Analytics e painel admin.

## Funcionalidades

- Produtos e planos para caes e gatos
- Configurador de caixa personalizada
- Carrinho local
- Login/criacao de conta via Supabase
- Checkout Easypay com MB WAY
- Painel `/admin` protegido por codigo de acesso e sessao assinada
- Vercel Analytics carregado apenas depois de consentimento de cookies

## Correr localmente

```bat
cd C:\Users\rodri\Downloads\tessdf\petbox
npm install
copy .env.example .env.local
npm run dev
```

## Variaveis principais

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
RESEND_API_KEY=your_resend_api_key
CONTACT_FROM_EMAIL=PetBox <noreply@your-domain.com>
CONTACT_TO_EMAIL=your_admin_email@example.com
ORDER_NOTIFICATION_EMAIL=optional_orders_email@example.com
EASYPAY_ACCOUNT_ID=your_easypay_account_id
EASYPAY_API_KEY=your_easypay_api_key
EASYPAY_ENVIRONMENT=sandbox
EASYPAY_PAYMENT_METHODS=mbw
EASYPAY_WEBHOOK_USER=choose_a_webhook_user
EASYPAY_WEBHOOK_PASSWORD=choose_a_webhook_password
ADMIN_ACCESS_CODE=choose_a_private_admin_code
ADMIN_SESSION_SECRET=choose_a_long_random_secret
SHIPPING_PRICE_EUR=8
SUPABASE_STORAGE_BUCKET=petbox-images
```

Para aceitar cartao pela Easypay no futuro, use `EASYPAY_PAYMENT_METHODS=mbw,cc`.

Configure o webhook da Easypay para `https://your-domain.com/api/easypay/webhook` e use as mesmas credenciais Basic Auth das variaveis `EASYPAY_WEBHOOK_USER` e `EASYPAY_WEBHOOK_PASSWORD`.

Para guardar moradas de entrega, dados de encomenda completos, emails de confirmacao e subscricoes criadas por encomendas pagas, volte a correr `supabase/petbox-rls-schema.sql` no Supabase SQL Editor depois de actualizar o projecto.
