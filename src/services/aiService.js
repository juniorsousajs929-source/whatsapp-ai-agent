const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const keyManager = require('./keyManager'); // Import Key Rotator
const { setCustomFieldByName, addTagByName } = require('./manychatService'); // For saving name and tagging
const dbService = require('./dbService'); // MongoDB Integration
require('dotenv').config();

// PERSISTENT HISTORY STORAGE (File-Based - FALLBACK ONLY)
const HISTORY_FILE = 'data/user_history.json';
let userHistory = {};

// Load history from disk on startup (Fallback)
if (fs.existsSync(HISTORY_FILE)) {
  try {
    userHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    console.log("💾 Local History loaded from disk (Fallback).");
  } catch (e) {
    console.error("⚠️ Failed to load local history:", e.message);
    userHistory = {};
  }
} else {
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
  let lastError = null;
  const poolSize = keyManager.getPoolSize();
  const sessionKey = `${botId}:${userId}`;

  // Attempt to use up to the entire pool of keys if one fails
  for (let attempt = 0; attempt < Math.max(1, poolSize); attempt++) {
    try {
      const apiKey = keyManager.getNextKey();
      if (!apiKey) throw new Error("No API Keys available in environment");

      const genAI = new GoogleGenerativeAI(apiKey);

      const styles = [
        "Sé extremadamente empática, como si fueras su mejor amiga escuchando un secreto.",
        "Muestra mucha compasión, usa palabras suaves y reconfortantes.",
        "Valida sus sentimientos totalmente ('Te entiendo muchísimo', 'Sé lo duro que es').",
        "Sé directa y con autoridad médica (pero amable). Transmite mucha seguridad.",
        "Usa un tono de 'Coach' motivadora. ¡Energía alta!",
        "Explica como si fueras una profesora enseñando algo fascinante.",
        "Habla súper relajada, como si estuvieras enviando un audio rápido.",
        "Usa jerga muy natural y coloquial ('Mira', 'Oye', 'Total').",
        "Sé divertida y ligera, usa una risa escrita ('jajaja' o 'jeje').",
        "Sé misteriosa y genera curiosidad ('¿Sabes lo que pasa?...').",
        "Reconoce explícitamente algo que ella acaba de decir antes de seguir con el script.",
        "No uses saludos si ya se saludaron antes. Ve directo al grano con confianza.",
        "Usa una exclamación de sorpresa o acuerdo ('¡Wow!', '¡Qué bien!', '¡Entiendo perfectamente!').",
        "Cambia el orden de los párrafos para que no parezca un mensaje predefinido.",
        "Escribe de forma que parezca que estás reflexionando sobre su caso específico.",
        "Si ya sabes su nombre, úsalo de forma cariñosa en la mitad de la frase.",
        "Responde con una PREGUNTA directa para hacerla pensar.",
        "Usa una METÁFORA o comparación simple para explicar.",
        "Sé extremadamente BREVE. Máximo 15 palabras.",
        "Usa una lista numerada rápida (1. tal, 2. cual).",
        "NO uses ninguna lista. Solo texto fluido y conectado.",
        "Empieza la frase con 'Y te digo más...'",
        "Empieza la frase con el nombre de ella (si lo sabes).",
        "Empieza con '¡Exacto!' o '¡Totalmente!' para mostrar acuerdo fuerte.",
        "Escribe todo en minúsculas (estilo chat rápido).",
        "Usa abreviaturas sutiles ('q', 'xq', 'tmb').",
        "Omite signos de interrogación de apertura (¿).",
        "Comete un 'typo' intencional y corrígelo en la misma línea (ej: 'dieta... digo, protocolo').",
        "Repite una palabra para énfasis ('Si, si, examente')."
      ];

      const formats = [
        "NO USES EMOJIS hoy.",
        "Escribe en 2 párrafos cortos.",
        "Escribe todo en una sola línea.",
        "Usa puntos suspensivos... para dar pausa.",
        "Sé extremadamente formal y limpia.",
        "Usa letras mayúsculas para enfatizar palabras clave (ej: IMPORTANTE)."
      ];

      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      const randomFormat = formats[Math.floor(Math.random() * formats.length)];

      const dynamicPrompt = systemInstruction + `\n\n=== 🎭 MODO ATRIZ (VARIACIÓN OBLIGATORIA) ===\nNO SEAS ROBÓTICA. ACTÚA CON ESTE ESTILO AHORA:\n👉 ESTILO: ${randomStyle}\n👉 FORMATO: ${randomFormat}\n\n(Ignora este estilo SOLAMENTE si pone en riesgo la venta, pero intenta adaptarlo).\n\n=== REGLAS DE ORO (CRÍTICO) ===\n1. Sigue el "GUIÓN ESTRATÉGICO DE VENTA" paso a paso de forma LITERAL.\n2. NO CORTES LOS MENSAJES A LA MITAD. Asegúrate de terminar la frase.\n3. OBLIGATORIO: TODO mensaje debe terminar con una PREGUNTA o "GANCHO" para que la cliente responda, EXCEPTO cuando aplique la regla de AGENDAMIENTO Y SILENCIO (en ese caso, acepta la decisión y CIERRA la conversación sin preguntas ni ganchos).`;

      // --- SPECIAL COMMAND: GENERATE DISCOUNT OFFER ---
      if (userMessage === "GENERATE_DISCOUNT_OFFER_NOW") {
        return `Tengo una sorpresa para ti [Nombre] 🎁\n\nHola, soy la Dra. Adriele de nuevo! 👋\n\nVi que intentaste unirte a nuestro Grupo VIP de Alumnas hace un momento, pero tu inscripción no se completó. 🥺\n\nEnviamos este cupón para ayudarte:\n\n🎟️ ACCESO VIP CON DESCUENTO\nDe ~~$34,97~~ por **$27,00 USD**\n\nhttps://go.hotmart.com/O103265408E`;
      }

      let processedMessage = userMessage;
      if (!userMessage || userMessage.trim() === "" || userMessage.startsWith("http")) {
        processedMessage = "[AUDIO_OR_IMAGE_RECEIVED]";
      }

      // DEBUG: List models if first attempt fail
      if (attempt === 0 && !global.modelsLogged) {
        // This is just for logging/debugging purposes to see what we have access to
        // We don't await this to avoid blocking the main flow too much, but it's useful context
        // implementation depends on library support. simpler to just try specific models.
      }

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // Updated to cutting edge version for modern Google Accounts 2026
        systemInstruction: dynamicPrompt,
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 800,
        }
      });

      // --- LOAD HISTORY MONGODB OR LOCAL ---
      let currentSessionHistory = [];
      if (dbService.status()) {
        const dbHist = await dbService.getHistory(sessionKey);
        if (dbHist && dbHist.length > 0) {
          currentSessionHistory = dbHist;
        }
      } else {
        // Fallback Local
        if (!userHistory[sessionKey]) userHistory[sessionKey] = [];
        currentSessionHistory = userHistory[sessionKey];
      }

      let text;
      let chat;
      try {
        console.log(`💬 Enviando chat com histórico tamanho: ${currentSessionHistory.length}`);
        chat = model.startChat({ history: currentSessionHistory });
        const result = await chat.sendMessage(processedMessage);
        text = result.response.text();
        console.log(`✅ IA Respondeu: ${text.substring(0, 50)}...`);
      } catch (geminiError) {
        console.error("🔴 EXPLOSÃO CRÍTICA NO GEMINI API:", geminiError.message, geminiError.stack);
        throw new Error("Falha no LLM: " + geminiError.message);
      }

      // --- NAME EXTRACTION ---
      const nameMatch = text.match(/Encantada de conocerte, ([A-Za-zÁ-Úá-ú]+)/i) ||
        text.match(/Hola ([A-Za-zÁ-Úá-ú]+),/i);
      if (nameMatch && nameMatch[1]) {
        setCustomFieldByName(userId, "user_name", nameMatch[1], botId).catch(() => { });
      }

      // --- AUTO-TAGGING & COMMANDS ---
      if (text.includes("PAGO ÚNICO") || text.includes("hotmart.com") || text.includes("ACCESO VIP CON DESCUENTO")) {
        addTagByName(userId, "Chegou ate o final", botId).catch(() => { });
      }



      // --- SAVE HISTORY MONGODB OR LOCAL ---
      const finalHistory = await chat.getHistory();
      if (dbService.status()) {
        await dbService.saveHistory(sessionKey, finalHistory);
      } else {
        userHistory[sessionKey] = finalHistory;
        saveHistory();
      }

      text = text
        .replace(/\*/g, '')
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/\u200D/g, '')
        .trim();

      // Anti-Echo
      if (text.toLowerCase().trim() === userMessage.toLowerCase().trim()) {
        return "Entiendo perfectamente. Y cuéntame: ¿cuál es tu mayor dificultad hoy para perder peso?";
      }

      return text;

    } catch (error) {
      lastError = error;
      console.error(`⚠️ Key failed (Attempt ${attempt + 1}/${poolSize}): ${error.message}`);
      if (error.message.includes("Safety") || error.message.includes("blocked")) break;
    }
  }

  // Handle errors after all attempts
  const finalError = lastError || new Error("Unknown error");
  if (finalError.message.includes("429")) return "(Error: Límite excedido) Espera 1 minuto.";
  if (finalError.message.includes("API Key not found") || finalError.message.includes("invalid")) {
    return "(Error: Llave de IA inválida) Por favor verifica tus chaves en el Render.";
  }
  // Se for outro erro (ex: 404 Model Not Found), propaga a exceção para o console
  throw new Error(`AI_GEN_FAILED: ${finalError.message}`);
}

module.exports = { generateResponse };
