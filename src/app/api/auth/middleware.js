import jwt from "jsonwebtoken";

export function authMiddleware(handler) {
  // Returns a wrapper compatible with Next.js App Router handlers
  // Handler signature: (req, ctx) where ctx contains { params, ... }
  return async (req, ctx) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const newCtx = { ...(ctx || {}), user: decoded };
      return handler(req, newCtx);
    } catch {
      return new Response("Invalid token", { status: 401 });
    }
  };
}

export function adminOnly(handler) {
  return authMiddleware(async (req, ctx) => {
    if (!ctx || !ctx.user || ctx.user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
    return handler(req, ctx);
  });
}
