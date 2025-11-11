import { PDFParse } from 'pdf-parse';

const extractText = async (filePath) => {
    try {
        const parser = new PDFParse({ url: filePath });
        const extractedText = await parser.getText();

        const pages = extractedText.pages;

        // Restrict page count
        if (pages.length > 3) {
            return { text: null, error: "Only up to 3 pages are allowed." };
        }

        // Combine page text
        let combinedText = pages.map((v) => v.text).join(" ");

        // Clean the text
        let cleanedText = combinedText
            .replace(/\s+/g, " ")           // collapse excessive whitespace
            .replace(/[\u2022•●▪♦■]+/g, "") // remove bullet symbols
            .replace(/[0-9]+\s*(Row|Column)\s*[0-9]*/gi, "") // remove table references
            .trim();

        // Count words
        const wordCount = cleanedText.split(/\s+/).length;

        // Restrict to 2500 words max
        if (wordCount > 2500) {
            cleanedText = cleanedText.split(/\s+/).slice(0, 2500).join(" ");
        }

        return { text: cleanedText, error: null };
    } catch (err) {
        console.error("Error extracting PDF text:", err);
        return { text: null, error: "Failed to extract text from PDF." };
    }
};

export default extractText;