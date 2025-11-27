import prisma from "@/lib/prisma";
import { adminOnly } from "@/app/api/auth/middleware";

// GET all tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany();
    return new Response(JSON.stringify({ data: tags }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// POST create tag
export const POST = adminOnly(async (req, ctx) => {
  try {
    const body = await req.json(); // { name, slug }
    const tag = await prisma.tag.create({ data: body });
    return new Response(JSON.stringify({ data: tag }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
})