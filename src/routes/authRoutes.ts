import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/authController";
import { Router } from "express";

const router = Router();

// endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
