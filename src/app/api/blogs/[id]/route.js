import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

export async function GET(req) {
  const { id } = req.params;

  const blog = await prisma.blog.findUnique({
    where: { id: Number(id) },
    include: { tags: { include: { tag: true } }, images: true },
  });

  if (!blog) return new Response("Blog not found", { status: 404 });

  return new Response(JSON.stringify(blog), { status: 200 });
}

export const PUT = adminOnly(async (req) => {
  const { id } = req.params;
  const body = await req.json();
  const { tagIds, ...data } = body;

  const updated = await prisma.blog.update({
    where: { id: Number(id) },
    data: {
      ...data,
      tags: tagIds
        ? {
            deleteMany: {}, // hapus tag lama
            create: tagIds.map((tagId) => ({ tagId: Number(tagId) })),
          }
        : undefined,
    },
    include: { tags: true, images: true },
  });

  return new Response(JSON.stringify(updated), { status: 200 });
})

export const DELETE = adminOnly(async (req) => {
  const { id } = req.params;

  await prisma.blog.delete({
    where: { id: Number(id) },
  });

  return new Response("Deleted", { status: 204 });
})
