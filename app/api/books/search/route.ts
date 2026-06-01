import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const authorName = searchParams.get("authorName") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && { title: { contains: search, mode: "insensitive" } }),
      ...(genre && { genre }),
      ...(authorName && {
        author: { name: { contains: authorName, mode: "insensitive" } },
      }),
    };

   type SortField = "title" | "publishedYear" | "createdAt";
const validSortFields: SortField[] = ["title", "publishedYear", "createdAt"];
const safeSortBy: SortField = validSortFields.includes(sortBy as SortField)
  ? (sortBy as SortField)
  : "createdAt";
const orderBy = { [safeSortBy]: order as "asc" | "desc" };
    const [data, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: { author: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error en la búsqueda" },
      { status: 500 }
    );
  }
}