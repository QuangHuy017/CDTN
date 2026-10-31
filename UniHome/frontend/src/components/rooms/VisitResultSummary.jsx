export const visitOutcomes = {
  wants_to_rent: "Khách muốn thuê phòng",
  considering: "Khách cần suy nghĩ thêm",
  not_interested: "Khách không muốn thuê",
  undecided: "Chưa xác định được nhu cầu"
};
export default function VisitResultSummary({ result }) {
  if (!result?.attendance) return null;
  return <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-5 text-slate-600"><p className="font-semibold text-slate-800">Kết quả xem phòng</p><p>{result.attendance === "attended" ? "Đã đến xem phòng" : "Không đến xem phòng"}</p>{result.attendance === "attended" && result.outcome && <p>{visitOutcomes[result.outcome]}</p>}</div>;
}
