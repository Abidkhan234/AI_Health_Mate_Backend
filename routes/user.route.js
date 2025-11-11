import express from 'express'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/auth.controller.js';

const userRoute = express.Router();

userRoute.post("/register", registerUser);

userRoute.post("/login", loginUser);

userRoute.post("/refresh-token", refreshAccessToken);

userRoute.post("/logout", logoutUser);

export default userRoute;