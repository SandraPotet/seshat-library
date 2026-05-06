import express from "express";
import { getMe, addBookToMyLibrary } from "../controllers/users.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.post("/me/books", authMiddleware, addBookToMyLibrary);

export default router;
