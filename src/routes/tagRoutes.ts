import { getTags, createTag } from "../controllers/tagController";
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getTags);
router.post("/", authenticateToken, createTag);

export default router;
