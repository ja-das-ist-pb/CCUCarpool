import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRides } from "../api/rides";
import { getUser, clearUser } from "../api/session";
import SearchBar from "../components/SearchBar";
import RideCard from "../components/RideCard";
import AccountMenu from "../components/AccountMenu";
import "./Home.css";

const EMPTY_FILTERS = { origin: "", destination: "", time: "" };

export default function Home() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    getRides()
      .then(setRides)
      .catch(() => setError("無法載入共乘列表"))
      .finally(() => setLoading(false));
  }, []);

  const origin = filters.origin.trim();
  const destination = filters.destination.trim();

  const filtered = rides.filter((r) => {
    if (origin && !r.origin.includes(origin)) return false;
    if (destination && !r.destination.includes(destination)) return false;
    if (filters.time && new Date(r.departure_time) < new Date(filters.time))
      return false;
    return true;
  });

  const handleLogout = () => {
    clearUser();
    setUser(null);
  };

  return (
    <div className="home">
      <header className="home-header">
        <SearchBar
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />
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

      <button className="fab" onClick={() => navigate("/create")}>
        發起共乘
      </button>
    </div>
  );
}