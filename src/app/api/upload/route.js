import formidable from "formidable";
import { authMiddleware } from "@/app/api/auth/middleware";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

export const POST = authMiddleware(async (req) => {
  const form = formidable({ multiples: true, uploadDir: "public/uploads", keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);
      const fileArray = Array.isArray(files.file) ? files.file : [files.file];
      const urls = fileArray.map((f) => `/uploads/${path.basename(f.filepath)}`);

      // save to Prisma table if productId or blogId
      if (fields.productId || fields.blogId) {
        const prisma = (await import("@/lib/prisma")).default;
        for (const url of urls) {
          await prisma.image.create({
            data: { url, productId: fields.productId ? Number(fields.productId) : undefined,
                    blogId: fields.blogId ? Number(fields.blogId) : undefined },
          });
        }
      }

      resolve(new Response(JSON.stringify({ urls }), { status: 201 }));
    });
  });
});
