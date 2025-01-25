import express from "express";
import { createUser, logInUser, logoutUser, refreshToken } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", logInUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

export default router;