const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5070;

const USERS_URL    = process.env.USERS_SERVICE_URL    || "http://localhost:5051";
const PRODUCTS_URL = process.env.PRODUCTS_SERVICE_URL || "http://localhost:5052";
const ORDERS_URL   = process.env.ORDERS_SERVICE_URL   || "http://localhost:5053";
const REVIEWS_URL  = process.env.REVIEWS_SERVICE_URL  || "http://localhost:5054";

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../public")));

// Generic proxy helper
async function proxy(req, res, targetUrl) {
  try {
    const url = `${targetUrl}${req.originalUrl}`;
    const options = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    };
    if (req.headers.authorization) {
      options.headers["Authorization"] = req.headers.authorization;
    }
    if (req.method !== "GET" && req.method !== "DELETE") {
      options.body = JSON.stringify(req.body);
    }
    const upstream = await fetch(url, options);
    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("Gateway proxy error:", err.message);
    res.status(502).json({ error: "Teenus ei vasta", detail: err.message });
  }
}

// Route all API calls to the appropriate microservice
app.all("/api/users/*", (req, res) => proxy(req, res, USERS_URL));
app.all("/api/products/*", (req, res) => proxy(req, res, PRODUCTS_URL));
app.all("/api/orders/*", (req, res) => proxy(req, res, ORDERS_URL));
app.all("/api/reviews/*", (req, res) => proxy(req, res, REVIEWS_URL));

// Aggregated stats endpoint
app.get("/api/stats", async (req, res) => {
  try {
    const [usersRes, productsRes, ordersRes] = await Promise.all([
      fetch(`${USERS_URL}/api/users`),
      fetch(`${PRODUCTS_URL}/api/products`),
      fetch(`${ORDERS_URL}/api/orders`),
    ]);
    const users    = await usersRes.json();
    const products = await productsRes.json();
    const orders   = await ordersRes.json();
    res.json({
      totalUsers:    users.users?.length || 0,
      totalProducts: products.products?.length || 0,
      totalOrders:   orders.orders?.length || 0,
      activeOrders:  (orders.orders || []).filter(o => o.status !== "kohale toimetatud").length,
    });
  } catch (err) {
    res.status(502).json({ error: "Statistika kogumine ebaõnnestus", detail: err.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "gateway", timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`API Gateway jookseb pordil: ${PORT}`);
  console.log(`  -> users:    ${USERS_URL}`);
  console.log(`  -> products: ${PRODUCTS_URL}`);
  console.log(`  -> orders:   ${ORDERS_URL}`);
  console.log(`  -> reviews:  ${REVIEWS_URL}`);
});
