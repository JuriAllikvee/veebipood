const express = require("express");
const cors = require("cors");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5053;

app.use(cors());
app.use(express.json());

app.use("/api/orders", ordersRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "orders", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Tellimuste teenus jookseb pordil: ${PORT}`);
});
