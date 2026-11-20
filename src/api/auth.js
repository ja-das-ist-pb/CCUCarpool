import { api } from "./client";

// true = Email 已註冊；false = 可註冊，且驗證碼已寄出
export async function sendVerificationEmail(email) {
  const res = await api.post("/vertify/email", { email });
  return res.data.exist;
}

export async function verifyCode(code, user) {
  const { student_id, department, ...rest } = user; // rest = email、name、password
  const res = await api.post("/vertify/code", {
    code,
    user: {
      ...rest,
      student_id: student_id || null,
      department: department || null,
    },
  });
  return res.data.status;
}

// 回傳 { login: bool, user?: {...} }
export async function login(email, password) {
  const res = await api.post("/login", { email, password });
  return res.data;
}