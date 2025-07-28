import express from "express";
import {
  getFAQs,
  createFAQ,
  deleteFAQ,
  updateFAQ,
  getFAQsById,
} from "../controllers/Faq";

const router = express.Router();
router.get("/question", getFAQs);
router.post("/question", createFAQ);
router.get("/question/:id", getFAQsById);
router.patch("/question/:id", updateFAQ);
router.delete("/question/:id", deleteFAQ);
export default router;
