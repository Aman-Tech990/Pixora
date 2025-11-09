import { User } from "../models/user.model.js";
import sharp from "sharp";
import { Comment } from "../models/comment.model.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

// CREATE NEW POST
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

// FETCH ALL POSTS
export const fetchAllPost = async (req, res) => {
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

// FETCH ALL USER POST
export const fetchUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: { $eq: authorId } }).sort({ createdAt: -1 }).populate({ path: "author", select: "username profilePicture" }).populate({ path: "comments", sort: { createdAt: -1 }, populate: { path: "author", select: "username profilePicture" } });
        if (!posts) {
            return res.status(404).json({
                success: false,
                message: "Posts unavailable!",
            });
        }
        return res.status(200).json({
            success: true,
            message: "User post fetched successfully!",
            posts
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}

// LIKE POST
export const likePost = async (req, res) => {
    try {
        const userToLike = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found!"
            });
        }
        // Main Like Logic
        await post.updateOne({ $addToSet: { likes: userToLike } });
        await post.save();

        // Socket.io implementation

        return res.status(200).json({
            success: true,
            message: "Post liked successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}

// DISLIKE POST
export const disikePost = async (req, res) => {
    try {
        const userToDislike = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found!"
            });
        }
        // Main Like Logic
        await post.updateOne({ $pull: { likes: userToDislike } });
        await post.save();

        // Socket.io implementation

        return res.status(200).json({
            success: true,
            message: "Post disliked successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}

// COMMENT ON POST
export const postComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userToComment = req.id;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Text is required!"
            });
        }

        const post = await Post.findById(postId);

        const comment = await Comment.create({
            text,
            author: userToComment,
            post: postId
        }).populate({ path: "author", select: "username profilePicture" }, { new: true });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            success: true,
            message: "Comment added successfully!",
            comment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}

// Fetch comments for a particular post
export const fetchParticularPostComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = (await Comment.find({ post: postId })).toSorted({ createdAt: -1 }).populate({ path: "author", select: "username profilePicture" });

        if (!comments) {
            return res.status(404).json({
                success: false,
                message: "No comments found!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Comments fetched successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}

// Delete post
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found!"
            });
        }

        // Authorize the user
        if (post.author.toString() !== authorId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized user!"
            });
        }

        // Delete Post
        await Post.findByIdAndDelete(postId);

        // Remove postId from user
        await User.findByIdAndUpdate(authorId, {
            $pull: { posts: postId }
        });

        // Remove comments from post
        await Comment.deleteMany({ post: { $eq: postId } });

        // Success JSON Response
        return res.status(200).json({
            success: true,
            message: "Post deleted successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}