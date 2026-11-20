import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { saveUser } from "../api/session";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim();

    if (!email || !form.password) {
      setError("請輸入 Email 和密碼");
      return;
    }
    if (!email.toLowerCase().endsWith("@alum.ccu.edu.tw")) {
      setError("請輸入正確的學校信箱格式（@alum.ccu.edu.tw）");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = await login(email, form.password);
      if (data.login) {
        saveUser(data.user);
        navigate("/");
      } else {
        setError("Email 或密碼錯誤");
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
        <h2 className="auth-title">登入</h2>

        <div className="field">
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "登入中…" : "登入"}
        </button>
        <p className="auth-link">
          還沒有帳號？<Link to="/register">註冊</Link>
        </p>
      </form>
    </div>
  );
}