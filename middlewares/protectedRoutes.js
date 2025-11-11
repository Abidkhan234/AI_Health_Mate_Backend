import jwt from 'jsonwebtoken'
import "dotenv/config"
import User from '../models/userModel.js'

const protectedRoute = async (req, res, next) => {

    const header = req.headers["authorization"];

    if (!header) {
        return res.status(401).send({ status: 401, message: "No token provided" })
    }
    const token = header?.split(" ")[1];

    if (!token) {
        return res.status(401).send({ status: 401, message: "No token provided" })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).send({ status: "404", message: "User not found" })
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Protected Middleware Error", error);

        if (error.message.includes("invalid signature")) {

            return res.status(403).send({ status: 403, message: "Invalid Access Token" })

        } else if (error.message.includes("jwt expired")) {

            return res.status(403).send({ status: 403, message: "Token expired" })

        }

        res.status(500).send({ status: 500, message: "Internal server error", error: error.message })
    }
}

export default protectedRoute