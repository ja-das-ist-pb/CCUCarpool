import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import CreateRide from "./pages/CreateRide";
import RideDetail from "./pages/RideDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/create" element={<CreateRide />} />
        <Route path="/rides/:id" element={<RideDetail />} />
      </Routes>
    </BrowserRouter>
  );
}