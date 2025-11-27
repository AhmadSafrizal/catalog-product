import jwt from "jsonwebtoken";

export function authMiddleware(handler) {
  return async (req) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return handler(req);
    } catch {
      return new Response("Invalid token", { status: 401 });
    }
  };
}

export function adminOnly(handler) {
  return authMiddleware(async (req) => {
    if (req.user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
    return handler(req);
  });
}
