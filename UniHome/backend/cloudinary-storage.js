const { createHash, randomUUID } = require("node:crypto");

function createCloudinaryStorage(env = process.env, fetchRequest = fetch) {
  const keys = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const values = keys.map((key) => env[key]?.trim());
  if (!values.some(Boolean)) return null;
  const [cloudName, apiKey, apiSecret] = values;
  async function request(action, params, buffer) {
    if (!values.every(Boolean)) throw new Error("Cloudinary configuration incomplete");
    const signed = { ...params, timestamp: String(Math.floor(Date.now() / 1000)) };
    const signature = createHash("sha1").update(Object.keys(signed).sort().map((key) => `${key}=${signed[key]}`).join("&") + apiSecret).digest("hex");
    const body = new FormData();
    for (const [key, value] of Object.entries(signed)) body.append(key, value);
    body.append("api_key", apiKey); body.append("signature", signature);
    if (buffer) body.append("file", new Blob([buffer], { type: "image/webp" }), "room.webp");
    const response = await fetchRequest(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/${action}`, { method: "POST", body, signal: AbortSignal.timeout(30000) });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.error) throw new Error("Cloudinary request failed");
    return result;
  }
  return {
    async upload(buffer) {
      const publicId = `unihome/rooms/${randomUUID()}`;
      const result = await request("upload", { public_id: publicId, overwrite: "false" }, buffer);
      if (result.public_id !== publicId || typeof result.secure_url !== "string" || !result.secure_url.startsWith("https://")) throw new Error("Invalid Cloudinary response");
      return { url: result.secure_url, publicId };
    },
    async remove(publicId) {
      if (!/^unihome\/rooms\/[a-f0-9-]+$/.test(publicId)) throw new Error("Invalid uploaded image ID");
      const result = await request("destroy", { public_id: publicId, invalidate: "true" });
      if (!["ok", "not found"].includes(result.result)) throw new Error("Cloudinary cleanup failed");
    }
  };
}
module.exports = { createCloudinaryStorage };
