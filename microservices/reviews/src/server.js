const express = require("express");
const cors = require("cors");
const reviewsRouter = require("./routes/reviews");

const app = express();
const PORT = process.env.PORT || 5054;

app.use(cors());
app.use(express.json());

app.use("/api/reviews", reviewsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "reviews", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Arvustuste teenus jookseb pordil: ${PORT}`);
});
