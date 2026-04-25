import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

type CartItem = {
  title: string;
  description?: string;
  price: number;
  quantity: number;
  type?: "plan" | "custom-box" | "product";
  interval?: "month" | "year";
  intervalCount?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: CartItem[] = body.items ?? [];

    if (!items.length) {
      return NextResponse.json({ error: "Não foram enviados artigos para pagamento." }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const mbWayOnlyPaymentMethods = ["mb_way"] as unknown as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        quantity: item.quantity ?? 1,
        price_data: {
          currency: "eur",
          product_data: {
            name: item.title,
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100),
        },
      })
    );

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: mbWayOnlyPaymentMethods,
      line_items,
      locale: "pt",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erro na sessão de pagamento:", error);
    return NextResponse.json(
      { error: "Não foi possível criar a sessão de pagamento." },
      { status: 500 }
    );
  }
}
