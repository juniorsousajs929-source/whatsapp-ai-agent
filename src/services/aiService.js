const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const keyManager = require('./keyManager'); // Import Key Rotator
const { setCustomFieldByName, addTagByName } = require('./manychatService'); // For saving name and tagging
require('dotenv').config();

// PERSISTENT HISTORY STORAGE (File-Based)
const HISTORY_FILE = 'data/user_history.json';
let userHistory = {};

// Load history from disk on startup
if (fs.existsSync(HISTORY_FILE)) {
  try {
    userHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    console.log("💾 History loaded from disk.");
  } catch (e) {
    console.error("⚠️ Failed to load history:", e.message);
    userHistory = {};
  }
} else {
  // Ensure directory exists
  if (!fs.existsSync('data')) fs.mkdirSync('data');
  fs.writeFileSync(HISTORY_FILE, JSON.stringify({}));
}

function saveHistory() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(userHistory, null, 2));
  } catch (e) {
    console.error("⚠️ Failed to save history:", e.message);
  }
}

async function generateResponse(userId, userMessage, systemInstruction, botId = 'default') {
  try {
    // 1. Get a fresh API Key (Rotation)
    const apiKey = keyManager.getNextKey();
    if (!apiKey) throw new Error("No API Keys available in .env");

    // Initialize Gemini with this specific key
    const genAI = new GoogleGenerativeAI(apiKey);

    // META-INSTRUCTION: Forces the model to adopt the script strictly but fluently
    const dynamicPrompt = systemInstruction + `\n\n=== REGLAS DE ORO (CRÍTICO) ===\n1. Sigue el "GUIÓN ESTRATÉGICO DE VENTA" paso a paso de forma LITERAL.\n2. NO CORTES LOS MENSAJES A LA MITAD. Asegúrate de terminar la frase.\n3. OBLIGATORIO: TODO mensaje debe terminar con una PREGUNTA o "GANCHO" para que la cliente responda (ej: "¿Te parece bien?", "¿Cuántos kilos pesas?"). NUNCA termines una interacción en silencio.`;

    // HANDLE AUDIO/IMAGE INPUTS (AND GHOST TEXT)
    // ManyChat sends URLs for attachments. If message is a URL or empty, treat as non-text.
    // ALSO: If message is IDENTICAL to the last user message, it's likely "Ghost Text" (Audio sent, but ManyChat sent old text).
    // Create unique session key for Multi-Tenant History Isolation
    const sessionKey = `${botId}:${userId}`;

    let isStale = false;
    if (userHistory[sessionKey] && userHistory[sessionKey].length > 0) {
      const lastUserTurn = userHistory[sessionKey].slice().reverse().find(m => m.role === 'user');
      if (lastUserTurn && lastUserTurn.parts[0].text === userMessage) {
        isStale = true;
      }
    }



    // --- SPECIAL COMMAND: GENERATE DISCOUNT OFFER ---
    if (userMessage === "GENERATE_DISCOUNT_OFFER_NOW") {
      console.log("🎟️ Generating Remarketing Script for", userId);
      return `Tengo una sorpresa para ti [Nombre] 🎁

Hola, soy la Dra. Adriele de nuevo! 👋

Vi que intentaste unirte a nuestro Grupo VIP de Alumnas hace un momento, pero tu inscripción no se completó. 🥺

Hablé con mi equipo sobre tu caso y... ¡conseguimos algo que te va a encantar! ✨

Autorizaron un descuento exclusivo para ti (solo por hoy):

🎟️ ACCESO VIP CON DESCUENTO
De ~~$34,97~~ por **$27,00 USD**

Y mantienes tooodos los beneficios y la Garantía de 7 Días 🛡️ (si no te gusta, te devolvemos el dinero, sin riesgo).

⚠️ Ojo: Este enlace es único y expirará pronto.

Toque aquí para aprovechar:
👇👇👇
https://go.hotmart.com/O103265408E?ap=baae

(El precio se ajusta a tu moneda local automáticamente).

¿Te veo dentro? 💖`;
    }

    if (!userMessage || userMessage.trim() === "" || userMessage.startsWith("http") || isStale) {
      userMessage = "[AUDIO_OR_IMAGE_RECEIVED]";
    }

    // TRYING EXPLICIT MODEL: gemini-flash-latest
    // Previous alias 'gemini-pro-latest' returned empty.
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: dynamicPrompt,
      generationConfig: {
        temperature: 0.5, // Natural flow without heavy hallucinations
        topP: 0.95,
        topK: 30,
        maxOutputTokens: 1200, // Safe margin to prevent text cutoff
      }
    });

    // Initialize history for user if not exists
    if (!userHistory[sessionKey]) {
      userHistory[sessionKey] = [];
    }

    // Start chat with existing history
    const chat = model.startChat({
      history: userHistory[sessionKey]
    });

    const result = await chat.sendMessage(userMessage);
    let text = result.response.text();
    console.log(`[AI RAW OUTPUT]: ${text.substring(0, 50)}...`);

    // --- NAME EXTRACTION LOGIC (Capture & Save) ---
    // Pattern: "Encantada de conocerte, [Name]" or similar variations
    const nameMatch = text.match(/Encantada de conocerte, ([A-Za-zÁ-Úá-ú]+)/i) ||
      text.match(/Hola ([A-Za-zÁ-Úá-ú]+),/i);

    if (nameMatch && nameMatch[1]) {
      const extractedName = nameMatch[1];
      console.log(`👤 Name Detected: ${extractedName}. Saving to ManyChat...`);
      // Saving to Custom Field 'user_name'
      // We use setCustomFieldByName asynchronously but don't await to avoid blocking response
      setCustomFieldByName(userId, "user_name", extractedName, botId).catch(err =>
        console.error("❌ Failed to save user_name:", err)
      );
    }

    // --- AUTO-TAGGING LOGIC (Closing Reached) ---
    // Detect if the AI sent the price/offer (Step 8/9)
    // Keywords: "PAGO ÚNICO", "34,97 USD", "hotmart.com"
    if (text.includes("PAGO ÚNICO") || text.includes("hotmart.com") || text.includes("ACCESO VIP CON DESCUENTO")) {
      console.log(`🎯 Closing Detected for ${userId}. Adding tag 'Chegou ate o final'...`);
      addTagByName(userId, "Chegou ate o final", botId).catch(err =>
        console.error("❌ Failed to add Closing Tag:", err)
      );
    }

    // Update our memory AND SAVE TO DISK
    userHistory[sessionKey] = await chat.getHistory();
    saveHistory(); // PERSISTENCE CHECKPOINT

    // CLEANUP: Remove stars/asterisks to prevent broken links or bold text
    text = text.replace(/\*/g, '');

    // CLEANUP: EMOJI STRIPPER (Zero Tolerance) 🚫😊
    text = text.replace(/\p{Extended_Pictographic}/gu, '');
    text = text.replace(/\u200D/g, ''); // Remove Zero Width Joiner
    text = text.trim();

    // ANTI-ECHO 2.0: Deep Check (Redundant Safety)
    // 1. Check if AI repeated the user input (Hallucination)
    const cleanResponse = text.trim().toLowerCase();
    const cleanInput = userMessage.trim().toLowerCase();

    // If response is almost identical to input (loop risk)
    if (cleanResponse === cleanInput || (cleanResponse.includes(cleanInput) && cleanResponse.length < cleanInput.length + 10)) {
      console.error("⚠️ ANTI-ECHO TRIGGERED (Internal): AI repeated user input. Intercepting.");
      // Fallback en ESPAÑOL (Corrigiendo error de idioma)
      return "Entiendo perfectamente. Y cuéntame: ¿cuál es tu mayor dificultad hoy para perder peso? ¿La falta de saciedad o el metabolismo?";
    }

    return text; // Humanized response

  } catch (error) {
    // Log detailed error to console and file
    const errorMsg = `[${new Date().toISOString()}] Error: ${error.message}\n`;
    console.error(errorMsg);
    fs.appendFileSync('error.log', errorMsg);

    // Check specific error types
    if (error.message.includes("429")) {
      return "(Error: Límite excedido) Espera 1 minuto e intenta de nuevo.";
    }
    if (error.message.includes("404") || error.message.includes("not found")) {
      return `(Error: Modelo no encontrado: ${error.message})`;
    }

    return "Disculpa, tengo un pequeño problema de señal técnica. ¿Me podrías escribir de nuevo en 2 minutos?";
  }
}

module.exports = { generateResponse };
