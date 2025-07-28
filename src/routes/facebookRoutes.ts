import { Router } from "express";
import { fetchAllPagesPosts } from "../controllers/facebookController";

const router = Router();

router.get("/facebook/posts", fetchAllPagesPosts);

export default router;
