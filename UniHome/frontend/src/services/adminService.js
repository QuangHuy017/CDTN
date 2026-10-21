export async function adminRequest(path, options = {}) {
  let response;
  try { response = await fetch(`/api${path}`, { credentials: "same-origin", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(15000), ...options }); }
  catch (error) { if (options.signal?.aborted) throw error; throw new Error("Không thể kết nối máy chủ. Vui lòng thử lại."); }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw Object.assign(new Error(data?.message || "Không xử lý được yêu cầu quản trị."), { status: response.status });
  return data;
}
