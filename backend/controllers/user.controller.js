import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/";   // assuming your model path
import getDataUri from "../utils/dataURI.js";
import cloudinary from "../utils/cloudinary.js"

// REGISTER
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            user: newUser
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Intenal server error",
            error: err.message
        });
    }
};


// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Incorrect email or password!"
            });
        }

        const match = await bcrypt.compare(password, user?.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password!"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.SECRET,
            { expiresIn: "1d" }
        );

        return res
            .status(200)
            .cookie("token", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            })
            .json({
                success: true,
                message: `Welcome back ${user.username}!`,
                user
            });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};


// LOGOUT
export const logout = async (req, res) => {
    return res
        .status(200)
        .cookie("token", "", {
            httpOnly: true,
            maxAge: 0
        })
        .json({
            success: true,
            message: "User logged out successfully!"
        });
};


// GET PROFILE
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User fetched successfully!",
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: "Internal server error!"
        });
    }
}

// EDIT PROFILE
export const editProfile = async () => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;

        let cloudResponse;
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        if (bio) user?.bio = bio;
        if (gender) user?.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}

// GET SUGGESTED USER
export const getSuggestedUser = async () => {
    try {
        const suggestedUser = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUser) {
            return res.status(404).json({
                success: false,
                message: "No users found!"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Users fetched successfully!",
            suggestedUser
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}

