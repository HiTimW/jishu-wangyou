import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const response = await prisma.response.findUnique({
    where: { id },
    include: { request: true },
  });

  if (!response) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }

  if (response.request.authorId !== session.user.id) {
    return NextResponse.json({ error: "Only the requester can accept" }, { status: 403 });
  }

  if (response.accepted) {
    return NextResponse.json({ error: "Already accepted" }, { status: 400 });
  }

  const reward = response.request.reward;
  const platformFee = Math.floor(reward * 0.1);
  const expertEarnings = reward - platformFee;

  // Process settlement in a transaction
  await prisma.$transaction([
    // Mark response as accepted
    prisma.response.update({
      where: { id },
      data: { accepted: true },
    }),
    // Update request status
    prisma.request.update({
      where: { id: response.requestId },
      data: { status: "RESOLVED" },
    }),
    // Unfreeze requester's tokens (reduce frozen amount)
    prisma.user.update({
      where: { id: response.request.authorId },
      data: { frozenTokens: { decrement: reward } },
    }),
    // Credit expert's balance
    prisma.user.update({
      where: { id: response.expertId },
      data: { tokenBalance: { increment: expertEarnings } },
    }),
    // Record requester's spend transaction
    prisma.transaction.create({
      data: {
        type: "SPEND",
        amount: -reward,
        description: `求助「${response.request.title}」已解决，支付${reward}积分`,
        userId: response.request.authorId,
        requestId: response.requestId,
      },
    }),
    // Record expert's earn transaction
    prisma.transaction.create({
      data: {
        type: "EARN",
        amount: expertEarnings,
        description: `回答求助「${response.request.title}」获得${expertEarnings}积分（平台扣除${platformFee}积分）`,
        userId: response.expertId,
        requestId: response.requestId,
      },
    }),
  ]);

  return NextResponse.json({ success: true, expertEarnings, platformFee });
}
