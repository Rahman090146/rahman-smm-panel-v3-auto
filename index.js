// Rahman SMM Panel v3 - API (Versi fix CORS dan siap konek ke Frontend)
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// ✅ Perbaikan CORS agar front bisa akses API dengan aman
app.use(cors({
  origin: [
    "https://rahman-smm-panel-v3-front.vercel.app", // domain frontend kamu
    "http://localhost:3000" // untuk testing lokal (opsional)
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ===== Data sementara (in-memory) =====
let users = [
  { id: "u1", username: "demo", email: "demo@local", balance: 30000 } // saldo demo 30k
];

let services = [
  { id: 1, name: "YouTube Subscribers", rate: 15000, unit: 1000, min: 100, max: 50000 },
  { id: 2, name: "YouTube Views", rate: 8000, unit: 1000, min: 100, max: 500000 },
  { id: 3, name: "Instagram Followers", rate: 18000, unit: 1000, min: 10, max: 50000 }
];

let orders = [];

// ===== ROUTES =====

// Tes koneksi
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Rahman SMM Panel API aktif 💪", time: new Date().toISOString() });
});

// Ambil semua layanan
app.get("/api/services", (req, res) => {
  res.json(services);
});

// Ambil data user demo
app.get("/api/user", (req, res) => {
  res.json(users[0]);
});

// Tambah saldo (topup)
app.post("/api/topup", (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount)) return res.status(400).json({ error: "Nominal tidak valid" });

  users[0].balance += Number(amount);
  res.json({ success: true, balance: users[0].balance });
});

// Buat pesanan baru
app.post("/api/order", (req, res) => {
  const { serviceId, qty, target } = req.body;
  const q = Number(qty);
  if (!serviceId || !q || !target) return res.status(400).json({ error: "Parameter tidak lengkap" });

  const svc = services.find(s => s.id === Number(serviceId));
  if (!svc) return res.status(404).json({ error: "Layanan tidak ditemukan" });
  if (q < svc.min) return res.status(400).json({ error: `Minimal order ${svc.min}` });
  if (q > svc.max) return res.status(400).json({ error: `Maksimal order ${svc.max}` });

  const price = (svc.rate * q) / svc.unit;
  const total = Math.round(price);

  if (users[0].balance < total)
    return res.status(400).json({ error: "Saldo tidak cukup" });

  users[0].balance -= total;

  const order = {
    id: Date.now().toString(),
    serviceId: svc.id,
    serviceName: svc.name,
    qty: q,
    target,
    total,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  orders.unshift(order);
  res.json({ success: true, order, balance: users[0].balance });
});

// Lihat daftar pesanan
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// Halaman depan sederhana
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Rahman SMM Panel API 🚀</title>
        <style>
          body { font-family: Arial; background: #f4f6ff; color: #222; text-align: center; margin-top: 10%; }
          h1 { color: #0070f3; }
          .card { background: white; display: inline-block; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          a { color: #0070f3; text-decoration: none; display: block; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Rahman SMM Panel API v3 🚀</h1>
          <p>API aktif dan siap digunakan!</p>
          <a href="/api/health">Cek Status</a>
          <a href="/api/services">Lihat Daftar Layanan</a>
        </div>
      </body>
    </html>
  `);
});

// Jalankan server (otomatis handle Vercel)
export default app;
