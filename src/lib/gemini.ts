import { GoogleGenAI } from "@google/genai";
import type { GeminiCandidate } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function searchMetadata(
  title: string,
  categories: string[]
): Promise<GeminiCandidate[]> {
  const categoriesStr = categories.map((c) => `"${c}"`).join(", ");

  const prompt = `You are a metadata lookup assistant. The user wants to log a review for: "${title}"

Their available categories are: ${categories.join(", ")}

Return up to 5 matching candidates as a JSON array. Each candidate must have:
- "category": one of [${categoriesStr}] that best fits
- "title": the full official title (in original language if non-English, include year if helpful for disambiguation)
- "creator": the primary creator (artist, director, author, studio, etc.)
- "release_date": in "YYYY-MM-DD" format (use "YYYY-01-01" if only year is known)
- "image_search_query": a precise Google Image Search query to find the OFFICIAL representative image (cover, poster, key visual, logo, etc.) for this work. Include the full title, creator/artist name, year if helpful for disambiguation, and a keyword for the image type (e.g. "poster", "cover art", "key visual", "album cover", "book cover", "official artwork"). Be specific enough that the first Google Images result would be the correct official image.

If multiple distinct works share the same title, return each as a separate candidate.

Return ONLY valid JSON array. Format:
[{"category":"...","title":"...","creator":"...","release_date":"...","image_search_query":"..."}]`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      // tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "[]";
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
