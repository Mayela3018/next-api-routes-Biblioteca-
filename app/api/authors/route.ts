import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      include: { books: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(authors);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener autores" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, nationality, birthYear, bio } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    const author = await prisma.author.create({
      data: { name, email, nationality, birthYear, bio },
    });
    return NextResponse.json(author, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear autor" },
      { status: 500 }
    );
  }
}