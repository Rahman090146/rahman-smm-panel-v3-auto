// Rahman SMM Panel v3 - API Backend (tanpa database, in-memory)
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Data sementara (disimpan di memori)
let user = { username: "demo", balance: 30000 };

let services = [
  { id: 1, name: "YouTube Subscribers", rate: 15000, unit: 1000, min: 100, max: 50000 },
  { id: 2, name: "YouTube Views", rate: 8000, unit: 1000, min: 100, max: 500000 },
  { id: 3, name: "Instagram Followers", rate: 18000, unit: 1000, min: 10, max: 50000 }
];

let orders = [];

// 🌐 Tes koneksi
app.get("/", (req, res) => {
  res.send({
    ok: true,
    message: "Rahman SMM Panel API aktif 🚀"
  });
});

// 👤 Endpoint user demo
app.get("/api/user", (req, res) => {
  res.json(user);
});

// 📦 Endpoint daftar layanan
app.get("/api/services", (req, res) => {
  res.json(services);
});

// 💰 Top-up saldo demo
app.post("/api/topup", (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount)) return res.status(400).json({ error: "Nominal tidak valid" });
  user.balance += Number(amount);
  res.json({ success: true, balance: user.balance });
});

// 🧾 Buat pesanan baru
app.post("/api/order", (req, res) => {
  const { serviceId, qty, target } = req.body;
  const q = Number(qty);
  if (!serviceId || !q || !target) return res.status(400).json({ error: "Data belum lengkap" });

  const svc = services.find(s => s.id === Number(serviceId));
  if (!svc) return res.status(404).json({ error: "Layanan tidak ditemukan" });

  const price = (svc.rate * q) / svc.unit;
  if (user.balance < price) return res.status(400).json({ error: "Saldo tidak cukup" });

  user.balance -= price;
  const order = {
    id: Date.now(),
    service: svc.name,
    qty: q,
    target,
    total: price,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  orders.unshift(order);
  res.json({ success: true, order, balance: user.balance });
});

// 📋 Lihat daftar pesanan
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API aktif di port ${PORT}`));
