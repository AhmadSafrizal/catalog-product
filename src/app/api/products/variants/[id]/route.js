import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const variant = await prisma.variant.findUnique({ where: { id: Number(id) } });
    if (!variant) return new Response(JSON.stringify({ error: "Variant not found" }), { status: 404 });
    return new Response(JSON.stringify({ data: variant }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export const PUT = adminOnly(async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await prisma.variant.update({ where: { id: Number(id) }, data: body });
    return new Response(JSON.stringify({ data: updated }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});

export const DELETE = adminOnly(async (req, { params }) => {
  try {
    const { id } = params;
    await prisma.variant.delete({ where: { id: Number(id) } });
    return new Response(JSON.stringify({ data: null }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});
