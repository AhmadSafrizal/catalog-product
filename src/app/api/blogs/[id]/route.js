import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const blog = await prisma.blog.findUnique({
      where: { id: Number(id) },
      include: { tags: { include: { tag: true } }, images: true },
    });

    if (!blog) return new Response(JSON.stringify({ error: "Blog not found" }), { status: 404 });

    return new Response(JSON.stringify({ data: blog }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export const PUT = adminOnly(async (req, { params }) => {
  try {
    const { id } = params;
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

    return new Response(JSON.stringify({ data: updated }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
})

export const DELETE = adminOnly(async (req, { params }) => {
  try {
    const { id } = params;

    await prisma.blog.delete({
      where: { id: Number(id) },
    });

    return new Response(JSON.stringify({ data: null }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
})
