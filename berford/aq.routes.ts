import express from "express";
import {
  getFAQs,
  createFAQ,
  getFAQsById,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faq";
// import { verifyUser, adminOnly } from "../middleware/authUser";
const router = express.Router();
router.get("/question", getFAQs);
router.post("/question", createFAQ);
router.get("/question/:id", getFAQsById);
router.patch("/question/:id", updateFAQ);
router.delete("/question/:id", deleteFAQ);

export default router;
