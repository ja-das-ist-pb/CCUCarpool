import { Link } from "react-router-dom";

export default function RideCard({ ride }) {
  const time = new Date(ride.departure_time).toLocaleString("zh-TW", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const full = ride.seats_left === 0;
  const poster = ride.poster_name ?? `使用者 #${ride.poster_id}`;

  return (
    <Link to={`/rides/${ride.id}`} state={{ ride }} className="ride-card">
      <div className="ride-poster">
        <span className="avatar">{poster[0] === "使" ? "?" : poster[0]}</span>
        <span>{poster}</span>
      </div>
      <div className="ride-route">
        {ride.origin} → {ride.destination}
      </div>
      <div className="ride-meta">
        <span>{time}</span>
        <span>{full ? "已額滿" : `剩 ${ride.seats_left}/${ride.seats_total} 位`}</span>
        <span>NT$ {ride.cost}</span>
      </div>
    </Link>
  );
}