import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { customerId, returnPath } = await req.json();
    if (!customerId) {
      return NextResponse.json({ error: "Falta o ID de cliente Stripe." }, { status: 400 });
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}${returnPath || "/account"}`
    });
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Não foi possível criar a sessão do portal de pagamento." }, { status: 500 });
  }
}
