import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { name, email, password, role } = await req.json();

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
  });

  return new Response(JSON.stringify({ id: user.id, email: user.email, role: user.role }), { status: 201 });
}
