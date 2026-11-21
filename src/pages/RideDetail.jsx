import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { joinRide } from "../api/rides";
import { getUser } from "../api/session";
import "./Auth.css";

export default function RideDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [ride, setRide] = useState(state?.ride ?? null);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // 重新整理頁面後資料會不見（後端沒有詳情 API），請使用者回首頁重新搜尋
  if (!ride)
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>找不到這筆共乘的資料，請回首頁重新搜尋。</p>
          <Link to="/">返回首頁</Link>
        </div>
      </div>
    );

  const user = getUser();
  const isOwner = user && ride.poster_id === user.id;
  const full = ride.seats_left === 0;
  const poster = ride.poster_name ?? `使用者 #${ride.poster_id}`;
  const time = new Date(ride.departure_time).toLocaleString("zh-TW", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const perPerson = Math.ceil(ride.cost / ride.seats_total);

  const handleJoin = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await joinRide(ride.id, user.id);
      setJoined(true);
      setRide({ ...ride, seats_left: ride.seats_left - 1 });
    } catch {
      setError("加入失敗，可能已額滿或已加入過，請稍後再試");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">
          {ride.origin} → {ride.destination}
        </h2>

        <div className="detail-row"><span>發起人</span><span>{poster}</span></div>
        <div className="detail-row"><span>出發時間</span><span>{time}</span></div>
        <div className="detail-row">
          <span>座位</span>
          <span>{full ? "已額滿" : `剩 ${ride.seats_left} / ${ride.seats_total} 位`}</span>
        </div>
        <div className="detail-row"><span>預估車資</span><span>NT$ {ride.cost}</span></div>
        {ride.cost > 0 && (
          <div className="detail-row">
            <span>坐滿時每人約</span><span>NT$ {perPerson}</span>
          </div>
        )}
        {ride.note && (
          <div className="detail-row"><span>備註</span><span>{ride.note}</span></div>
        )}

        {error && <p className="auth-error">{error}</p>}

        {isOwner ? (
          <p className="auth-link">這是你發起的共乘</p>
        ) : joined ? (
          <p className="auth-link">你已加入這個共乘 ✓</p>
        ) : full ? (
          <p className="auth-link">這個共乘已經額滿了</p>
        ) : (
          <button className="auth-button" onClick={handleJoin} disabled={busy}>
            {busy ? "處理中…" : "加入共乘"}
          </button>
        )}

        <p className="auth-link"><Link to="/">返回首頁</Link></p>
      </div>
    </div>
  );
}