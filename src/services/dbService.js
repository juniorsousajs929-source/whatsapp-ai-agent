const mongoose = require('mongoose');

// SCHEMAS
const UserHistorySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    history: { type: Array, default: [] }
});

const EchoGuardSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    lastResponse: { type: String, default: "" }
});

const BotMapSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    botId: { type: String, default: "default" }
});

// MODELS
const UserHistory = mongoose.model('UserHistory', UserHistorySchema);
const EchoGuard = mongoose.model('EchoGuard', EchoGuardSchema);
const BotMap = mongoose.model('BotMap', BotMapSchema);

// CONNECTION
let isConnected = false;

async function connectDB() {
    if (isConnected) return;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn("⚠️ MONGODB_URI not found. Please add it to your .env file or Render Environment Variables for persistent memory.");
        return false;
    }

    try {
        console.log("🟡 Tentando conectar ao MongoDB...");
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 2500, // Timeout curto (2.5s) para Fallback rápido
            socketTimeoutMS: 2500,
            connectTimeoutMS: 2500
        });
        isConnected = true;
        console.log("🟢 Conectado ao MongoDB (Memória Persistente Ativada)!");
        return true;
    } catch (error) {
        console.error("🔴 Erro de Timeout/Conexão ao MongoDB. Bot usando Memória Arquivo.", error.message);
        isConnected = false; // Força Fallback Seguro
        return false;
    }
}

// SERVICE FUNCTIONS

// 1. History
async function getHistory(userId) {
    if (!isConnected) return null;
    try {
        const doc = await UserHistory.findOne({ userId });
        return doc ? doc.history : [];
    } catch (e) {
        console.error("Error getting history:", e);
        return null;
    }
}

async function saveHistory(userId, historyArray) {
    if (!isConnected) return false;
    try {
        await UserHistory.findOneAndUpdate(
            { userId },
            { history: historyArray },
            { upsert: true, new: true }
        );
        return true;
    } catch (e) {
        console.error("Error saving history:", e);
        return false;
    }
}

// 2. Echo Guard
async function getEchoGuard(userId) {
    if (!isConnected) return null;
    try {
        const doc = await EchoGuard.findOne({ userId });
        return doc ? doc.lastResponse : "";
    } catch (e) { return null; }
}

async function saveEchoGuard(userId, lastResponse) {
    if (!isConnected) return false;
    try {
        await EchoGuard.findOneAndUpdate(
            { userId },
            { lastResponse },
            { upsert: true }
        );
        return true;
    } catch (e) { return false; }
}

// 3. Bot Map
async function getBotMap(userId) {
    if (!isConnected) return null;
    try {
        const doc = await BotMap.findOne({ userId });
        return doc ? doc.botId : null;
    } catch (e) { return null; }
}

async function saveBotMap(userId, botId) {
    if (!isConnected) return false;
    try {
        await BotMap.findOneAndUpdate(
            { userId },
            { botId },
            { upsert: true }
        );
        return true;
    } catch (e) { return false; }
}

module.exports = {
    connectDB,
    getHistory,
    saveHistory,
    getEchoGuard,
    saveEchoGuard,
    getBotMap,
    saveBotMap,
    status: () => isConnected
};
