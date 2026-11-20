import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getRides } from "../api/rides";
import SearchBar from "../components/SearchBar";
import RideCard from "../components/RideCard";
import "./Home.css";
import AccountMenu from "../components/AccountMenu";
import { getUser, clearUser } from "../api/session";

export default function Home() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    getRides()
      .then(setRides)
      .catch(() => setError("無法載入共乘列表"))
      .finally(() => setLoading(false));
  }, []);

  const keyword = query.trim();
  const filtered = rides.filter(
    (r) => r.origin.includes(keyword) || r.destination.includes(keyword)
  );

  const handleLogout = () => {
  clearUser();
  setUser(null);
  };

  const handleCreate = () => navigate("/create");

  return (
    <div className="home">
      <header className="home-header">
        <SearchBar value={query} onChange={setQuery} />
        <AccountMenu userEmail={user?.email} onLogout={handleLogout} />
      </header>

      {loading && <p>載入中…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>找不到符合的共乘</p>}

      <div className="ride-grid">
        {filtered.map((ride) => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </div>

      <button className="fab" onClick={handleCreate}>
        發起共乘
      </button>
    </div>
  );
}