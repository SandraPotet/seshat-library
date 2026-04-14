import db from "../models/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Champ requis" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;

    db.run(query, [username, hashedPassword], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: "Utilisateur créé",
            userId: this.lastID,
        });
    });
};


export const login = async (req, res) => {
    const { username, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        async (err, user) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (!user) return res.status(404).json({ error: "Introuvable" });

            const match = await bcrypt.compare(password, user.password);

            if (!match)
                return res.status(401).json({ error: "Mot de passe incorrect" });

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({ message: "Connexion réussie", token });
        }
    );
};