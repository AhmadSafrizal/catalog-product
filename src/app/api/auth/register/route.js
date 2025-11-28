import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: "Email already registered" }), { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Do not allow client to set arbitrary roles; default to 'admin' for now
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "admin" },
    });

    // create JWT so registration logs in immediately
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return new Response(JSON.stringify({ data: { token, user: { id: user.id, email: user.email, role: user.role } } }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
