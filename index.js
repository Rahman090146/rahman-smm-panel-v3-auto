// Rahman SMM Panel API v3 — versi stabil 🚀
import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";

const app = express();
const port = process.env.PORT || 3000;

// ✅ Izinkan frontend kamu (CORS)
app.use(cors({
  origin: [
    "https://rahman-smm-panel-v3-front.vercel.app",
    "https://rahman-smm-panel-v3-front-jyra.vercel.app"
  ]
}));
app.use(express.json());

// 🧠 Setup LowDB
const adapter = new JSONFile("db.json");
const db = new Low(adapter);

// 🧩 Inisialisasi data jika belum ada
await db.read();
db.data ||= {
  user: { username: "demo", balance: 30000 },
  orders: [],
  services: [
    { id: 1, name: "YouTube Subscribers", rate: 15000, unit: 1000, min: 100, max: 50000 },
    { id: 2, name: "YouTube Views", rate: 8000, unit: 1000, min: 100, max: 500000 },
    { id: 3, name: "Instagram Followers", rate: 18000, unit: 1000, min: 10, max: 500000 }
  ]
};
await db.write();

// 🟢 Tes API
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Rahman SMM Panel API aktif 🚀" });
});

// 👤 User info
app.get("/api/user", (req, res) => {
  res.json(db.data.user);
});

// 🧩 Layanan
app.get("/api/services", (req, res) => {
  res.json(db.data.services);
});

// 🛒 Order
app.post("/api/order", async (req, res) => {
  try {
    const { serviceId, qty, target } = req.body;
    const service = db.data.services.find(s => s.id == serviceId);

    if (!service) return res.json({ error: "Layanan tidak ditemukan" });
    if (qty < service.min || qty > service.max)
      return res.json({ error: `Jumlah harus antara ${service.min} dan ${service.max}` });

    const total = (qty / service.unit) * service.rate;
    if (db.data.user.balance < total)
      return res.json({ error: "Saldo tidak cukup" });

    db.data.user.balance -= total;

    const order = {
      id: nanoid(8),
      serviceId,
      target,
      qty,
      total,
      status: "Pending",
      date: new Date().toISOString()
    };

    db.data.orders.push(order);
    await db.write();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: "Terjadi kesalahan server." });
  }
});

// Jalankan server
app.listen(port, () => console.log(`✅ API berjalan di port ${port}`));
export default app;
