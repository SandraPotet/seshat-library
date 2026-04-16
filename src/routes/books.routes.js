import exress from "express";
import { createBook, getAllBooks } from "../controllers/books.controller.js";

const router = exress.Router();

router.post("/", createBook);
router.get("/", getAllBooks);

export default router;