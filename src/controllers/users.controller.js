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

        const userBookId = this.lastID;

        const query = `
  SELECT
    books.id,
    books.title,
    books.author,
    books.type,
    books.genre,
    user_books.status,
    user_books.recommendation,
    user_books.comment
  FROM user_books
  JOIN books ON user_books.book_id = books.id
  WHERE user_books.id = ?
`;

        db.get(query, [userBookId], (err, book) => {
          if (err) {
            return res.status(500).json({ error: "Erreur serveur" });
          }
          return res.status(201).json({
            message: "Livre ajouté dans votre bibliothèque.",
            book,
          });
        });
      },
    );
  });
};

// Voir mes livres
export const getMyLibrary = (req, res) => {
  const userId = req.user.userId;

  const query = `
    SELECT
      books.id,
      books.title,
      books.author,
      books.type,
      books.genre,
      user_books.status,
      user_books.recommendation,
      user_books.comment
    FROM user_books
    JOIN books ON user_books.book_id = books.id
    WHERE user_books.user_id = ?
    ORDER BY user_books.id DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Erreur serveur" });
    }

    res.json(rows);
  });
};

// Modifier un livre dans ma bibliotheque
export const updateBookInMyLibrary = (req, res) => {
  const userId = req.user.userId;
  const bookId = Number(req.params.bookId);
  const { status, recommendation, comment } = req.body;

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ error: "Identifiant du livre invalide" });
  }

  const fieldsToUpdate = [];
  const values = [];

  if (status !== undefined) {
    const allowedStatuses = ["to_read", "reading", "read"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Statut de lecture invalide" });
    }

    fieldsToUpdate.push("status = ?");
    values.push(status);
  }

  if (recommendation !== undefined) {
    const allowedRecommendations = [0, 1, null];

    if (!allowedRecommendations.includes(recommendation)) {
      return res.status(400).json({ error: "Recommendation invalide" });
    }

    fieldsToUpdate.push("recommendation = ?");
    values.push(recommendation);
  }

  if (comment !== undefined) {
    if (comment !== null && typeof comment !== "string") {
      return res.status(400).json({ error: "Commentaire invalide" });
    }

    fieldsToUpdate.push("comment = ?");
    values.push(comment);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({
      error: "Veuillez fournir au moins une information a modifier",
    });
  }

  db.get(
    `SELECT id FROM user_books WHERE user_id = ? AND book_id = ?`,
    [userId, bookId],
    (err, existingUserBook) => {
      if (err) {
        return res.status(500).json({ error: "Erreur serveur" });
      }

      if (!existingUserBook) {
        return res.status(404).json({
          error: "Ce livre n'est pas dans votre bibliotheque",
        });
      }

      const query = `
        UPDATE user_books
        SET ${fieldsToUpdate.join(", ")}
        WHERE user_id = ? AND book_id = ?
      `;

      db.run(query, [...values, userId, bookId], function (err) {
        if (err) {
          return res.status(500).json({ error: "Erreur serveur" });
        }

        const query2 = `SELECT
      books.id,
      books.title,
      books.author,
      books.type,
      books.genre,
      user_books.status,
      user_books.recommendation,
      user_books.comment
      FROM user_books JOIN books ON user_books.book_id = books.id
      WHERE user_books.user_id = ? AND user_books.book_id = ? `;

        db.get(query2, [userId, bookId], (err, book) => {
          if (err) {
            return res.status(500).json({ error: "Erreur serveur" });
          }

          return res.status(200).json({
            message: "Livre mis a jour dans votre bibliotheque",
            book,
          });
        });
      });
    },
  );
};

// Retirer un livre de ma bibliotheque
export const removeBookFromMyLibrary = (req, res) => {
  const userId = req.user.userId;
  const bookId = Number(req.params.bookId);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ error: "Identifiant du livre invalide" });
  }

  db.run(
    `DELETE FROM user_books WHERE user_id = ? AND book_id = ?`,
    [userId, bookId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Erreur serveur" });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "Ce livre n'est pas dans votre bibliotheque",
        });
      }

      return res.status(200).json({
        message: "Livre retire de votre bibliotheque",
        bookId,
      });
    },
  );
};

// Voir le profil d'un utilisateur en fonction de son id
export const getUserById = (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Identifiant utilisateur invalide" });
  }

  const query = `
    SELECT id, username 
    FROM users
    WHERE id = ?
  `;

  db.get(query, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    return res.json(user);
  });
};

// Voir la bibliothèque de l'utilisateur en fonction de son id
export const getUserLibraryById = (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Identifiant utilisateur invalide" });
  }

  const query1 = `
    SELECT id, username 
    FROM users
    WHERE id = ?
  `;

  db.get(query1, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const query2 = `
      SELECT books.id, books.title, books.author, books.type, books.genre, 
        user_books.status, user_books.recommendation, user_books.comment
      FROM user_books
      JOIN books ON user_books.book_id = books.id
      WHERE user_books.user_id = ?
      ORDER BY user_books.id DESC
    `;

    db.all(query2, [userId], (err, books) => {
      if (err) {
        return res.status(500).json({ error: "Erreur serveur" });
      }

      return res.json({
        user,
        books,
      });
    });
  });
};
