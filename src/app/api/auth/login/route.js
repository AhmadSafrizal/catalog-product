import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  let prisma;
  try {
    // dynamic import so module-level Prisma instantiation errors can be caught here
    prisma = (await import("@/lib/prisma")).default;
  } catch (err) {
    console.error("Prisma import error", err);
    return new Response(
      JSON.stringify({ error: "Prisma import error", message: err.message, stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined }),
      { status: 500 }
    );
  }

  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return new Response(JSON.stringify({ data: { token, user: { id: user.id, email: user.email, role: user.role } } }), { status: 200 });
  } catch (err) {
    console.error("Login handler error", err);
    return new Response(JSON.stringify({ error: "Server error", message: err.message, stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined }), { status: 500 });
  }
}
