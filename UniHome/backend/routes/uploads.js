const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("node:path");
const fs = require("node:fs/promises");
const { randomUUID } = require("node:crypto");
const { createCloudinaryStorage } = require("../cloudinary-storage");

module.exports = function uploads({ authenticate, authorize, directory, imageStorage }) {
  // An explicit directory isolates local-storage tests from real cloud credentials.
  const storage = imageStorage || (directory ? null : createCloudinaryStorage());
  directory ||= path.join(__dirname, "../uploads/rooms");
  const router = express.Router();
  const receive = multer({ storage: multer.memoryStorage(), limits: { files: 10, fileSize: 5 * 1024 * 1024, fields: 0, parts: 10 },
    fileFilter(req, file, done) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return done(Object.assign(new Error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP."), { status: 400 }));
      done(null, true);
    }
  }).array("images", 10);
  router.post("/", authenticate, authorize("admin"), (req, res, next) => receive(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Mỗi ảnh tối đa 5 MB." : "Mỗi lần tải tối đa 10 ảnh, dùng trường images." });
    next(error);
  }), async (req, res) => {
    if (!req.files?.length) return res.status(400).json({ message: "Vui lòng chọn ảnh để tải lên." });
    const converted = [];
    try {
      for (const file of req.files) {
        const image = sharp(file.buffer, { limitInputPixels: 25000000 });
        const metadata = await image.metadata();
        if (!["jpeg", "png", "webp"].includes(metadata.format)) throw new Error("Unsupported image");
        converted.push(await image.rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer());
      }
    } catch { return res.status(400).json({ message: "Ảnh không hợp lệ, bị hỏng hoặc quá lớn (tối đa 25 triệu điểm ảnh)." }); }
    if (storage) {
      const uploaded = [];
      try {
        for (const buffer of converted) uploaded.push(await storage.upload(buffer));
      } catch {
        await Promise.allSettled(uploaded.map((image) => storage.remove(image.publicId)));
        return res.status(502).json({ message: "Không thể tải ảnh lên Cloudinary. Vui lòng kiểm tra cấu hình hoặc thử lại." });
      }
      return res.status(201).json({ data: uploaded.map((image) => image.url) });
    }
    const written = [];
    try {
      await fs.mkdir(directory, { recursive: true });
      for (const buffer of converted) {
        const name = `${randomUUID()}.webp`;
        await fs.writeFile(path.join(directory, name), buffer, { flag: "wx" }); written.push(name);
      }
    } catch (error) {
      await Promise.allSettled(written.map((name) => fs.unlink(path.join(directory, name))));
      throw error;
    }
    res.status(201).json({ data: written.map((name) => `/api/uploads/rooms/${name}`) });
  });
  router.use(express.static(directory, { index: false, dotfiles: "deny", maxAge: "1y", immutable: true, setHeaders(res) { res.set("X-Content-Type-Options", "nosniff"); } }));
  return router;
};
