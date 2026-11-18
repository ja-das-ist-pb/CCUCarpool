import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
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

    setError("");
    setLoading(true);

  try {
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        passord: form.password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === true) {
      localStorage.setItem("userEmail", form.email);
      navigate("/");
    } else {
      setError("Email 或密碼錯誤");
    }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

   
  const email = form.email.trim();

  // 檢查信箱是否符合指定格式
  const emailPattern = /^[A-Za-z0-9._%+-]+@ccu\.edu\.tw$/i;

  if (!emailPattern.test(email)) {
    setError("請輸入正確的學校信箱格式");
    return;
  // 下面保留原本的登入程式碼
  };
    if (!form.email || !form.password) {
      setError("請輸入 Email 和密碼");
      return;
    }
    // setLoading(true);
    // setError("");
    // try {
    //   const ok = await login(form.email, form.password);
    //   if (ok) {
    //     localStorage.setItem("userEmail", form.email);
    //     navigate("/");
    //   } else {
    //     setError("Email 或密碼錯誤");
    //   }
    // } catch {
    //   setError("無法連線到伺服器，請稍後再試");
    // } finally {
    //   setLoading(false);
  
  

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
