import { useEffect, useState } from "react";
import { adminRequest } from "../../services/adminService";

export default function RoomInterestList({ roomId }) {
  const [result, setResult] = useState(null), [page, setPage] = useState(1), [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController(); setError(""); setResult(null);
    adminRequest(`/rooms/${roomId}/interest/registrations?page=${page}`, { signal: controller.signal }).then(setResult).catch((err) => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [roomId, page]);
  return <details className="rounded-lg border border-slate-200 p-3 sm:col-span-2"><summary className="cursor-pointer text-xs font-semibold text-sky-800">Người đăng ký quan tâm ({result?.pagination.total ?? "…"})</summary>{error ? <p role="alert" className="mt-3 text-xs text-red-700">{error}</p> : !result ? <p className="mt-3 text-xs">Đang tải…</p> : <><ul className="mt-3 space-y-3">{result.data.map((item) => <li key={item._id} className="break-words border-t border-slate-100 pt-2 text-xs"><strong>{item.name}</strong><p className="mt-1 text-slate-500">{item.email} {item.phone && ` · ${item.phone}`}</p></li>)}</ul>{!result.data.length && <p className="mt-3 text-xs text-slate-500">Chưa có người đăng ký.</p>}{result.pagination.totalPages > 1 && <div className="mt-3 flex gap-3 text-xs"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</button><span>{page}/{result.pagination.totalPages}</span><button type="button" disabled={page >= result.pagination.totalPages} onClick={() => setPage(page + 1)}>Sau</button></div>}</>}</details>;
}
