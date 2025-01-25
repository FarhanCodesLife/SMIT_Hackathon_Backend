import express from "express";
import { signIn, signUp } from "../controllers/user.controllers.js";
import { authenticateUser } from "../middleware/user.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", signIn);
router.get("/verifyUser", authenticateUser, (req, res) => {
    res.json({ message: "Hey! You Are Logged In", user: req.user });
});

export default router;
