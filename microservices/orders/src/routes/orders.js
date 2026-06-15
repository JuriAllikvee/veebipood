const express = require("express");
const router = express.Router();
const data = require("../data");

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || "http://localhost:5051";
const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || "http://localhost:5052";

async function getUser(authHeader) {
  if (!authHeader) return null;
  try {
    const res = await fetch(`${USERS_SERVICE_URL}/api/users/verify`, {
      headers: { Authorization: authHeader }
    });
    if (res.status === 200) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error communicating with Users service:", err.message);
  }
  return null;
}

// POST /api/orders
router.post("/", async (req, res) => {
  const user = await getUser(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Pead olema sisse logitud" });

  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Vajalik väli: items (massiiv toodetest)" });
  }

  const orderItems = [];
  try {
    for (const item of items) {
      // 1. Get product details
      const prodRes = await fetch(`${PRODUCTS_SERVICE_URL}/api/products/${item.productId}`);
      if (prodRes.status !== 200) {
        return res.status(prodRes.status).json({ error: `Toodet ID ${item.productId} ei leitud või viga` });
      }
      const product = await prodRes.json();

      // 2. Reserve stock
      const reserveRes = await fetch(`${PRODUCTS_SERVICE_URL}/api/products/${item.productId}/reserve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: item.quantity })
      });

      if (reserveRes.status !== 200) {
        const errData = await reserveRes.json();
        return res.status(reserveRes.status).json({ error: errData.error || `Toote reserveerimine ebaõnnestus` });
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }
  } catch (err) {
    console.error("Error during order creation flow:", err.message);
    return res.status(500).json({ error: "Viga tellimuse töötlemisel teiste teenuste poolt" });
  }

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = {
    id: data.nextOrderId++,
    userId: user.id,
    userName: user.name,
    items: orderItems,
    total: Math.round(total * 100) / 100,
    status: "vastu võetud",
    createdAt: new Date().toISOString(),
  };

  data.orders.push(order);
  res.status(201).json({ message: "Tellimus loodud!", order });
});

// GET /api/orders
router.get("/", (req, res) => {
  res.json({ orders: data.orders });
});

// GET /api/orders/me
router.get("/me", async (req, res) => {
  const user = await getUser(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Pead olema sisse logitud" });
  const userOrders = data.orders.filter((o) => o.userId === user.id);
  res.json({ orders: userOrders, count: userOrders.length });
});

// GET /api/orders/:id
router.get("/:id", (req, res) => {
  const order = data.orders.find((o) => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: "Tellimust ei leitud" });
  res.json(order);
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  const validStatuses = ["vastu võetud", "töötlemisel", "saadetud", "kohale toimetatud"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Kehtivad staatused: ${validStatuses.join(", ")}` });
  }
  const order = data.orders.find((o) => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: "Tellimust ei leitud" });
  order.status = status;
  res.json({ message: "Staatus uuendatud!", order });
});

module.exports = router;
