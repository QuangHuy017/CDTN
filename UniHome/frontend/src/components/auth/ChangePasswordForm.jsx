import { useState } from "react";
import { changePassword } from "../../services/authService";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setError(""); setMessage("");
    if (form.newPassword !== form.confirmPassword) { setError("Xác nhận mật khẩu mới không khớp."); return; }
    if (form.newPassword === form.currentPassword) { setError("Mật khẩu mới phải khác mật khẩu hiện tại."); return; }
    setSaving(true);
    try {
      const result = await changePassword(form);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage(result.message);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  return <section className="mt-8 border-t border-[#e9edf4] pt-6" aria-labelledby="change-password-heading">
    <h2 id="change-password-heading" className="text-lg font-semibold text-[#14253b]">Đổi mật khẩu</h2>
    <p className="mt-2 text-xs text-slate-500">Mật khẩu mới cần ít nhất 8 ký tự và khác mật khẩu hiện tại.</p>
    <form onSubmit={submit} className="mt-4 space-y-4">
      <fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
        {[["currentPassword", "Mật khẩu hiện tại", "current-password"], ["newPassword", "Mật khẩu mới", "new-password"], ["confirmPassword", "Xác nhận mật khẩu mới", "new-password"]].map(([key, label, autoComplete]) => <label key={key} className="block text-xs font-medium text-slate-700">{label}<input required type="password" autoComplete={autoComplete} minLength={key === "currentPassword" ? undefined : 8} maxLength={72} value={form[key]} onChange={(event) => { setForm({ ...form, [key]: event.target.value }); setMessage(""); setError(""); }} className="mt-2 h-11 w-full rounded-lg border border-[#dfe7f2] px-3.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>)}
      </fieldset>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <div className="flex justify-end"><button disabled={saving} className="rounded-lg bg-[#008ac4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50">{saving ? "Đang đổi…" : "Đổi mật khẩu"}</button></div>
    </form>
  </section>;
}
