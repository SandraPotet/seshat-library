import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import bookRoutes from "./routes/books.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Seshat API is running");
});

app.use("/auth", authRoutes);

app.use("/users", userRoutes);

app.use("/books", bookRoutes);

export default app;