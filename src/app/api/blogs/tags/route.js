import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

// GET all tags
export async function GET() {
  const tags = await prisma.tag.findMany();
  return new Response(JSON.stringify(tags), { status: 200 });
}

// POST create tag
export const POST = adminOnly(async (req) => {
  const body = await req.json(); // { name, slug }
  const tag = await prisma.tag.create({ data: body });
  return new Response(JSON.stringify(tag), { status: 201 });
})