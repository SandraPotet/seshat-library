// import modules
import express from "express";
import cors from "cors"; // pour autoriser les requêtes cross-origin (entre différents domaines)
import dotenv from "dotenv"; // pour lire fichier .env
import db from "./db.js"; // initialiser la base de données
import bcrypt from "bcrypt"; // pour hasher les mots de passe
import jwt from "jsonwebtoken"; // pour créer et vérifier les tokens d'authentification
import { authMiddleware } from "./middlewares/auth.js"; // middleware pour protéger les routes nécessitant une authentification

dotenv.config(); // charger les variables d'environnement depuis le fichier .env

// création de l'application express (serveur)
const app = express();

// middlewares
app.use(cors()); // pour autoriser les requêtes cross-origin (entre différents domaines)
app.use(express.json()); // pour lire les données envoyées en JSON

// routes
app.get("/", (req, res) => {
  res.send("Seshat API is running");
});

// route pour l'inscription d'un nouvel utilisateur
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log("Body:", req.body);

  if (!username || !password) {
    return res.status(400).json({error: "Champ requis"});
  }

  const query = `INSERT INTO users (username, password) VALUES (?, ?)`;

  const hashedPassword = await bcrypt.hash(password, 10); // hasher le mot de passe avec un salt de 10 rounds

  db.run(query, [username, hashedPassword], function(err) {
    if (err) {
      return res.status(500).json({error: err.message});
    }
    res.status(201).json({message: "Utilisateur créé", userId: this.lastID});
  });
});

// route pour la connexion d'un utilisateur
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (!user) return res.status(404).json({ error: "Introuvable" });

      const match = await bcrypt.compare(password, user.password); 
      //extrait le salt du hash stocké + hache `password` avec ce même salt + compare 

      if (!match) return res.status(401).json({ error: "Mot de passe incorrect" });

      const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET, { expiresIn: "24h" });

      res.json({ message: "Connexion réussie", token });
    }
  );
});

// route protégée pour tester l'authentification
app.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user
  });
});

const PORT = process.env.PORT || 3000;

// démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});