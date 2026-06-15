const express = require("express");
const router = express.Router();
const data = require("../data");

// GET /api/reviews/product/:productId
router.get("/product/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);
  const reviews = data.reviews.filter((r) => r.productId === productId);
  res.json({ reviews, count: reviews.length });
});

// POST /api/reviews
router.post("/", (req, res) => {
  const { productId, username, rating, comment } = req.body;
  if (!productId || !username || !rating || !comment) {
    return res.status(400).json({ error: "Vajalikud väljad: productId, username, rating, comment" });
  }
  const review = {
    id: data.nextReviewId++,
    productId: parseInt(productId),
    username,
    rating: parseInt(rating),
    comment,
    createdAt: new Date().toISOString(),
  };
  data.reviews.push(review);
  res.status(201).json({ message: "Arvustus lisatud!", review });
});

module.exports = router;
