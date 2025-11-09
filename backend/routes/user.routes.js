import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { editProfile, getProfile, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/getProfile/:id").get(isAuthenticated, getProfile);
router.route("/editProfile").post(isAuthenticated, upload.single("profilePicture"), editProfile);

export default router;

