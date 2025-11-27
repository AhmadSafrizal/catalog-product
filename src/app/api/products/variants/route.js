import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

// GET all variants (filter by productId optional)
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    const where = productId ? { productId: Number(productId) } : {};
    const variants = await prisma.variant.findMany({ where });
    return new Response(JSON.stringify(variants), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// POST create variant (admin only)
export const POST = adminOnly(async (req, ctx) => {
  try {
    const body = await req.json();
    if (!body.productId) return new Response(JSON.stringify({ error: "productId required" }), { status: 400 });

    const product = await prisma.product.findUnique({ where: { id: Number(body.productId) } });
    if (!product) return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });

    const variant = await prisma.variant.create({ data: { productId: Number(body.productId), size: body.size, color: body.color, stock: body.stock ?? 0, sku: body.sku } });
    return new Response(JSON.stringify({ data: variant }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});
