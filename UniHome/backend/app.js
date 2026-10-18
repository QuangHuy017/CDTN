const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { rateLimit } = require("express-rate-limit");
const User = require("./models/User");

function createApp({ secret, expiresIn = "1h", users = User, catalogModels } = {}) {
  if (typeof secret !== "string" || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET phải có ít nhất 32 byte.");
  }
  const jwtOptions = { algorithm: "HS256", issuer: "unihome", audience: "unihome-api", expiresIn };
  // Validate configuration before accepting requests.
  jwt.sign({}, secret, jwtOptions);
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));
  app.get("/", (req, res) => res.json({
    message: "UniHome REST API đang chạy.",
    endpoints: {
      buildings: "/api/buildings",
      rooms: "/api/rooms",
      amenities: "/api/amenities"
    }
  }));
  app.use("/api/auth", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 30,
    standardHeaders: "draft-8", legacyHeaders: false,
    message: { message: "Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút." }
  });
  const roleOf = (user) => user.vaiTro === "admin" ? "admin" : user.vaiTro === "user" ? "tenant" : undefined;
  const publicUser = (user) => ({ id: String(user._id), name: user.hoTen, email: user.email, phone: user.soDienThoai || "", role: roleOf(user) });
  const tokenFor = (user) => jwt.sign({}, secret, { ...jwtOptions, subject: String(user._id) });
  const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/api" };
  function signedIn(res, user, status = 200) {
    const token = tokenFor(user);
    const expiresAt = new Date(jwt.decode(token).exp * 1000);
    res.cookie("unihome_session", token, { ...cookieOptions, expires: expiresAt });
    return res.status(status).json({ token, tokenType: "Bearer", expiresAt: expiresAt.toISOString(), user: publicUser(user) });
  }
  const normalizePhone = (value) => {
    if (typeof value !== "string") return null;
    const phone = value.replace(/[\s().-]/g, "").replace(/^\+84/, "0");
    return /^0[35789]\d{8}$/.test(phone) ? phone : null;
  };
  const credentials = (body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    if (typeof body.email !== "string" || typeof body.password !== "string") return null;
    const email = body.email.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    // bcrypt only considers the first 72 bytes: reject longer passwords.
    if (!body.password.length || Buffer.byteLength(body.password, "utf8") > 72) return null;
    return { email, password: body.password };
  };
  // Compare a real hash even when the email does not exist.
  const dummyHash = bcrypt.hashSync("unihome-dummy-password", 12);

  app.post("/api/auth/register", limiter, async (req, res) => {
    const input = credentials(req.body);
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const phone = req.body?.phone === undefined || req.body.phone === "" ? undefined : normalizePhone(req.body.phone);
    if (!input || input.password.length < 8 || !name || name.length > 100) {
      return res.status(400).json({ message: "Tên tối đa 100 ký tự, email hợp lệ, mật khẩu ít nhất 8 ký tự và tối đa 72 byte." });
    }
    if (phone === null) return res.status(400).json({ message: "Số điện thoại Việt Nam không hợp lệ." });
    if (await users.findOne({ email: input.email })) {
      return res.status(409).json({ message: "Email đã được đăng ký." });
    }
    if (phone && await users.findOne({ soDienThoai: phone })) return res.status(409).json({ message: "Số điện thoại đã được đăng ký." });
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
      const user = await users.create({ hoTen: name, email: input.email, ...(phone ? { soDienThoai: phone } : {}), matKhau: passwordHash, vaiTro: "user", trangThai: "hoat_dong" });
      return signedIn(res, user, 201);
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: "Email hoặc số điện thoại đã được đăng ký." });
      throw error;
    }
  });

  app.post("/api/auth/login", limiter, async (req, res) => {
    const identifier = typeof (req.body?.identifier ?? req.body?.email) === "string" ? (req.body.identifier ?? req.body.email).trim().toLowerCase() : "";
    const password = req.body?.password;
    const phone = normalizePhone(identifier);
    const emailInput = credentials({ email: identifier, password });
    if ((!emailInput && !phone) || typeof password !== "string" || !password.length || Buffer.byteLength(password) > 72) return res.status(400).json({ message: "Email, số điện thoại hoặc mật khẩu không hợp lệ." });
    const user = await users.findOne(phone ? { soDienThoai: phone } : { email: emailInput.email }).select("+matKhau");
    const validHash = typeof user?.matKhau === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.matKhau);
    const matches = await bcrypt.compare(password, validHash ? user.matKhau : dummyHash);
    if (!user || !validHash || !matches) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    if (user.trangThai !== "hoat_dong" || !["user", "admin"].includes(user.vaiTro)) return res.status(403).json({ message: "Tài khoản đã bị khóa hoặc không được phép đăng nhập. Vui lòng liên hệ quản trị viên." });
    return signedIn(res, user);
  });

  app.post("/api/auth/logout", (req, res) => {
    // JSON-only prevents cross-site HTML forms from changing the cookie session.
    if (!req.is("application/json")) return res.status(415).json({ message: "Yêu cầu Content-Type application/json." });
    res.clearCookie("unihome_session", cookieOptions);
    res.json({ message: "Đã đăng xuất." });
  });

  async function authenticate(req, res, next) {
    const cookie = (req.get("Cookie") || "").split(";").map((value) => value.trim()).find((value) => value.startsWith("unihome_session="));
    const match = req.get("Authorization") ? /^Bearer ([^\s]+)$/i.exec(req.get("Authorization")) : cookie ? [null, cookie.slice("unihome_session=".length)] : null;
    if (!match) return res.status(401).json({ message: "Vui lòng đăng nhập." });
    let payload;
    try {
      payload = jwt.verify(match[1], secret, {
        algorithms: ["HS256"], issuer: "unihome", audience: "unihome-api"
      });
      if (typeof payload.sub !== "string" || !/^[a-f\d]{24}$/i.test(payload.sub)) throw new Error("Invalid subject");
    } catch {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
    const user = await users.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Tài khoản không tồn tại." });
    if (user.trangThai !== "hoat_dong" || !["user", "admin"].includes(user.vaiTro)) return res.status(403).json({ message: "Tài khoản đã bị khóa hoặc không được phép truy cập." });
    req.user = user;
    next();
  }
  app.locals.authenticate = authenticate;
  function authorize(...roles) {
    if (!roles.length || roles.some((role) => !["tenant", "admin"].includes(role))) {
      throw new Error("Vai trò phân quyền không hợp lệ.");
    }
    return (req, res, next) => {
      if (!req.user) return res.status(401).json({ message: "Vui lòng đăng nhập." });
      if (!roles.includes(roleOf(req.user))) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này." });
      }
      next();
    };
  }
  app.locals.authorize = authorize;
  app.get("/api/auth/me", authenticate, (req, res) => res.json({ user: publicUser(req.user) }));
  app.get("/api/admin/me", authenticate, authorize("admin"), (req, res) => res.json({ user: publicUser(req.user) }));
  app.get("/api/tenant/me", authenticate, authorize("tenant"), (req, res) => res.json({ user: publicUser(req.user) }));
  app.use("/api", require("./routes/catalog")({ authenticate, authorize, models: catalogModels }));
  app.use((req, res) => res.status(404).json({ message: "Không tìm thấy API." }));
  app.use((error, req, res, next) => {
    if (error.status) return res.status(error.status).json({ message: error.message });
    if (error.code === 11000) return res.status(409).json({ message: "Mã hoặc tên đã tồn tại." });
    if (["ValidationError", "CastError", "StrictModeError"].includes(error.name)) return res.status(400).json({ message: "Dữ liệu không hợp lệ.", details: error.message });
    if (error.type === "entity.parse.failed") return res.status(400).json({ message: "JSON không hợp lệ." });
    if (error.type === "entity.too.large") return res.status(413).json({ message: "Dữ liệu gửi lên quá lớn." });
    console.error("API error:", error.name);
    res.status(500).json({ message: "Lỗi máy chủ. Vui lòng thử lại sau." });
  });
  return app;
}

module.exports = { createApp };
