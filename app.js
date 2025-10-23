// GANTI API_BASE jika beda
const API_BASE = "https://to-jv12.vercel.app";

const usd = v=> new Intl.NumberFormat('id-ID').format(v);

const el = id => document.getElementById(id);

async function fetchJson(path, opts){
  const res = await fetch(API_BASE + path, opts);
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function load() {
  try {
    // user
    const user = await fetchJson("/api/user");
    el("user-name").innerText = `Halo, ${user.username}`;
    el("user-email").innerText = user.email || "";
    el("user-balance").innerText = `Rp${usd(user.balance)}`;

    // services
    const sv = await fetchJson("/api/services");
    const sel = el("service-select");
    sel.innerHTML = "";
    sv.forEach(s=>{
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${s.name} — Rp${usd(s.rate)} / ${s.unit}`;
      opt.dataset.rate = s.rate;
      opt.dataset.unit = s.unit;
      opt.dataset.min = s.min;
      opt.dataset.max = s.max;
      sel.appendChild(opt);
    });

    updatePrice();
    loadOrders();
  } catch(err){
    console.error(err);
    alert("Gagal konek ke API: "+err.message);
  }
}

function updatePrice(){
  const sel = el("service-select");
  const opt = sel.options[sel.selectedIndex];
  if(!opt) return;
  const rate = Number(opt.dataset.rate);
  const unit = Number(opt.dataset.unit);
  const qty = Number(el("qty-input").value) || 0;
  const per1000 = rate;
  el("price-per-1000").innerText = `Rp${new Intl.NumberFormat('id-ID').format(per1000)} / ${unit}`;
  const total = Math.round((rate * qty) / unit);
  el("total-pay").innerText = `Rp${new Intl.NumberFormat('id-ID').format(total)}`;
}

async function doTopup(){
  try{
    await fetchJson("/api/topup", {
      method:"POST",
      headers:{"content-type":"application/json"},
      body: JSON.stringify({ amount: 10000 })
    });
    await load();
    alert("Topup Rp10.000 berhasil");
  }catch(e){
    alert("Topup gagal: "+e.message);
  }
}

async function doOrder(){
  const svc = el("service-select").value;
  const qty = Number(el("qty-input").value);
  const target = el("target-input").value.trim();
  if(!svc || !qty || !target){ alert("Lengkapi semua kolom"); return; }

  try{
    const res = await fetchJson("/api/order", {
      method:"POST",
      headers:{"content-type":"application/json"},
      body: JSON.stringify({ serviceId: svc, qty, target })
    });
    alert("Order sukses: ID " + res.order.id);
    el("target-input").value = "";
    load();
  }catch(err){
    try{
      const txt = await err.message;
    }catch(e){}
    alert("Order gagal: " + (err.message || err));
  }
}

async function loadOrders(){
  try{
    const list = await fetchJson("/api/orders");
    const ul = el("orders-list");
    ul.innerHTML = "";
    if(!list.length) { ul.innerHTML = "<li class='muted'>Belum ada pesanan</li>"; return; }
    list.forEach(o=>{
      const li = document.createElement("li");
      li.innerHTML = `<div><strong>${o.serviceName}</strong> — ${o.qty}</div>
                      <div class="muted small">Target: ${o.target}</div>
                      <div class="muted small">Total: Rp${new Intl.NumberFormat('id-ID').format(o.total)} • ${o.status}</div>`;
      ul.appendChild(li);
    });
  }catch(e){
    console.error(e);
  }
}

// events
document.addEventListener("DOMContentLoaded", ()=>{
  load();
  el("service-select").addEventListener("change", updatePrice);
  el("qty-input").addEventListener("input", updatePrice);
  el("topup-btn").addEventListener("click", doTopup);
  el("order-btn").addEventListener("click", doOrder);
});