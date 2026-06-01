import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");

    const books = await prisma.book.findMany({
      where: genre ? { genre } : {},
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener libros" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, isbn, publishedYear, genre, pages, authorId } =
      body;

    if (!title || !authorId) {
      return NextResponse.json(
        { error: "Título y authorId son requeridos" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: { title, description, isbn, publishedYear, genre, pages, authorId },
      include: { author: true },
    });
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear libro" },
      { status: 500 }
    );
  }
}