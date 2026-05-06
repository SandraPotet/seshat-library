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

// Ajouter un livre à sa bibliothèque perso
export const addBookToMyLibrary = (req, res) => {
  const userId = req.user.userId;
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({
      error: "Veuillez choisir un livre à ajouter à votre bibliothèque",
    });
  }

  db.get(`SELECT id FROM books WHERE id = ?`, [bookId], (err, existingBook) => {
    if (err) {
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (!existingBook) {
      return res.status(404).json({ error: "Livre introuvable" });
    }

    db.run(
      `INSERT INTO user_books (user_id, book_id, status) VALUES (?, ?, ?)`,
      [userId, bookId, "to_read"],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res
              .status(409)
              .json({ error: "Ce livre est déjà dans votre bibliothèque" });
          }

          return res.status(500).json({ error: "Erreur serveur" });
        }

        res.status(201).json({
          id: this.lastID,
          userId,
          bookId,
          status: "to_read",
          recommendation: null,
          comment: null,
        });
      },
    );
  });
};
