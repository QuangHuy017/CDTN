async function request(path = "", options = {}) {
  let response;
  try { response = await fetch(`/api/contact-requests${path}`, { credentials: "same-origin", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(15000), ...options }); }
  catch (error) { if (options.signal?.aborted) throw error; throw new Error("Không thể kết nối máy chủ. Vui lòng thử lại."); }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw Object.assign(new Error(data?.message || "Chưa xử lý được yêu cầu."), { status: response.status });
  return data;
}
export const getContactRequests = (signal) => request("", { signal });
export const sendContactRequest = (data) => request("", { method: "POST", body: JSON.stringify(data) });
export const cancelContactRequest = (id) => request(`/${id}/cancel`, { method: "PATCH", body: "{}" });
