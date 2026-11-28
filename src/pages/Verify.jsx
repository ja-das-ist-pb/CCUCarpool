import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { verifyCode } from "../api/auth";
import "./Auth.css";
import Logo from "../components/Logo";

export default function Verify() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 直接輸入網址進來（沒有註冊資料）就導回註冊頁
  if (!state?.user) return <Navigate to="/register" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("請輸入驗證碼");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const ok = await verifyCode(code.trim(), state.user);
      if (ok) {
        navigate("/login", { replace: true });
      } else {
        setError("驗證碼錯誤，請再試一次");
      }
    } catch {
      setError("無法連線到伺服器，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Logo />
        <h2 className="auth-title">Enter verification code</h2>
        <p>驗證碼已寄到 {state.user.email}</p>

        <div className="field">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="請輸入驗證碼"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "驗證中…" : "確認"}
        </button>
      </form>
    </div>
  );
}