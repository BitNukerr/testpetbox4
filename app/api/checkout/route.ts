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
      return NextResponse.json({ error: "No items provided." }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const containsSubscription = items.some(
      (item) => item.type === "plan" || item.type === "custom-box"
    );

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const isSubscription =
          item.type === "plan" || item.type === "custom-box";

        if (isSubscription) {
          return {
            quantity: item.quantity ?? 1,
            price_data: {
              currency: "eur",
              product_data: {
                name: item.title,
                description: item.description,
              },
              unit_amount: Math.round(item.price * 100),
              recurring: {
                interval: (item.interval ?? "month") as Stripe.PriceCreateParams.Recurring.Interval,
                interval_count: item.intervalCount ?? 1,
              },
            },
          };
        }

        return {
          quantity: item.quantity ?? 1,
          price_data: {
            currency: "eur",
            product_data: {
              name: item.title,
              description: item.description,
            },
            unit_amount: Math.round(item.price * 100),
          },
        };
      }
    );

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: containsSubscription ? "subscription" : "payment",
      line_items,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
