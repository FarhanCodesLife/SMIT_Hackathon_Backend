import express from "express";
import { createPost, getAllPosts, getPostById, deletePost, editPost,  } from "../controllers/post.controllers.js";
import { authenticateUser } from "../middlewere/auth.middlewere.js";
import { upload } from "../middlewere/multer.middlewere.js";

const router = express.Router();

router.post("/create",upload.single("image"), createPost);
// router.post("/image",upload.single("image"), uploadImage);
router.get("/all", getAllPosts);
router.get("/:id", getPostById);
router.delete("/:id", authenticateUser, deletePost);
router.put("/:id", authenticateUser, editPost);

export default router;