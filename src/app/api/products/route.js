import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

export async function GET(req) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const search = url.searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { images: true, variants: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return new Response(
    JSON.stringify({
      data: products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }),
    { status: 200 }
  );
}

export const POST = adminOnly(async (req) => {
  const body = await req.json();
  const product = await prisma.product.create({ data: body });
  return new Response(JSON.stringify(product), { status: 201 });
});
