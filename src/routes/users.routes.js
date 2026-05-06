import express from "express";
import {
  getMe,
  addBookToMyLibrary,
  getMyLibrary,
} from "../controllers/users.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.post("/me/books", authMiddleware, addBookToMyLibrary);
router.get("/me/books", authMiddleware, getMyLibrary);

export default router;
