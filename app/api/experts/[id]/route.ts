import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const expert = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      skills: true,
      avatar: true,
      createdAt: true,
      responses: {
        where: { accepted: true },
        include: {
          request: { select: { id: true, title: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { responses: true } },
    },
  });

  if (!expert) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(expert);
}
