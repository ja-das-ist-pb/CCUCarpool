import { api } from "./client";
import { PLACES } from "../constants/places";

// datetime-local 需要的格式：YYYY-MM-DDTHH:mm（用本地時間）
function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 後端：起點、終點要完全相同，出發時間 >= 指定時間，而且還有座位
export async function searchRides({ origin, destination, time }) {
  const res = await api.post("/carpool/filter", {
    origin,
    destination,
    departure_time: time || toLocalInput(new Date()),
  });
  return res.data.posts;
}

// 後端還沒有「列出全部」的 API，所以把常用地點兩兩配對，
// 每一對各查一次，再合併成一份列表（等後端有列表 API 就換成一次請求）
export async function getRides() {
  const now = toLocalInput(new Date());
  const pairs = [];
  for (const origin of PLACES) {
    for (const destination of PLACES) {
      if (origin !== destination) pairs.push([origin, destination]);
    }
  }

  const results = await Promise.allSettled(
    pairs.map(([origin, destination]) =>
      searchRides({ origin, destination, time: now })
    )
  );

  // 全部都失敗，代表後端連不上
  if (results.every((r) => r.status === "rejected")) {
    throw new Error("backend unreachable");
  }

  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
}

// 後端成功沒有回傳內容，失敗是錯誤狀態碼（會被 axios 丟出例外）
export async function joinRide(carpoolId, userId) {
  await api.post("/carpool/join", {
    carpool_id: Number(carpoolId),
    user_id: userId,
  });
  return true;
}

export async function createRide(ride) {
  const res = await api.post("/carpool/post", ride);
  return res.data.success;
}