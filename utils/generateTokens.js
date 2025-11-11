import jwt from 'jsonwebtoken'
import "dotenv/config"

const generateJWTExpiryTime = (time) => {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1), 10);

    if (unit === "s") return value;
    if (unit === "m") return value * 60;
    if (unit === "h") return value * 3600;
    if (unit === "d") return value * 86400;

    throw new Error("Invalid time format");
};

const generateAccessToken = (expiryTime, { userId, userName, email }) => {
    return jwt.sign({ id: userId, userName, email }, process.env.JWT_ACCESS_SECRET, { expiresIn: generateJWTExpiryTime(expiryTime) });
}

const generateRefreshToken = (expiryTime, userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: generateJWTExpiryTime(expiryTime) });
}

export { generateAccessToken, generateRefreshToken };