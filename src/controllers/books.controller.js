import db from "../models/db.js";

// créer un livre
export const createBook = (req, res) => {
  const { title, author, type, genre } = req.body;

  const cleanTitle = title?.trim();
  const cleanAuthor = author?.trim();

  if (!cleanTitle || !cleanAuthor) {
    return res.status(400).json({ error: "Title and author are required" });
  }

  const query = `INSERT INTO books (title, author, type, genre) VALUES (?, ?, ?, ?)`;

  db.run(query, [cleanTitle, cleanAuthor, type, genre], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      id: this.lastID,
      title: cleanTitle,
      author: cleanAuthor,
      type,
      genre,
    });
  });
};

// récupérer tous les livres
export const getAllBooks = (req, res) => {
  const query = `SELECT * FROM books`;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Obtenir les informations d'un livre en fonction de son id
export const getBookById = (req, res) => {
  const bookId = Number(req.params.id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ error: "Identifiant du livre invalide" });
  }

  const query1 = `SELECT id, title, author, type, genre FROM books WHERE id = ?`;

  db.get(query1, [bookId], (err, book) => {
    if (err) {
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (!book) {
      return res.status(404).json({ error: "Livre introuvable" });
    }

    const query2 = `
      SELECT 
        SUM(CASE WHEN recommendation = 1 THEN 1 ELSE 0 END) AS recommended,
        SUM(CASE WHEN recommendation = 0 THEN 1 ELSE 0 END) AS notRecommended,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) AS totalRead,
        COUNT(*) AS totalInLibraries
      FROM user_books
      WHERE book_id = ?
    `;

    db.get(query2, [bookId], (err, stats) => {
      if (err) {
        return res.status(500).json({ error: "Erreur serveur" });
      }

      const query3 = `
      SELECT 
        users.username, 
        user_books.status, 
        user_books.recommendation, 
        user_books.comment
      FROM user_books 
      JOIN users ON user_books.user_id = users.id
      WHERE user_books.book_id = ? 
      AND user_books.comment IS NOT NULL
      ORDER BY user_books.id DESC
      `;

      db.all(query3, [bookId], (err, comments) => {
        if (err) {
          return res.status(500).json({ error: "Erreur serveur" });
        }

        return res.json({
          book,
          stats: {
            recommended: stats.recommended || 0,
            notRecommended: stats.notRecommended || 0,
            totalRead: stats.totalRead || 0,
            totalInLibraries: stats.totalInLibraries || 0,
          },
          comments,
        });
      });
    });
  });
};
