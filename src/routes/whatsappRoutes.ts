import express from "express";
import {
  connectWhatsapp,
  getStatus,
  disconnectWhatsapp,
} from "../controllers/whatsappController";

const router = express.Router();

router.post("/connect", connectWhatsapp);
router.get("/status", getStatus);
router.post("/disconnect", disconnectWhatsapp);

export default router;
