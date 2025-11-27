import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

export async function GET(req) {
  const { id } = req.params;
  const variant = await prisma.variant.findUnique({ where: { id: Number(id) } });
  if (!variant) return new Response("Variant not found", { status: 404 });
  return new Response(JSON.stringify(variant), { status: 200 });
}

export const PUT = adminOnly(async (req) => {
  const { id } = req.params;
  const body = await req.json();
  const updated = await prisma.variant.update({ where: { id: Number(id) }, data: body });
  return new Response(JSON.stringify(updated), { status: 200 });
});

export const DELETE = adminOnly(async (req) => {
  const { id } = req.params;
  await prisma.variant.delete({ where: { id: Number(id) } });
  return new Response("Deleted", { status: 204 });
});
