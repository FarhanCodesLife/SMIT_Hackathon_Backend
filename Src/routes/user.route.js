import express from "express";
import  { createUser, getAllUsers, logInUser, logoutUser, refreshToken } from "../controllers/user.controllers.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", logInUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/all", getAllUsers);

export default router;