import { useEffect, useRef, useState } from "react";

export default function useAuthSubmit() {
  const request = useRef(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => request.current?.abort(), []);
  async function submit(action, values, onSuccess) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true); setError("");
    const timeout = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), 15000);
    try {
      const data = await action(values, controller.signal);
      if (!controller.signal.aborted) onSuccess(data);
    } catch (error) {
      if (!controller.signal.aborted || controller.signal.reason?.name === "TimeoutError") setError(controller.signal.reason?.name === "TimeoutError" ? "Kết nối quá lâu. Vui lòng thử lại." : error.message);
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) request.current = null;
      if (!controller.signal.aborted || controller.signal.reason?.name === "TimeoutError") setPending(false);
    }
  }
  return { pending, error, setError, submit };
}
