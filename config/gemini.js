import { GoogleGenAI } from "@google/genai";
import 'dotenv/config'

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

export default genAI