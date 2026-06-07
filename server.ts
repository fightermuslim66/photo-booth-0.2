import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// High limit for base64 photo uploads
app.use(express.json({ limit: "25mb" }));

// Initialize GoogleGenAI.
// It will look for process.env.GEMINI_API_KEY.
// We set 'User-Agent' to 'aistudio-build' as required.
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const ai = getGeminiClient();

// API endpoint for AI Photo Booth analysis & enhancement
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { image, mode, userPrompt, currentSettings } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Foto tidak ditemukan dalam request." });
    }

    // Clean base64 image prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

    const promptString = `
You are a highly professional editorial portrait photographer, creative director, and interactive photo-strip booth AI specialist.
Your goal is to inspect the user's photo booth snapshot and generate a professional, natural-looking "AI Studio enhancement" style suite.
Analyze the user's image (which is a photo taken from their camera or uploaded to the photo booth app).
Based on the image details (expression, clothing, mood, accessories, colors, lighting), produce a customized aesthetic profile in Indonesian.

Here is the context of what the user is requesting:
- Mode option selected: "${mode || "enhance"}"
- Additional request from user: "${userPrompt || "buat foto lebih natural dan estetik seperti fotografer pro"}"
- Current adjustment settings: ${JSON.stringify(currentSettings || {})}

Please return a JSON response matching the schema defined below. Give professional feedback and positive Indonesian remarks. Ensure the tone is fun, helpful, encouraging, and highly professional like a high-end studio in Jakarta or Seoul.

Return:
1. Analysis (Indonesian): Highlight what makes this photo special (e.g. "Senyuman hangat dengan pencahayaan natural", "Gaya kasual yang minimalis dengan siluet retro").
2. Persona (Indonesian): Give the user an awesome visual title (e.g., "K-Pop Drama Lead", "Chic Retro Minimalist", "Cozy High-Fashion Artist", "Cyberpunk Rebel").
3. Tips (Indonesian list): Three actionable pose or style tips (e.g., "Coba miringkan kepala 5 derajat ke kanan untuk menangkap soft shadows", "Gunakan filter 'Korea Style' dengan kehangatan tambahan untuk mencocokkan palette pakaianmu").
4. Recommended Dials: Fine-tuning sliders to apply to the canvas in the client-side for immediate visual improvement:
   - brightnessOffset: adjustment between -25 and 25 percent
   - contrastOffset: adjustment between -25 and 25 percent
   - saturationOffset: adjustment between -25 and 25 percent
   - blurSoftness: soft-focus bloom level (0 to 8px)
   - vignetteLevel: vignette density mapping (0 to 60 percent)
5. Custom Strip Label: A highly aesthetic, uppercase text stamp title for the photo-booth ribbon (e.g. "STUDIO CHIC // NEON 2026", "SEOUL RETRO VIBE", "COZY MINIMALIST // ART"). Make it match the user's outfits or background mood.
6. Custom Subtitle: A sub-title like "AI EXPERT REFINE" or "SEOUL INSPIRED".
7. Stickers To Include: 2 or 3 retro cute virtual photobooth stickers/tags to overlay. Define their Indonesian sticker text, color style, and relative positioning (xPercent and yPercent positions out of 100).
`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: promptString,
    };

    // Use gemini-3.5-flash as the standard flexible model for structured output
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.STRING,
              description: "Indonesian professional critique and descriptive assessment of the photo booth frame.",
            },
            persona: {
              type: Type.STRING,
              description: "Fun artistic name given to the user's styling/pose/look in Indonesian.",
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 unique styling, camera angle, or filter tips in Indonesian.",
            },
            recommendedDials: {
              type: Type.OBJECT,
              properties: {
                brightnessOffset: { type: Type.NUMBER, description: "Brightness modifier (percent offset from original, e.g. -15 to 15)" },
                contrastOffset: { type: Type.NUMBER, description: "Contrast modifier (percent offset from original, e.g. -15 to 20)" },
                saturationOffset: { type: Type.NUMBER, description: "Saturation modifier (percent offset from original, e.g. -10 to 15)" },
                blurSoftness: { type: Type.NUMBER, description: "Aesthetic blur factor for portrait glow (0 to 8)" },
                vignetteLevel: { type: Type.NUMBER, description: "Aesthetic vignette level on the frame (0 to 50)" },
              },
              required: ["brightnessOffset", "contrastOffset", "saturationOffset", "blurSoftness", "vignetteLevel"],
            },
            customStripLabel: {
              type: Type.STRING,
              description: "Artistic header caption in English or Indonesian for the printed strip header.",
            },
            customSubtitle: {
              type: Type.STRING,
              description: "Artistic subtitle/metadata string.",
            },
            stickersToInclude: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Short sticker text (e.g. 'OOTD', 'COOL', 'SENYUM', 'Y2K', 'AI')" },
                  colorStyle: { type: Type.STRING, description: "Theme color for badge (pink, blue, yellow, green, violet)" },
                  xPercent: { type: Type.NUMBER, description: "Approximate horizontal percentage offset (10 to 90)" },
                  yPercent: { type: Type.NUMBER, description: "Approximate vertical percentage offset (20 to 85)" },
                },
                required: ["text", "colorStyle", "xPercent", "yPercent"],
              },
              description: "Custom decorative stickers overlay.",
            }
          },
          required: ["analysis", "persona", "tips", "recommendedDials", "customStripLabel", "customSubtitle", "stickersToInclude"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gagal membaca respon dari AI.");
    }

    const parsedResult = JSON.parse(resultText.trim());
    return res.json(parsedResult);

  } catch (error: any) {
    console.error("Gemini API Error in backend:", error);
    return res.status(500).json({
      error: "AI Studio gagal memproses foto Anda.",
      details: error.message || error
    });
  }
});

// Setup Vite Dev Server / Static Asset Handler
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://localhost:${PORT}`);
  });
}

setupServer();
