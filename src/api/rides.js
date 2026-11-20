import { api } from "./client";
import { mockRides } from "../mocks/rides";

// 假資料：記錄「我」加入了哪些共乘（等後端做好再換）
const joined = new Set();

export async function getRides() {
  return mockRides;
}

export async function getRide(id) {
  const ride = mockRides.find((r) => r.id === Number(id));
  if (!ride) throw new Error("not found");
  return { ...ride, joined: joined.has(ride.id) };
}

export async function joinRide(id) {
  const ride = mockRides.find((r) => r.id === Number(id));
  if (!ride || ride.seats_left <= 0 || joined.has(ride.id)) return false;
  ride.seats_left -= 1;
  if (ride.seats_left === 0) ride.status = "full";
  joined.add(ride.id);
  return true;
}

export async function leaveRide(id) {
  const ride = mockRides.find((r) => r.id === Number(id));
  if (!ride || !joined.has(ride.id)) return false;
  ride.seats_left += 1;
  ride.status = "open";
  joined.delete(ride.id);
  return true;
}

// 真的送到後端；回傳 true / false
export async function createRide(ride) {
  const res = await api.post("/carpool/post", ride);
  return res.data.success;
}