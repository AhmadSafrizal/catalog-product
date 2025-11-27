import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

export const PUT = adminOnly(async (req) => {
  const { id } = req.params;
  const body = await req.json();
  const updated = await prisma.tag.update({
    where: { id: Number(id) },
    data: body,
  });
  return new Response(JSON.stringify(updated), { status: 200 });
})

export const DELETE = adminOnly(async (req) => {
  const { id } = req.params;
  await prisma.tag.delete({ where: { id: Number(id) } });
  return new Response("Deleted", { status: 204 });
})