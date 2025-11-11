import "dotenv/config";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

const algorithm = "aes-256-cbc";
const secretKey =
    createHmac("sha256", process.env.ENCRYPTION_SECRET)
        .digest("base64")
        .substring(0, 32); // must be 32 bytes for AES-256

const encryptText = (text) => {
    if (!text) return "";
    const iv = randomBytes(16);
    const cipher = createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
};

const decryptText = (cipherText) => {
    if (!cipherText) return "";
    const [ivHex, encrypted] = cipherText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};

export { encryptText, decryptText }