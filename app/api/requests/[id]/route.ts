import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatar: true, bio: true } },
      responses: {
        include: {
          expert: { select: { id: true, name: true, avatar: true, skills: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(request);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.authorId === session.user.id) {
    return NextResponse.json({ error: "Cannot reply to own request" }, { status: 400 });
  }

  const response = await prisma.response.create({
    data: {
      content,
      requestId: id,
      expertId: session.user.id,
    },
    include: {
      expert: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Update request status
  await prisma.request.update({
    where: { id },
    data: { status: "IN_PROGRESS" },
  });

  return NextResponse.json(response, { status: 201 });
}
