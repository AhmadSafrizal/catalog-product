import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response("Invalid credentials", { status: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return new Response("Invalid credentials", { status: 401 });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return new Response(JSON.stringify({ token, user: { id: user.id, email: user.email, role: user.role } }), { status: 200 });
}
