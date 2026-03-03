import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tokens, bankInfo } = body;

  if (!tokens || tokens < 100) {
    return NextResponse.json({ error: "Minimum withdrawal is 100 tokens" }, { status: 400 });
  }

  if (!bankInfo) {
    return NextResponse.json({ error: "Bank info required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tokenBalance: true },
  });

  if (!user || user.tokenBalance < tokens) {
    return NextResponse.json({ error: "Insufficient token balance" }, { status: 400 });
  }

  const platformFee = Math.floor(tokens * 0.1);
  const netTokens = tokens - platformFee;
  const amount = netTokens / 10; // 10 tokens = 1 CNY

  const userId = session.user.id as string;
  const withdrawal = await prisma.$transaction(async (tx) => {
    const w = await tx.withdrawal.create({
      data: {
        tokens,
        amount,
        bankInfo,
        userId,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { tokenBalance: { decrement: tokens } },
    });

    await tx.transaction.create({
      data: {
        type: "WITHDRAW",
        amount: -tokens,
        description: `申请提现${tokens}积分，预计到账${amount}元（平台扣除${platformFee}积分）`,
        userId,
      },
    });

    return w;
  });

  return NextResponse.json({ success: true, withdrawal });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(withdrawals);
}
