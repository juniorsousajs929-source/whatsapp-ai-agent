const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function runDeepSimulation() {
    console.log("🚀 STARTING DEEP MASTER SIMULATION\n");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            temperature: 0.8
        }
    });

    const history = [];
    const chat = model.startChat({ history });

    const tests = [
        {
            desc: "1. Complex Initial Info (Name, Country, Weight & Goal)",
            msg: "Hola soy Margarita de Mexico y no tengo mucho tiempo. Actualmente peso 85 kilos y quiero bajar 15.",
            checks: {
                hasName: true,
                hasWelcome: false, // Should NOT send welcome
                hasPlaceholder: false
            }
        },
        {
            desc: "2. Difficulty and Transition to Pitch",
            msg: "me cuesta mucho dejar la comida chatarra la verdad, no me gusta hacer ejercicio",
            checks: {
                hasName: true
            }
        },
        {
            desc: "3. Requesting the Details (Pitch)",
            msg: "esta bien, contame de que trata",
            checks: {
                hasName: true,
                hasPitch: true
            }
        },
        {
            desc: "4. Direct Price Request",
            msg: "me re interesa eso, pame los bonos y el precio FINAL porfa",
            checks: {
                hasName: true,
                hasLocalPrice: true,
                hasUSD: false
            }
        },
        {
            desc: "5. Post-Purchase Support Trigger",
            msg: "oye, acabo de pagar en el oxxo. tengo mi recibo listo, como puedo entrar a las recetas?",
            checks: {
                hasName: true,
                hasEmailInstructions: true
            }
        }
    ];

    let allPassed = true;

    for (let i = 0; i < tests.length; i++) {
        const step = tests[i];
        console.log(`\n============================`);
        console.log(`🔷 STEP ${i + 1}: ${step.desc}`);
        console.log(`👤 USER: "${step.msg}"`);
        console.log(`============================`);

        try {
            const result = await chat.sendMessage(step.msg);
            const text = result.response.text();
            console.log(`\n🤖 AI RESPONSE:\n${text}\n`);

            // Verifications
            console.log(`-- Checks --`);
            if (step.checks.hasName) {
                const namePass = text.includes("Margarita") || text.includes("margarita");
                console.log(namePass ? "✅ Uses Name" : "❌ FAILS to use Name");
                if (!namePass) allPassed = false;
            }
            if (step.checks.hasWelcome !== undefined) {
                const welcomeFail = text.includes("¿Cómo te llamas y desde qué país nos escribes?");
                const passed = step.checks.hasWelcome === welcomeFail;
                console.log(passed ? "✅ Correct Welcome Logic" : "❌ FAILS Welcome Logic (Amnesia bug)");
                if (!passed) allPassed = false;
            }
            if (step.checks.hasPlaceholder !== undefined) {
                const placePass = !text.includes("[Nombre]");
                console.log(placePass ? "✅ No Literal Placeholders" : "❌ FAILS: Leaked [Nombre]");
                if (!placePass) allPassed = false;
            }
            if (step.checks.hasLocalPrice) {
                const pricePass = text.includes("MXN") || text.includes("Pesos");
                console.log(pricePass ? "✅ Correct Local Currency (MXN)" : "❌ FAILS to use Local Currency");
                if (!pricePass) allPassed = false;
            }
            if (step.checks.hasUSD !== undefined) {
                const usdPass = !text.includes("USD") && !text.includes("dólares") && !text.includes("$34.97");
                console.log(usdPass ? "✅ Zero USD Leakage" : "❌ FAILS: Leaked USD to Mexico");
                if (!usdPass) allPassed = false;
            }
            if (step.checks.hasEmailInstructions !== undefined) {
                const emailPass = text.includes("CORREO") || text.includes("correo") || text.includes("SPAM") || text.includes("Hotmart Club");
                console.log(emailPass ? "✅ Correct Hotmart Instructions" : "❌ FAILS Hotmart flow");
                if (!emailPass) allPassed = false;
            }

            // Wait 2 sec to avoid API rate limits
            await new Promise(r => setTimeout(r, 2000));

        } catch (error) {
            console.error(`❌ CRITICAL API ERROR:`, error.message);
            allPassed = false;
        }
    }

    console.log(`\n============================`);
    console.log(allPassed ? `🏆 GLOBAL STATUS: ALL TESTS PASSED SUCCESSFULLY!` : `⚠️ GLOBAL STATUS: SOME TESTS FAILED!`);
    console.log(`============================\n`);
}

runDeepSimulation();
