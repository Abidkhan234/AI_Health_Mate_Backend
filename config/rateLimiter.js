import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // allow 2 AI requests per user per minute
    message: {
        status: "error",
        message: "Too many requests. Try again in a minute."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default rateLimiter