import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

// GET one product by ID
export async function GET(req) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { images: true, variants: true, category: true },
  });

  if (!product) return new Response("Product not found", { status: 404 });

  return new Response(JSON.stringify(product), { status: 200 });
}

export async function GET(req) {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { images: true, variants: true, category: true },
  });
  if (!product) return new Response("Product not found", { status: 404 });
  return new Response(JSON.stringify(product), { status: 200 });
}

export const PUT = adminOnly(async (req) => {
  const { id } = req.params;
  const body = await req.json();
  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: body,
  });
  return new Response(JSON.stringify(updated), { status: 200 });
});

export const DELETE = adminOnly(async (req) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id: Number(id) } });
  return new Response("Deleted", { status: 204 });
});
