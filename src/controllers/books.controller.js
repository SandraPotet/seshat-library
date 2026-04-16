import db from "../models/db.js";

// créer un livre
export const createBook = (req, res) => {
    const { title, author, type, genre } = req.body;

    if (!title || !author) {
        return res.status(400).json({ error: "Title and author are required" });
    }

    const query = `INSERT INTO books (title, author, type, genre) VALUES (?, ?, ?, ?)`;

    db.run(query, [title, author, type, genre], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            id: this.lastID,
            title,
            author,
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