const express = require("express");
const router = express.Router();
const data = require("../data");

router.post("/signup", (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: "Vajalikud väljad: username, password, name" });
  }
  if (data.users.find((u) => u.username === username)) {
    return res.status(409).json({ error: "Kasutajanimi on juba olemas" });
  }
  const user = { id: data.nextUserId++, username, password, name };
  data.users.push(user);
  const token = `token_${user.id}_${Date.now()}`;
  data.sessions[token] = user.id;
  res.status(201).json({ message: "Kasutaja loodud!", token, user: { id: user.id, username: user.username, name: user.name } });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Vajalikud väljad: username, password" });
  }
  const user = data.users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Vale kasutajanimi või parool" });
  }
  const token = `token_${user.id}_${Date.now()}`;
  data.sessions[token] = user.id;
  res.json({ message: "Sisselogimine õnnestus!", token, user: { id: user.id, username: user.username, name: user.name } });
});

router.post("/logout", (req, res) => {
  const token = req.headers.authorization;
  if (token && data.sessions[token]) delete data.sessions[token];
  res.json({ message: "Välja logitud!" });
});

router.get("/me", (req, res) => {
  const userId = data.sessions[req.headers.authorization];
  if (!userId) return res.status(401).json({ error: "Pole sisse logitud" });
  const user = data.users.find((u) => u.id === userId);
  res.json({ id: user.id, username: user.username, name: user.name });
});

router.get("/verify", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Token puudub" });
  const userId = data.sessions[token];
  if (!userId) return res.status(401).json({ error: "Sessioon aegunud või vigane" });
  const user = data.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "Kasutajat ei leitud" });
  res.json({ id: user.id, username: user.username, name: user.name });
});

router.get("/", (req, res) => {
  res.json({ users: data.users.map((u) => ({ id: u.id, username: u.username, name: u.name })) });
});

module.exports = router;
