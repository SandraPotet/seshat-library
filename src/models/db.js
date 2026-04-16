import sqlite3 from 'sqlite3'; // syntaxe ES6 pour importer sqlite3
import { fileURLToPath } from 'url'; // pour obtenir le chemin du fichier actuel dans un module ES6
import path from 'path'; // pour manipuler les chemins de fichiers

const __filename = fileURLToPath(import.meta.url);// obtenir le chemin du fichier actuel
const __dirname = path.dirname(__filename); // créer une connexion à la base de données SQLite, le fichier sera créé s'il n'existe pas

const dbPath = path.join(__dirname, '../database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if(err){ 
        console.error("Erreur DB :", err);
    } else {
        console.log("📀 Connexion DB réussie :", dbPath);
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        type TEXT,
        genre TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        book_id INTEGER,
        status TEXT CHECK(status IN ('to_read', 'reading', 'read')),
        recommendation INTEGER CHECK(recommendation IN (0,1)),
        comment TEXT,
        UNIQUE(user_id, book_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(book_id) REFERENCES books(id)
    )`);
});

export default db; // exporter la connexion à la base de données pour l'utiliser dans d'autres fichiers