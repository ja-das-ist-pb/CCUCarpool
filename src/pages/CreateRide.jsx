import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { createRide } from "../api/rides";
import { getUser } from "../api/session";
import { PLACES } from "../constants/places";
import "./Auth.css";

// 產生「現在」的格式（YYYY-MM-DDTHH:mm），讓月曆不能選過去的時間
function getMinTime() {
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CreateRide() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    departure_time: "",
    seats_total: "",
    cost: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 沒登入就導去登入頁
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.origin.trim()) newErrors.origin = "請輸入起點";
    if (!form.destination.trim()) newErrors.destination = "請輸入終點";
    if (!form.departure_time) {
      newErrors.departure_time = "請選擇出發時間";
    } else if (new Date(form.departure_time) <= new Date()) {
      newErrors.departure_time = "出發時間必須是未來的時間";
    }
    const seats = Number(form.seats_total);
    if (!Number.isInteger(seats) || seats < 2)
      newErrors.seats_total = "座位數至少 2（含自己）";
    const cost = form.cost === "" ? 0 : Number(form.cost);
    if (!Number.isInteger(cost) || cost < 0)
      newErrors.cost = "車資必須是 0 以上的整數";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const ok = await createRide({
        poster_id: user.id,
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        departure_time: form.departure_time,
        seats_total: seats,
        seats_left: seats - 1, // 發起人自己佔一個座位
        cost,
        note: form.note.trim() || null,
      });
      if (ok) {
        navigate("/", { state: { posted: true } });
      } else {
        setErrors({ submit: "發起失敗，請稍後再試" });
      }
    } catch {
      setErrors({ submit: "無法連線到伺服器，請稍後再試" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-title">發起共乘</h2>

        <div className="field">
          <label>起點</label>
          <input
            name="origin"
            list="places"
            maxLength={100}
            value={form.origin}
            onChange={handleChange}
          />
          {errors.origin && <p className="auth-error">{errors.origin}</p>}
        </div>

        <div className="field">
          <label>終點</label>
          <input
            name="destination"
            list="places"
            maxLength={100}
            value={form.destination}
            onChange={handleChange}
          />
          {errors.destination && (
            <p className="auth-error">{errors.destination}</p>
          )}
        </div>

        <div className="field">
          <label>出發時間</label>
          <input
            type="datetime-local"
            name="departure_time"
            min={getMinTime()}
            value={form.departure_time}
            onChange={handleChange}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker();
              } catch {
                // 瀏覽器不支援就維持預設行為
              }
            }}
          />
          {errors.departure_time && (
            <p className="auth-error">{errors.departure_time}</p>
          )}
        </div>

        <div className="field">
          <label>總座位數（含自己）</label>
          <input
            type="number"
            name="seats_total"
            min="2"
            value={form.seats_total}
            onChange={handleChange}
          />
          {errors.seats_total && (
            <p className="auth-error">{errors.seats_total}</p>
          )}
        </div>

        <div className="field">
          <label>預估車資（NT$，選填）</label>
          <input
            type="number"
            name="cost"
            min="0"
            value={form.cost}
            onChange={handleChange}
          />
          {errors.cost && <p className="auth-error">{errors.cost}</p>}
        </div>

        <div className="field">
          <label>備註（選填）</label>
          <textarea
            name="note"
            rows={3}
            value={form.note}
            onChange={handleChange}
          />
        </div>

        {errors.submit && <p className="auth-error">{errors.submit}</p>}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "送出中…" : "發起共乘"}
        </button>
        <p className="auth-link">
          <Link to="/">返回首頁</Link>
        </p>

        <datalist id="places">
          {PLACES.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </form>
    </div>
  );
}