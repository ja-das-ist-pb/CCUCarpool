import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendVerificationEmail } from "../api/auth";
import "./Auth.css";
import Logo from "../components/Logo";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    name: "",
    student_id: "",
    department: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();

    const newErrors = {};
    if (!email.endsWith("@ccu.edu.tw"))
      newErrors.email = "請使用 @ccu.edu.tw 結尾的學校 Email";
    if (!form.name) newErrors.name = "請輸入使用者名稱";
    if (form.password.length < 8) newErrors.password = "密碼至少 8 個字元";
    if (form.password !== form.confirm) newErrors.confirm = "兩次密碼不一致";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      // 回傳 true = Email 已註冊；false = 可註冊，且驗證碼已寄出
      const exist = await sendVerificationEmail(email);
      if (exist) {
        setErrors({ email: "此 Email 已被註冊" });
        return;
      }
      navigate("/verify", {
        state: {
          user: {
            email,
            name: form.name,
            student_id: form.student_id,
            department: form.department,
            password: form.password,
          },
        },
      });
    } catch {
      setErrors({ submit: "無法連線到伺服器，請稍後再試" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Logo />
        <h2 className="auth-title">註冊</h2>

        <div className="field">
          <label>School Email</label>
          <input name="email" value={form.email} onChange={handleChange} />
          {errors.email && <p className="auth-error">{errors.email}</p>}
        </div>

        <div className="field">
          <label>User Name</label>
          <input
            name="name"
            maxLength={50}
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <p className="auth-error">{errors.name}</p>}
        </div>

        <div className="field">
          <label>Student ID（選填）</label>
          <input
            name="student_id"
            maxLength={20}
            value={form.student_id}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Department（選填）</label>
          <input
            name="department"
            maxLength={100}
            value={form.department}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <p className="auth-error">{errors.password}</p>}
        </div>

        <div className="field">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
          />
          {errors.confirm && <p className="auth-error">{errors.confirm}</p>}
        </div>

        {errors.submit && <p className="auth-error">{errors.submit}</p>}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "寄送驗證碼中…" : "下一步"}
        </button>
        <p className="auth-link">
          已經有帳號？<Link to="/login">登入</Link>
        </p>
      </form>
    </div>
  );
}