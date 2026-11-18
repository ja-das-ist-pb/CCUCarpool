import { mockRides } from "../mocks/rides";

// 假資料：記錄「我」加入了哪些共乘（之後由後端判斷）
const joined = new Set();

// TODO: 後端做好列表 API 後，改成 api.get("/路徑") 並 return res.data
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

export async function createRide(ride) {
  // TODO: 後端做好後改成 api.post("/路徑", ride)，並 return res.data
  console.log("發起共乘：", ride);
  return true;
}