import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const experts = await prisma.user.findMany({
    where: {
      role: { in: ["EXPERT", "BOTH"] },
    },
    select: {
      id: true,
      name: true,
      bio: true,
      skills: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: { responses: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(experts);
}
