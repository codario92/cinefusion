import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const buf = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const stripeSubId = sub.id as string;
        const status = sub.status as string;
        const customerId = sub.customer as string;
        // we stored mapping on checkout session metadata:
        const creatorId = sub.items?.data?.[0]?.price?.metadata?.creatorId as string | undefined;
        if (!creatorId) break;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (!user) break;

        const currentPeriodEnd = new Date(sub.current_period_end * 1000);

        await prisma.subscription.upsert({
          where: { stripeSubId },
          update: { status, currentPeriodEnd, userId: user.id, creatorId },
          create: { stripeSubId, status, currentPeriodEnd, userId: user.id, creatorId },
        });
        break;
      }
      case "charge.succeeded": {
        const charge = event.data.object as any;
        const paymentId = charge.id as string;
        const creatorId = charge.metadata?.creatorId as string | undefined;
        const userId = charge.metadata?.userId as string | undefined;
        const amount = charge.amount as number;

        if (creatorId && userId) {
          await prisma.tip.upsert({
            where: { stripePaymentId: paymentId },
            update: {},
            create: {
              stripePaymentId: paymentId,
              amountCents: amount,
              creatorId,
              userId,
            },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ received: true, error: true });
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: { bodyParser: false },
};
