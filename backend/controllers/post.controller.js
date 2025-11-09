import { User } from "../models/user.model.js";
import sharp from "sharp";
import getDataUri from "../utils/dataURI";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        const optimizedImageBuffer = await sharp(image.buffer).resize({ width: 800, height: 800, fit: "inside" }).toFormat("jpeg", { quality: 80 }).toBuffer();
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
        const cloudinaryResponse = await cloudinary.uploader.upload(fileUri);

        const post = await Post.create({
            image: cloudinaryResponse.secure_url,
            caption,
            author: authorId
        }, { new: true });

        await User.findByIdAndUpdate(
            authorId,
            { $push: { posts: post._id } }
        );

        await post.populate({ path: "author", select: "-password" });

        return res.status(201).json({
            success: true,
            message: "Post created successfully!",
            post
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({

        });
    }
}

export const getAllPost = async (req, res) => {
    try {
        const allPosts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: "author", select: "username profilePicture" })
            .populate({ path: "comments", select: "username profilePicutre", populate: { path: "author", select: "username profilePicture" } });
        return res.status(200).json({
            success: true,
            message: "All Post fetched successfully!",
            allPosts
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}