import { authMiddleware } from "@/app/api/auth/middleware";
import fs from "fs";
import path from "path";

export const POST = authMiddleware(async (req, ctx) => {
  try {
    const form = await req.formData();

    const fileEntries = [];
    for (const [key, value] of form.entries()) {
      // value for files is a File-like object with arrayBuffer()
      if (value && typeof value.arrayBuffer === "function") {
        fileEntries.push({ field: key, file: value });
      }
    }

    if (fileEntries.length === 0) {
      return new Response(JSON.stringify({ error: "No files uploaded" }), { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const urls = [];
    const savedFiles = [];
    const productId = form.get("productId") || null;
    const blogId = form.get("blogId") || null;

    // Validation
    const ALLOWED_MIMES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    for (const entry of fileEntries) {
      const f = entry.file;
      if (f.size && f.size > MAX_SIZE) {
        return new Response(JSON.stringify({ error: `File too large: ${f.name}` }), { status: 400 });
      }
      if (f.type && !ALLOWED_MIMES.includes(f.type)) {
        return new Response(JSON.stringify({ error: `Invalid file type: ${f.type}` }), { status: 400 });
      }
    }

    // Write files
    for (const entry of fileEntries) {
      const file = entry.file;
      const originalName = file.name || "file";
      const safeName = `${Date.now()}-${path.basename(originalName).replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
      const dest = path.join(uploadDir, safeName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.promises.writeFile(dest, buffer);
      savedFiles.push(dest);
      const url = `/uploads/${safeName}`;
      urls.push(url);
    }

    // If need to persist DB records, do in a transaction. If transaction fails, cleanup files.
    if (productId || blogId) {
      const prisma = (await import("@/lib/prisma")).default;
      const ops = urls.map((url) => prisma.image.create({ data: { url, productId: productId ? Number(productId) : undefined, blogId: blogId ? Number(blogId) : undefined } }));
      try {
        await prisma.$transaction(ops);
      } catch (dbErr) {
        // rollback files
        for (const p of savedFiles) {
          try {
            await fs.promises.unlink(p);
          } catch (_) {}
        }
        console.error(dbErr);
        return new Response(JSON.stringify({ error: "DB save failed, files removed" }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ data: urls }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
});

export const DELETE = authMiddleware(async (req, ctx) => {
  try {
    const body = await req.json();
    const { id, url } = body || {};
    const prisma = (await import("@/lib/prisma")).default;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    let imageRecord = null;
    if (id) {
      imageRecord = await prisma.image.findUnique({ where: { id: Number(id) } });
    } else if (url) {
      imageRecord = await prisma.image.findFirst({ where: { url } });
    } else {
      return new Response(JSON.stringify({ error: "Provide id or url to delete" }), { status: 400 });
    }

    // If record exists in DB, delete it
    if (imageRecord) {
      await prisma.image.delete({ where: { id: imageRecord.id } });
    }

    // Attempt to delete file from disk if path looks like /uploads/...
    const targetUrl = url || (imageRecord && imageRecord.url);
    if (targetUrl && targetUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", targetUrl.replace(/^\//, ""));
      try {
        await fs.promises.unlink(filePath);
      } catch (e) {
        // ignore if file not found
      }
    }

    return new Response(JSON.stringify({ data: null }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Delete failed" }), { status: 500 });
  }
});
