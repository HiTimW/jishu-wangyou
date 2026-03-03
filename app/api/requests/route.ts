import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const where: { category?: string; status?: string } = {};
  if (category) where.category = category;
  if (status) where.status = status;

  const requests = await prisma.request.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      responses: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, category, reward } = body;

  if (!title || !description || !category || !reward) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.tokenBalance < reward) {
    return NextResponse.json({ error: "Insufficient token balance" }, { status: 400 });
  }

  // Create request and freeze tokens in a transaction
  const [request] = await prisma.$transaction([
    prisma.request.create({
      data: {
        title,
        description,
        category,
        reward: Number(reward),
        authorId: session.user.id,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        tokenBalance: { decrement: Number(reward) },
        frozenTokens: { increment: Number(reward) },
      },
    }),
    prisma.transaction.create({
      data: {
        type: "FREEZE",
        amount: -Number(reward),
        description: `发布求助「${title}」，冻结${reward}积分`,
        userId: session.user.id,
      },
    }),
  ]);

  return NextResponse.json(request, { status: 201 });
}
