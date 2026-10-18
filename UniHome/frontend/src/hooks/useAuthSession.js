import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentUser, logout } from "../services/authService";

export default function useAuthSession() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    const current = generation.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const data = await getCurrentUser(controller.signal);
      if (current === generation.current && !controller.signal.aborted) setSession(data);
    } catch (error) {
      if (current === generation.current && !controller.signal.aborted && [401, 403].includes(error.status)) setSession(null);
    } finally {
      clearTimeout(timeout);
      if (current === generation.current && request.current === controller) setInitializing(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    const onFocus = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", onFocus);
    const interval = setInterval(onFocus, 60000);
    return () => { request.current?.abort(); window.removeEventListener("focus", onFocus); clearInterval(interval); };
  }, [refresh]);
  function signIn(data) {
    generation.current += 1;
    request.current?.abort();
    setSession({ user: data.user, expiresAt: data.expiresAt });
    setInitializing(false); setError("");
  }
  async function signOut() {
    if (busy.current) return;
    busy.current = true;
    generation.current += 1;
    request.current?.abort(); setError("");
    try { await logout(); setSession(null); }
    catch { setError("Chưa thể đăng xuất. Hãy kiểm tra kết nối và thử lại."); }
    finally { busy.current = false; setInitializing(false); }
  }
  return { session, initializing, error, signIn, signOut };
}
