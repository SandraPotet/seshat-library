import db from "../models/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// créer un utilisateur
export const register = async (req, res) => {
  const { username, password } = req.body;

  const cleanUsername = username?.trim();

  if (!cleanUsername || !password) {
    return res.status(400).json({ error: "Champ requis" });
  }

  if (/\s/.test(cleanUsername)) {
    return res
      .status(400)
      .json({ error: "Le nom d'utilisateur ne doit pas contenir d'espace" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `INSERT INTO users (username, password) VALUES (?, ?)`;

  db.run(query, [cleanUsername, hashedPassword], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res
          .status(409)
          .json({ error: "Ce nom d'utilisateur est déjà utilisé" });
      }

      return res.status(500).json({ error: "Erreur serveur" });
    }

    res.status(201).json({
      message: "Utilisateur créé",
      userId: this.lastID,
    });
  });
};

// connecter un utilisateur
export const login = async (req, res) => {
  const { username, password } = req.body;

  const cleanUsername = username?.trim();

  if (!cleanUsername || !password) {
    return res.status(400).json({ error: "Champ requis" });
  }

  if (/\s/.test(cleanUsername)) {
    return res
      .status(400)
      .json({ error: "Le nom d'utilisateur ne doit pas contenir d'espace" });
  }

  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [cleanUsername],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Erreur serveur" });
      }

      if (!user) return res.status(404).json({ error: "Introuvable" });

      const match = await bcrypt.compare(password, user.password);

      if (!match)
        return res.status(401).json({ error: "Mot de passe incorrect" });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({ message: "Connexion réussie", token });
    },
  );
};
