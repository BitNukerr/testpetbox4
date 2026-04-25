# PetBox

Loja demo em Next.js para caixas de subscrição para cães e gatos, com Supabase Auth, Easypay Checkout, MB WAY, Vercel Analytics e painel admin demo.

## Funcionalidades

- Produtos e planos para cães e gatos
- Configurador de caixa personalizada
- Carrinho local
- Login/criação de conta via Supabase
- Checkout Easypay com MB WAY
- Painel `/admin` com código de acesso demo
- Vercel Analytics

## Correr localmente

```bat
cd C:\Users\rodri\Downloads\tessdf\petbox
npm install
copy .env.example .env.local
npm run dev
```

## Variáveis principais

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
EASYPAY_ACCOUNT_ID=your_easypay_account_id
EASYPAY_API_KEY=your_easypay_api_key
EASYPAY_ENVIRONMENT=sandbox
EASYPAY_PAYMENT_METHODS=mbw
NEXT_PUBLIC_ADMIN_ACCESS_CODE=petbox-admin
```

Para aceitar cartão pela Easypay no futuro, use `EASYPAY_PAYMENT_METHODS=mbw,cc`.
