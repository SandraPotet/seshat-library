import db from "../models/db.js";

// voir la page de l'utilisateur connecté
export const getMe = (req, res) => {
  const userId = req.user.userId;

  db.get(
    `SELECT id, username FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Erreur serveur" });
      }

      if (!user) {
        return res.status(404).json({ error: "Utilisateur introuvable" });
      }

      res.json(user);
    },
  );
};
