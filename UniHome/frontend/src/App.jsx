import { useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/layout/Header";
import AuthHeader from "./components/auth/AuthHeader";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import Footer from "./components/layout/Footer";
import AiSupportButton from "./components/common/AiSupportButton";
import RoomDetailPage from "./pages/RoomDetailPage";
import useAuthSession from "./hooks/useAuthSession";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const authPage = ["/login", "/register"].includes(location.pathname);
  useEffect(() => {
    if (location.hash === "#ai-assistant") {
      const frame = requestAnimationFrame(() => {
        document.getElementById("ai-assistant")?.scrollIntoView();
        document.getElementById("room-prompt")?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  const { session, initializing, error: sessionError, signIn, signOut } = useAuthSession();
  function openAuth(mode) {
    navigate(`/${mode}`, { state: { from: location.pathname + location.search } });
  }
  function handleLogin(data) {
    signIn(data);
    const from = location.state?.from;
    navigate(typeof from === "string" && from.startsWith("/") && !from.startsWith("//") && !/^\/(login|register)(?:[/?#]|$)/.test(from) ? from : "/", { replace: true });
  }
  return (
    <div className="site-shell flex min-h-screen flex-col">
      {authPage ? <AuthHeader /> : <Header user={session?.user} onLogin={() => openAuth("login")} onRegister={() => openAuth("register")} onLogout={signOut} />}
      {sessionError && <p role="alert" className="bg-red-50 p-3 text-center text-sm text-red-700">{sessionError}</p>}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/login" element={initializing ? <main className="flex-1 p-12 text-center text-sm text-slate-500" role="status">Đang kiểm tra phiên đăng nhập…</main> : session ? <Navigate to="/" replace /> : <LoginPage onSuccess={handleLogin} />} />
        <Route path="/register" element={initializing ? <main className="flex-1 p-12 text-center text-sm text-slate-500" role="status">Đang kiểm tra phiên đăng nhập…</main> : session ? <Navigate to="/" replace /> : <RegisterPage onSuccess={handleLogin} />} />
        <Route path="*" element={<main className="mx-auto w-full max-w-6xl flex-1 p-10"><h1 className="text-2xl font-bold">Không tìm thấy trang</h1><Link to="/" className="mt-4 inline-block text-blue-600">Về trang chủ</Link></main>} />
      </Routes>
      <Footer />
      {!authPage && <><div className="h-24 shrink-0" aria-hidden="true" /><AiSupportButton /></>}
    </div>
  );
}
