const express = require("express");
const router = express.Router();
const data = require("../data");

// GET /api/products
router.get("/", (req, res) => {
  res.json({ products: data.products });
});

// GET /api/products/categories
router.get("/categories", (req, res) => {
  const categories = [...new Set(data.products.map((p) => p.category))];
  res.json({ categories });
});

// GET /api/products/category/:cat
router.get("/category/:cat", (req, res) => {
  const cat = req.params.cat.toLowerCase();
  const products = data.products.filter((p) => p.category === cat);
  if (products.length === 0) return res.status(404).json({ error: "Selle kategooriaga tooteid ei leitud" });
  res.json({ products, count: products.length });
});

// GET /api/products/search
router.get("/search", (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Lisa parameeter ?name=..." });
  const results = data.products.filter((p) => p.name.toLowerCase().includes(name.toLowerCase()));
  res.json({ results, count: results.length });
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = data.products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Toodet ei leitud" });
  res.json(product);
});

// PATCH /api/products/:id/reserve (Internal API)
router.patch("/:id/reserve", (req, res) => {
  const { quantity } = req.body;
  const product = data.products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: `Toodet ID ${req.params.id} ei leitud` });
  if (product.stock < quantity) {
    return res.status(409).json({ error: `Toode "${product.name}" pole piisavalt laos` });
  }
  product.stock -= quantity;
  res.json({ message: "Laoseis reserveeritud!", product });
});

module.exports = router;
