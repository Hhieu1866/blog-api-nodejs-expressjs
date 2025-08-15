import { Router } from "express";
import {
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// user endpoints
router.get("/:id", authenticateToken, getUser);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

export default router;
