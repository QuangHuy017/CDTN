async function authenticate(endpoint, { name, email, identifier, phone, password }, signal) {
  let response;
  try {
    response = await fetch(`/api/auth/${endpoint}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(name === undefined ? {} : { name: name.trim() }), ...(email === undefined ? {} : { email: email.trim() }), ...(identifier === undefined ? {} : { identifier: identifier.trim() }), ...(phone === undefined ? {} : { phone: phone.trim() }), password }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Không thể kết nối máy chủ. Vui lòng thử lại.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Không thể đăng nhập. Kiểm tra backend có đang chạy ở cổng 3000.");
  if (!data?.token || !data?.user?.name) throw new Error("Phản hồi đăng nhập không hợp lệ.");
  return data;
}

export const login = (data, signal) => authenticate("login", data, signal);
export const register = (data, signal) => authenticate("register", data, signal);

export async function getCurrentUser(signal) {
  const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store", signal });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.user) throw Object.assign(new Error(data?.message || "Không thể kiểm tra phiên đăng nhập."), { status: response.status });
  return data;
}

export async function logout() {
  const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Chưa thể đăng xuất. Vui lòng thử lại.");
}
