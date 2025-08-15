import dotenv from "dotenv";
dotenv.config();

export const askGeminiRaw = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          },
        }),
      }
    );
    const data = await response.json();
    console.log("🔍 Full Gemini API response:", JSON.stringify(data, null, 2));
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No Response";
  } catch (err) {
    console.error("AI error", err);
    return "AI Error";
  }
};
