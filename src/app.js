import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Seshat API is running");
});

app.use("/auth", authRoutes);

app.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user,
  });
});

export default app;