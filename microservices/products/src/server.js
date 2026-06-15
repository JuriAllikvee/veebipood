const express = require("express");
const cors = require("cors");
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 5052;

app.use(cors());
app.use(express.json());

app.use("/api/products", productsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "products", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Toodete teenus jookseb pordil: ${PORT}`);
});
