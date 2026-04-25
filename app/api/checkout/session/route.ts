import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session id." }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      sessionId: session.id,
      customerId: typeof session.customer === "string" ? session.customer : "",
      subscriptionId: typeof session.subscription === "string" ? session.subscription : "",
      amountTotal: session.amount_total || 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load checkout session." }, { status: 500 });
  }
}
