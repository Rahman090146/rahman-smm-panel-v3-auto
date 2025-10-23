// Rahman SMM Panel v3 - API (Final Fix)
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// ✅ Izinkan koneksi dari semua front kamu (termasuk t-arhk.vercel.app)
app.use(cors({
  origin: [
    "https://rahman-smm-panel-v3-front.vercel.app",
    "https://t-arhk.vercel.app", // domain front aktif kamu
    "http://localhost:3000"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ===== Data sementara (demo) =====
let users = [{ id: "u1", username: "demo", balance: 30000 }];
let services = [
  { id: 1, name: "YouTube Subscribers", rate: 15000, unit: 1000, min: 100, max: 50000 },
  { id: 2, name: "YouTube Views", rate: 8000, unit: 1000, min: 100, max: 500000 },
  { id: 3, name: "Instagram Followers", rate: 18000, unit: 1000, min: 10, max: 50000 }
];
let orders = [];

// ===== Routes =====
app.get("/api/health", (req, res) => res.json({ ok: true, message: "Rahman SMM Panel API aktif 🚀" }));
app.get("/api/user", (req, res) => res.json(users[0]));
app.get("/api/services", (req, res) => res.json(services));

app.post("/api/order", (req, res) => {
  const { serviceId, qty, target } = req.body;
  const svc = services.find(s => s.id === Number(serviceId));
  if (!svc) return res.status(404).json({ error: "Layanan tidak ditemukan" });
  const total = (svc.rate * qty) / svc.unit;
  if (users[0].balance < total) return res.status(400).json({ error: "Saldo tidak cukup" });

  users[0].balance -= total;
  const order = {
    id: Date.now().toString(),
    serviceName: svc.name,
    qty,
    target,
    total,
    status: "pending"
  };
  orders.push(order);
  res.json({ success: true, order });
});

app.get("/", (req, res) => {
  res.send(`
    <html><head><title>Rahman API</title></head>
    <body style="font-family:Arial;text-align:center;">
      <h1>Rahman SMM Panel API v3 🚀</h1>
      <p>API aktif dan siap digunakan.</p>
      <a href="/api/health">Cek Status</a> |
      <a href="/api/services">Lihat Layanan</a>
    </body></html>
  `);
});

export default app;
