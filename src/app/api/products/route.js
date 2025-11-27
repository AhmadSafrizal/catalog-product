import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

export async function GET(req) {
  try {
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
      JSON.stringify({ data: products, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export const POST = adminOnly(async (req, ctx) => {
  try {
    const body = await req.json();

    // Extract nested arrays if provided
    const { images, variants, categoryId, ...data } = body;

    const createData = {
      ...data,
      category: categoryId ? { connect: { id: Number(categoryId) } } : undefined,
      images: images ? { create: images.map((url) => ({ url })) } : undefined,
      variants: variants
        ? {
            create: variants.map((v) => ({
              size: v.size,
              color: v.color,
              stock: v.stock ?? 0,
              sku: v.sku,
            })),
          }
        : undefined,
    };

    const product = await prisma.product.create({ data: createData, include: { images: true, variants: true, category: true } });
    return new Response(JSON.stringify({ data: product }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});
