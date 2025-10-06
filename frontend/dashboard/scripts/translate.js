import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, "../src/locales");
const sourceLang = "en";
const targetLangs = ["hi", "te", "or", "bn"];


// LibreTranslate public instance (rate-limited). You can self-host later.
const API_URL = "https://libretranslate.de/translate";

// Helper: translate text
async function translateText(text, target) {
    try {
      const res = await axios.post(API_URL, {
        q: text,
        source: "en",
        target: target,
        format: "text"
      }, {
        headers: { "Content-Type": "application/json" }
      });
  
      if (Array.isArray(res.data) && res.data[0]?.translatedText) {
        return res.data[0].translatedText;
      }
  
      if (typeof res.data === "object" && res.data.translatedText) {
        return res.data.translatedText;
      }
  
      console.error(`Unexpected response for "${text}":`, res.data);
      return text;
    } catch (err) {
      console.error(`Error translating "${text}" to ${target}:`, err.message);
      return text; // fallback to English
    }
  }
  
// Main function
async function generateTranslations() {
    const sourceFile = path.join(localesDir, sourceLang, "translation.json");
    console.log("Source file:", sourceFile);
  
    if (!fs.existsSync(sourceFile)) {
      console.error("❌ Source file not found!");
      return;
    }
  
    const raw = fs.readFileSync(sourceFile, "utf-8");
    console.log("Raw source JSON:", raw);
  
    let sourceData;
    try {
      sourceData = JSON.parse(raw);
    } catch (e) {
      console.error("❌ Failed to parse JSON:", e.message);
      return;
    }
  
    for (const lang of targetLangs) {
      const targetDir = path.join(localesDir, lang);
      const targetFile = path.join(targetDir, "translation.json");
  
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  
      const translated = {};
      for (const key of Object.keys(sourceData)) {
        const value = sourceData[key];
        if (!value) {
          console.warn(`⚠️ Missing value for key "${key}" in source file`);
          continue;
        }
        translated[key] = await translateText(value, lang);
        console.log(`[${lang}] ${key}: ${translated[key]}`);
      }
  
      fs.writeFileSync(targetFile, JSON.stringify(translated, null, 2), "utf-8");
      console.log(`✅ Created: ${targetFile}`);
    }
  }
  

generateTranslations();
