import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";

const app = express();
const port = process.env.PORT || 3000;

// ✅ Izinkan akses dari frontend kamu
app.use(cors({
  origin: [
    "https://rahman-smm-panel-v3-front.vercel.app",
    "https://rahman-smm-panel-v3-front-jyra.vercel.app" // cadangan domain build baru
  ],
}));

app.use(express.json());

// 🧠 LowDB Setup
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { user: { username: "demo", balance: 30000 }, services: [] });

// Endpoint dasar
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Rahman SMM Panel API aktif 🚀" });
});

// Endpoint user
app.get("/api/user", (req, res) => {
  res.json(db.data.user);
});

// Endpoint layanan
app.get("/api/services", (req, res) => {
  res.json([
    { id: 1, name: "YouTube Subscribers", rate: 15000, unit: 1000, min: 100, max: 50000 },
    { id: 2, name: "YouTube Views", rate: 8000, unit: 1000, min: 100, max: 500000 },
    { id: 3, name: "Instagram Followers", rate: 18000, unit: 1000, min: 10, max: 500000 }
  ]);
});

// Jalankan server
app.listen(port, () => {
  console.log(`API berjalan di port ${port}`);
});
