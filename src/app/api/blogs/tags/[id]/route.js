import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

export const PUT = adminOnly(async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await prisma.tag.update({
      where: { id: Number(id) },
      data: body,
    });
    return new Response(JSON.stringify({ data: updated }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
})

export const DELETE = adminOnly(async (req, { params }) => {
  try {
    const { id } = params;
    await prisma.tag.delete({ where: { id: Number(id) } });
    return new Response(JSON.stringify({ data: null }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
})