const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5051;

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "users", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Kasutajate teenus jookseb pordil: ${PORT}`);
});
