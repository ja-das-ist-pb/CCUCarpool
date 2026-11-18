import { Link } from "react-router-dom";

export default function RideCard({ ride }) {
  const time = new Date(ride.departure_time).toLocaleString("zh-TW", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const full = ride.seats_left === 0;

  return (
    <Link to={`/rides/${ride.id}`} className="ride-card">
      <div className="ride-poster">
        <span className="avatar">{ride.poster_name?.[0] ?? "?"}</span>
        <span>{ride.poster_name}</span>
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