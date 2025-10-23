// index.js
// Rahman SMM Panel - simple API + static server
// Dependencies: express, lowdb, nanoid, cors, dotenv
// Paste file ini ke repo kamu (root) sebagai index.js

import express from "express";
import { Low, JSONFile } from "lowdb";
import { nanoid } from "nanoid";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// lokasi db.json
const dbFile = path.join(__dirname, "db.json");

// fallback initial data
const defaultData = {
  users: [
    { id: "u1", username: "demo", email: "demo@local", balance: 30000 } // saldo demo 30k
  ],
  services: [
    { id: 1, name: "YouTube Subscribers", rate: 15000, unit: 1000, min: 100, max: 50000 },
    { id: 2, name: "YouTube Views", rate: 8000, unit: 1000, min: 100, max: 500000 },
    { id: 3, name: "Instagram Followers", rate: 18000, unit: 1000, min: 10, max: 50000 }
  ],
  orders: []
};

// ensure db.json exists
try {
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify(defaultData, null, 2));
  }
} catch (err) {
  console.error("Cannot create db.json:", err.message);
}

// lowdb setup
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

async function initDB() {
  await db.read();
  if (!db.data) {
    db.data = defaultData;
    try { await db.write(); } catch(e) { console.warn("write failed (init):", e.message); }
  }
}
await initDB();

// Serve static frontend from /public (if ada)
const publicDir = path.join(__dirname, "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// --- API Endpoints ---

// GET services
app.get("/api/services", async (req, res) => {
  await db.read();
  res.json(db.data.services || []);
});

// GET current demo user (first user)
app.get("/api/user", async (req, res) => {
  await db.read();
  const user = db.data.users?.[0] || null;
  res.json(user);
});

// POST topup (adds amount to demo user balance)
// body: { amount: number }
app.post("/api/topup", async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount)) return res.status(400).json({ error: "Invalid amount" });
  await db.read();
  const user = db.data.users?.[0];
  if (!user) return res.status(500).json({ error: "User not found" });
  user.balance = (user.balance || 0) + Number(amount);
  try {
    await db.write();
  } catch (e) {
    console.warn("db write failed (topup):", e.message);
  }
  res.json({ success: true, balance: user.balance });
});

// POST order
// body: { serviceId, qty, target }
app.post("/api/order", async (req, res) => {
  const { serviceId, qty, target } = req.body;
  const q = Number(qty);
  if (!serviceId || !q || !target) return res.status(400).json({ error: "Missing parameters" });

  await db.read();
  const svc = (db.data.services || []).find(s => String(s.id) === String(serviceId));
  if (!svc) return res.status(404).json({ error: "Service not found" });

  if (q < (svc.min || 1)) return res.status(400).json({ error: `Minimum order is ${svc.min}` });
  if (svc.max && q > svc.max) return res.status(400).json({ error: `Maximum order is ${svc.max}` });

  // price calculation: pro rata by unit (rate is per 'unit', e.g. per 1000)
  const price = (svc.rate * q) / (svc.unit || 1000);
  const total = Math.round(price); // round to integer

  const user = db.data.users?.[0];
  if (!user) return res.status(500).json({ error: "User not found" });
  if ((user.balance || 0) < total) return res.status(400).json({ error: "Insufficient balance" });

  // deduct balance
  user.balance -= total;

  const order = {
    id: nanoid(10),
    serviceId: svc.id,
    serviceName: svc.name,
    qty: q,
    target,
    total,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  db.data.orders = db.data.orders || [];
  db.data.orders.unshift(order); // recent first

  try {
    await db.write();
  } catch (e) {
    console.warn("db write failed (order):", e.message);
    // still return success (but DB not persisted)
  }

  res.json({ success: true, order, balance: user.balance });
});

// GET orders (recent)
app.get("/api/orders", async (req, res) => {
  await db.read();
  res.json(db.data.orders || []);
});

// simple health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// fallback: serve index.html if exists
app.get("*", (req, res) => {
  const indexHtml = path.join(publicDir, "index.html");
  if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
  return res.status(404).send("Not found");
});

// start server (local). On some serverless platforms this may not be used.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Rahman SMM Panel API running on port ${PORT}`);
});
