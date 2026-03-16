import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { creatorId, userId, amountCents = 500, successUrl, cancelUrl } = await req.json();

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

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: amountCents,
        product_data: { name: `Tip for ${creatorId}` },
      },
      quantity: 1,
    }],
    metadata: { creatorId, userId },
  });

  return NextResponse.json({ url: session.url });
}
