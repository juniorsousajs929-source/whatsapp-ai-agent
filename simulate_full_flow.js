const axios = require('axios');

// Simulation of what ManyChat sends when configured CORRECTLY
// (Input -> input_cliente, Output -> teste_robo)

const LOCAL_URL = "http://localhost:3000/webhook?bot_id=zap2";
const USER_ID = "tester_simulated_flow";

async function simulateFlow() {
    console.log("🚀 SIMULATING CORRECT MANYCHAT FLOW...");

    // Step 1: User says "Hola"
    console.log("\n1️⃣ User says 'Hola' (Stored in input_cliente)...");
    try {
        const res1 = await axios.post(LOCAL_URL, {
            user_id: USER_ID,
            message: "Hola" // This is what input_cliente sends
        });
        console.log(`✅ AI Response 1: "${res1.data.ai_reply.substring(0, 50)}..."`);

        // Imagine ManyChat setting 'teste_robo' = AI Response
        const aiResponse = res1.data.ai_reply;

        // Step 2: User says nothing (ManyChat SHOULD NOT send the AI response back)
        // But if ManyChat WAS broken, it would send 'aiResponse' as 'message'.
        // Let's simulate that BROKEN behavior to see if Server catches it (Anti-Echo).

        console.log(`\n2️⃣ Simulating BROKEN FLOW (ManyChat sends back AI Response as Input)...`);
        const res2 = await axios.post(LOCAL_URL, {
            user_id: USER_ID,
            message: aiResponse // The Echo
        });

        if (res2.data.status === 'ignored_echo') {
            console.log("🛡️ SERVER PROTECTION ACTIVE: Echo was BLOCKED.");
        } else {
            console.error("❌ DANGER: Server replied to the Echo! (Loop Risk)");
            console.log("Response:", res2.data);
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    }
}

simulateFlow();
