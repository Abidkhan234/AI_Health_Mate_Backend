import User from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js"
import "dotenv/config"
import sendResponse from "../utils/sendResponse.js";

const registerUser = async (req, res) => {
    try {

        const { userName, email } = req.body;

        const user = await User.findOne({
            $or: [{ email }, { userName }]
        });

        if (user) {
            const field = user.email === email ? "Email" : "User name";
            return res.status(409).send({
                status: 409,
                message: `${field} already exists`
            });
        }

        await User.create({ ...req.body });

        sendResponse(res, 201, "Register successfully")
    } catch (error) {
        console.log("Register Error", error);
        sendResponse(res, 500, "Internal Server Error", { error: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, userName, password } = req.body;

        // Find user by email OR username
        const user = await User.findOne({
            $or: [{ email }, { userName }]
        }).select("+password");

        // 404 — Not Found
        if (!user) {
            return sendResponse(res, 404, "User not found")
        }

        // Compare password (make sure to call the instance method)
        const isValidPass = await user.comparePassword(password);

        // 401 — Unauthorized (wrong credentials)
        if (!isValidPass) {
            return sendResponse(res, 401, "Invalid password")
        }

        // Generate tokens
        const accessToken = generateAccessToken("15m", { userId: user._id, userName: user.userName, email: user.email });

        const refreshToken = generateRefreshToken("1h", user._id);

        user.refreshToken = refreshToken;

        await user.save();

        // 200 — OK
        sendResponse(res, 200, "Login successful", { accessToken, refreshToken })
    } catch (error) {
        console.error("Login Error:", error);
        // 500 — Internal Server Error
        sendResponse(res, 500, "Internal server error", { error: error.message })
    }
};

const logoutUser = (req, res) => {
    res.status(200).send({ status: 200, message: "Logout successfully" });
}

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await User.findOne({ _id: decoded.id });

        if (!user) {
            sendResponse(res, 404, "User not found")
            return
        }

        const newAccessToken = generateAccessToken("15m", { userId: user._id, userName: user.userName });

        sendResponse(res, 200, "Token refreshed", { accessToken: newAccessToken })
    } catch (error) {
        console.log("Token Refresh Error", error);
        if (error.message.includes("jwt expired")) {
            sendResponse(res, 401, "Sign In again")
            return
        }
        sendResponse(res, 500, "Internal server error", { error: error.message });
    }
};

export { loginUser, registerUser, refreshAccessToken, logoutUser }