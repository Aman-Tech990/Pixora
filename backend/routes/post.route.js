import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addNewPost, bookmarkPost, deletePost, disikePost, fetchAllPost, fetchAllUserPost, fetchParticularPostComment, likePost, postComment } from "../controllers/post.controller.js";

const router = express.Router();

router.route("/addPost").post(isAuthenticated, upload.single("image"), addNewPost);
router.route("/allPost").get(isAuthenticated, fetchAllPost);
router.route("/userAllPost").get(isAuthenticated, fetchAllUserPost);
router.route("/likePost/:id").get(isAuthenticated, likePost);
router.route("/dislikePost/:id").get(isAuthenticated, disikePost);
router.route("/comment/:id").post(isAuthenticated, postComment);
router.route("/allComments/:id").post(isAuthenticated, fetchParticularPostComment);
router.route("/deletePost/:id").post(isAuthenticated, deletePost);
router.route("/bookmarkPost/:id").post(isAuthenticated, bookmarkPost);

export default router;

