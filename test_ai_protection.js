
const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function runTest() {
    console.log("=== TESTE DA SEQUÊNCIA CAMPEÃ (FUSÃO CÓPIA + INTELIGÊNCIA) ===\n");

    const userId = 'final_script_test_' + Date.now();

    // Sequence of messages to simulate the strict high-converting flow
    const conversation = [
        "Hola!",                                         // 1. Greeting -> Asking Name/Country
        "Maria de Chile",                                // 2. Name/Country -> Request to Save Contact
        "Listo, ya te guardé!",                          // 3. User saved contact -> Asking Weight/Goal
        "Peso 85kg y deseo llegar a 65kg.",              // 4. Weight -> Asking Difficulties
        "Mi metabolismo es lento y no tengo tiempo.",    // 5. Difficulty -> MANDATORY TRANSITION (Mira Maria...)
        "Dime, quiero ver el método.",                   // 6. User agrees -> DENSE INFO EXPLANATION + Satisfaction Check
        "Sí, me gustó mucho, es genial.",                // 7. User reacts -> OFFER + PRICE REVEAL
        "¿Cómo hago el registro?"                        // 8. Closing -> HOTMART LINK REVEAL
    ];

    for (const input of conversation) {
        console.log(`👤 USER: ${input}`);
        try {
            const response = await generateResponse(userId, input, SYSTEM_INSTRUCTION);
            console.log(`🤖 AI: ${response}\n`);
            console.log("-".repeat(50) + "\n");
        } catch (error) {
            console.error("Erro no teste:", error);
        }
        await new Promise(resolve => setTimeout(resolve, 3000)); // Delay for readability
    }
}

runTest();
