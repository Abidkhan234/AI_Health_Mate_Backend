import genAI from "../config/gemini.js";

const summarizeMedicalReport = async (extractedText) => {
    try {
        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error("No text extracted from the document");
        }

        const prompt = `
You are a professional medical assistant AI that reads and explains medical documents for patients.

Your task:
1. Summarize the provided medical document in clear, structured, and patient-friendly language.
2. Give helpful suggestions or next steps based on the report findings.
3. Use only simple HTML tags for formatting (no Markdown, no CSS, no JavaScript).

Formatting Rules:
- Use <h2> for main section headings
- Use <ul> and <li> for bullet points
- Use <p> for short paragraphs
- Use <strong> to highlight important medical terms or warnings
- Do not include <style>, <script>, or external links

Your response must follow this structure:
<h2>Main Findings or Diagnosis</h2>
<p>...</p>

<h2>Key Lab Values or Results</h2>
<ul>
  <li>...</li>
</ul>

<h2>What the Patient Should Know or Do Next</h2>
<ul>
  <li>...</li>
</ul>

<h2>Warnings or Abnormal Findings</h2>
<ul>
  <li>...</li>
</ul>

<h2>AI Suggestions</h2>
<ul>
  <li>Explain what actions the patient should take (e.g., visit a doctor, repeat tests, lifestyle changes)</li>
  <li>Include helpful health or follow-up recommendations based on the report</li>
</ul>

Keep your language simple and under 300 words.

Text to analyze:
${extractedText}
`;


        const response = genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const summary = (await response).text.replace(/\\n/g, " ")   // remove literal '\n'
            .replace(/\n/g, " ")    // remove real newlines
            .replace(/\s+/g, " ") // normalize spaces
            .replaceAll("**", "")
            .trim();

        return { summary, error: null };
    } catch (error) {
        console.error("Error summarizing medical report:", error.message);
        // Handle known Gemini API errors separately if needed
        if (error.message.includes("429") || error.message.includes("quota")) {
            return { summary: null, error: "AI usage limit reached for today" };
        }

        throw error
    }
}

export default summarizeMedicalReport