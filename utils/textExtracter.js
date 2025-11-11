// import PDFParse from 'pdf-parse';

// const extractText = async (filePath) => {
//     try {
//         const parser = new PDFParse({ url: filePath });
//         const extractedText = await parser.getText();

//         const pages = extractedText.pages;

//         // Restrict page count
//         if (pages.length > 3) {
//             return { text: null, error: "Only up to 3 pages are allowed." };
//         }

//         // Combine page text
//         let combinedText = pages.map((v) => v.text).join(" ");

//         // Clean the text
//         let cleanedText = combinedText
//             .replace(/\s+/g, " ")           // collapse excessive whitespace
//             .replace(/[\u2022•●▪♦■]+/g, "") // remove bullet symbols
//             .replace(/[0-9]+\s*(Row|Column)\s*[0-9]*/gi, "") // remove table references
//             .trim();

//         // Count words
//         const wordCount = cleanedText.split(/\s+/).length;

//         // Restrict to 2500 words max
//         if (wordCount > 2500) {
//             cleanedText = cleanedText.split(/\s+/).slice(0, 2500).join(" ");
//         }

//         return { text: cleanedText, error: null };
//     } catch (err) {
//         console.error("Error extracting PDF text:", err);
//         return { text: null, error: "Failed to extract text from PDF." };
//     }
// };

// export default extractText;

import pdf from 'pdf-parse';

/**
 * Extracts text content from a PDF buffer using the pdf-parse library.
 * 
 * @param {Buffer} buffer The PDF data as a Node.js Buffer object.
 * @returns {Promise<{text: string | null, error: string | null}>} An object containing the extracted text or an error message.
 */

const extractTextFromBuffer = async (buffer) => {
    try {
        // Parse PDF buffer
        const data = await pdf(buffer);
        let text = data.text;

        if (!text || text.trim().length === 0) {
            return { text: null, error: "PDF is empty or could not be parsed." };
        }

        // Remove hyphenation at line breaks: "exam-\nple" → "example"
        text = text.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');

        // Replace newlines and tabs with a period + space for readability
        text = text.replace(/[\r\n\t]+/g, ". ");

        // Collapse multiple spaces into one
        text = text.replace(/\s+/g, " ");

        // Remove common bullet points or symbols
        text = text.replace(/[\u2022•●▪♦■]+/g, "");

        // Trim start/end whitespace
        text = text.trim();

        // Optionally, limit text to first 2500 words for AI processing
        const words = text.split(" ");
        if (words.length > 2500) {
            text = words.slice(0, 2500).join(" ");
        }

        return { text, error: null };
    } catch (error) {
        console.error("Error parsing PDF buffer:", error);
        return { text: null, error: "Failed to parse PDF." };
    }
};

export default extractTextFromBuffer