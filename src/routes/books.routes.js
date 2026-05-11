import express from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
} from "../controllers/books.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBook);
router.get("/", getAllBooks);
router.get("/:id", getBookById);

export default router;
