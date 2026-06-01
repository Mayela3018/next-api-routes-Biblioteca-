import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: true },
    });

    if (!author) {
      return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });
    }

    const books = author.books;

    if (books.length === 0) {
      return NextResponse.json({
        authorId: id, authorName: author.name,
        totalBooks: 0, firstBook: null, latestBook: null,
        averagePages: 0, genres: [], longestBook: null, shortestBook: null,
      });
    }

    const sorted = [...books].sort((a, b) => (a.publishedYear ?? 0) - (b.publishedYear ?? 0));
    const byPages = [...books].filter(b => b.pages).sort((a, b) => (a.pages ?? 0) - (b.pages ?? 0));
const totalPagesSum = books.reduce((sum: number, b) => sum + (b.pages ?? 0), 0);
    const genres = [...new Set(books.map(b => b.genre).filter(Boolean))];

    return NextResponse.json({
      authorId: id,
      authorName: author.name,
      totalBooks: books.length,
      firstBook: sorted[0] ? { title: sorted[0].title, year: sorted[0].publishedYear } : null,
      latestBook: sorted[sorted.length - 1] ? { title: sorted[sorted.length - 1].title, year: sorted[sorted.length - 1].publishedYear } : null,
      averagePages: Math.round(totalPagesSum / (books.filter(b => b.pages).length || 1)),
      genres,
      longestBook: byPages[byPages.length - 1] ? { title: byPages[byPages.length - 1].title, pages: byPages[byPages.length - 1].pages } : null,
      shortestBook: byPages[0] ? { title: byPages[0].title, pages: byPages[0].pages } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}