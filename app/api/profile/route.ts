import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      skills: true,
      avatar: true,
      tokenBalance: true,
      frozenTokens: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, bio, skills, avatar, role } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(skills !== undefined && { skills }),
      ...(avatar !== undefined && { avatar }),
      ...(role && { role }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      skills: true,
      avatar: true,
    },
  });

  return NextResponse.json(user);
}
