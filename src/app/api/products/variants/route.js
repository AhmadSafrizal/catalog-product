import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

// GET all variants (filter by productId optional)
export async function GET(req) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  const where = productId ? { productId: Number(productId) } : {};
  const variants = await prisma.variant.findMany({ where });
  return new Response(JSON.stringify(variants), { status: 200 });
}

// POST create variant (admin only)
export const POST = adminOnly(async (req) => {
  const body = await req.json();
  const variant = await prisma.variant.create({ data: body });
  return new Response(JSON.stringify(variant), { status: 201 });
});
