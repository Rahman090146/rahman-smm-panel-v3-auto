import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🟢 Root test
app.get("/", (req, res) => {
  res.send({ ok: true, message: "Rahman SMM Panel API aktif 🚀" });
});

// 🧍 User demo
app.get("/api/user", (req, res) => {
  res.json({ username: "demo", balance: 30000 });
});

// 🛠️ Layanan demo
app.get("/api/services", (req, res) => {
  res.json([
    { id: 1, name: "YouTube Subscribers", price: 15000 },
    { id: 2, name: "YouTube Views", price: 10000 },
    { id: 3, name: "Instagram Followers", price: 12000 }
  ]);
});

// 🧾 Pesanan
app.post("/api/order", (req, res) => {
  const { serviceId, qty, target } = req.body;
  if (!serviceId || !qty || !target)
    return res.json({ error: "Semua data wajib diisi!" });

  const orderId = Math.floor(Math.random() * 999999);
  res.json({ order: { id: orderId, serviceId, qty, target } });
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API aktif di port ${PORT}`));
