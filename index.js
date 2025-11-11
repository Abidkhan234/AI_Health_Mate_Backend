import express from "express";
import "dotenv/config";
import mongoose from "./db/db.js";
import mainRoute from "./routes/main.route.js";
import rateLimiter from "./config/rateLimiter.js";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// Trust reverse proxy (important for production like Leapcell)
app.set("trust proxy", 1);

// Database connection
const db = mongoose.connection;

db.on("error", (error) => {
    console.error("DB Error:", error);
});

db.once("open", () => {
    console.log("DB Connected");
});

// Middleware
app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

// Routes
app.use("/api", mainRoute);

// Root route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running", status: 200 });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
