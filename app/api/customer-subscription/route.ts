import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json();
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId." }, { status: 400 });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1
    });

    const subscription = subscriptions.data[0];
    return NextResponse.json({
      customerId,
      id: subscription?.id || "",
      status: subscription?.status || ""
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load subscription." }, { status: 500 });
  }
}
