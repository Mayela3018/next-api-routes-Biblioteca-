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
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(author);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener autor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, nationality, birthYear, bio } = body;

    const author = await prisma.author.update({
      where: { id },
      data: { name, email, nationality, birthYear, bio },
    });
    return NextResponse.json(author);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar autor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.author.delete({ where: { id } });
    return NextResponse.json({ message: "Autor eliminado correctamente" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar autor" },
      { status: 500 }
    );
  }
}