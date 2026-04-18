import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { creatorId, successUrl, cancelUrl, priceCents = 599, userId } = await req.json();

  // Ensure customer exists or create one
  let customerId: string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user?.email || undefined,
      metadata: { userId },
    });
    await prisma.user.update({ where: { id: userId! }, data: { stripeCustomerId: customer.id } });
    customerId = customer.id;
  } else {
    customerId = user.stripeCustomerId;
  }

  // Create on-the-fly recurring price (or pre-create in Stripe dashboard and reference by id)
  const price = await stripe.prices.create({
    unit_amount: priceCents,
    currency: "usd",
    recurring: { interval: "month" },
    product_data: { name: `Fan Club – ${creatorId}` },
    metadata: { creatorId },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [{ price: price.id, quantity: 1 }],
  });

  return NextResponse.json({ url: session.url });
}
