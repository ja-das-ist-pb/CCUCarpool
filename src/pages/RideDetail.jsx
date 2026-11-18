import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRide, joinRide, leaveRide } from "../api/rides";
import "./Auth.css";

export default function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () =>
    getRide(id)
      .then(setRide)
      .catch(() => setError("找不到這筆共乘"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [id]);

  const handleToggle = async () => {
    // 沒登入先去登入
    if (!localStorage.getItem("userEmail")) {
      navigate("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const ok = ride.joined ? await leaveRide(id) : await joinRide(id);
      if (!ok) setError("操作失敗，可能已額滿");
      await load();
    } catch {
      setError("無法連線到伺服器，請稍後再試");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="auth-page"><p>載入中…</p></div>;
  if (!ride)
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-error">{error}</p>
          <Link to="/">返回首頁</Link>
        </div>
      </div>
    );

  const time = new Date(ride.departure_time).toLocaleString("zh-TW", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const full = ride.seats_left === 0;
  const perPerson = Math.ceil(ride.cost / ride.seats_total);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">
          {ride.origin} → {ride.destination}
        </h2>

        <div className="detail-row"><span>發起人</span><span>{ride.poster_name}</span></div>
        <div className="detail-row"><span>出發時間</span><span>{time}</span></div>
        <div className="detail-row">
          <span>座位</span>
          <span>{full ? "已額滿" : `剩 ${ride.seats_left} / ${ride.seats_total} 位`}</span>
        </div>
        <div className="detail-row"><span>預估車資</span><span>NT$ {ride.cost}</span></div>
        <div className="detail-row">
          <span>坐滿時每人約</span><span>NT$ {perPerson}</span>
        </div>
        {ride.note && <div className="detail-row"><span>備註</span><span>{ride.note}</span></div>}

        {error && <p className="auth-error">{error}</p>}

        {(ride.joined || !full) && (
          <button className="auth-button" onClick={handleToggle} disabled={busy}>
            {busy ? "處理中…" : ride.joined ? "退出共乘" : "加入共乘"}
          </button>
        )}
        {!ride.joined && full && <p className="auth-link">這個共乘已經額滿了</p>}

        <p className="auth-link"><Link to="/">返回首頁</Link></p>
      </div>
    </div>
  );
}