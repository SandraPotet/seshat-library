import express from "express";
import {
  getMe,
  addBookToMyLibrary,
  getMyLibrary,
  updateBookInMyLibrary,
  removeBookFromMyLibrary,
  getUserById,
} from "../controllers/users.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.post("/me/books", authMiddleware, addBookToMyLibrary);
router.get("/me/books", authMiddleware, getMyLibrary);
router.patch("/me/books/:bookId", authMiddleware, updateBookInMyLibrary);
router.delete("/me/books/:bookId", authMiddleware, removeBookFromMyLibrary);
router.get("/:id", getUserById);

export default router;
