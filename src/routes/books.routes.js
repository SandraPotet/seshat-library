import express from "express";
import { createBook, getAllBooks } from "../controllers/books.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBook);
router.get("/", getAllBooks);

export default router;
