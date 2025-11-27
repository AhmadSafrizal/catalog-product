import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

// GET one product by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { images: true, variants: true, category: true },
    });

    if (!product) return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });

    return new Response(JSON.stringify({ data: product }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export const PUT = adminOnly(async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const { images, variants, categoryId, ...data } = body;

    const updateData = {
      ...data,
      category: categoryId ? { connect: { id: Number(categoryId) } } : undefined,
      images: images
        ? {
            deleteMany: {},
            create: images.map((url) => ({ url })),
          }
        : undefined,
      variants: variants
        ? {
            // This simplistic approach deletes existing variants and creates new ones
            deleteMany: {},
            create: variants.map((v) => ({ size: v.size, color: v.color, stock: v.stock ?? 0, sku: v.sku })),
          }
        : undefined,
    };

    const updated = await prisma.product.update({ where: { id: Number(id) }, data: updateData, include: { images: true, variants: true, category: true } });
    return new Response(JSON.stringify({ data: updated }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});

export const DELETE = adminOnly(async (req, { params }) => {
  try {
    const { id } = params;
    await prisma.product.delete({ where: { id: Number(id) } });
    return new Response(JSON.stringify({ data: null }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});
