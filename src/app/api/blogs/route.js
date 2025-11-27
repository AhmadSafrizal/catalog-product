import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

// GET all blogs
export async function GET(req) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const search = url.searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      skip,
      take: limit,
      include: { tags: { include: { tag: true } }, images: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blog.count({ where }),
  ]);

  return new Response(
    JSON.stringify({
      data: blogs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }),
    { status: 200 }
  );
}

// POST create blog
export const POST = adminOnly(async (req) => {
  const body = await req.json();
  // body contoh:
  // { title, slug, content, thumbnail, seoTitle, seoDesc, seoKeywords, tagIds: [1,2] }

  const { tagIds, ...data } = body;

  const blog = await prisma.blog.create({
    data: {
      ...data,
      tags: tagIds
        ? { create: tagIds.map((id) => ({ tagId: Number(id) })) }
        : undefined,
    },
    include: { tags: true, images: true },
  });

  return new Response(JSON.stringify(blog), { status: 201 });
})