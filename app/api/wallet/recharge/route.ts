import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { amount } = body; // amount in CNY

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const tokens = Math.floor(Number(amount) * 10); // 1 CNY = 10 tokens

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { tokenBalance: { increment: tokens } },
    }),
    prisma.transaction.create({
      data: {
        type: "RECHARGE",
        amount: tokens,
        description: `充值${amount}元，获得${tokens}积分`,
        userId: session.user.id,
      },
    }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tokenBalance: true, frozenTokens: true },
  });

  return NextResponse.json({ success: true, tokens, balance: user });
}
