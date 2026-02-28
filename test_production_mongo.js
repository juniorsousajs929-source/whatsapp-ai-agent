const axios = require('axios');

async function checkProduction() {
    const renderUrl = "https://manychat-ai-agent.onrender.com";
    console.log(`Pinging Render: ${renderUrl}/health`);

    try {
        const health = await axios.get(`${renderUrl}/health`);
        console.log(`Server status: ${health.data}`);

        console.log("\nSimulating webhook call (1st Message with Zap4)...");
        await axios.post(`${renderUrl}/webhook?bot_id=zap4`, {
            user_id: "test_mongo_user_1",
            message: "Hola, me gustaría saber mas del reto D22"
        });

        console.log("Waiting 8 seconds for AI to process...");
        await new Promise(r => setTimeout(r, 8000));

        console.log("\nSimulating webhook call (2nd Message without bot_id - mimicking input_cliente trigger)...");
        await axios.post(`${renderUrl}/webhook`, {
            user_id: "test_mongo_user_1",
            message: "Luz marina Colombia"
        });

        console.log("Check complete. If no repetition loop happens in your ManyChat or logs, the DB Mapping is a success!");

    } catch (e) {
        console.error("Test failed:", e.response ? e.response.data : e.message);
    }
}

checkProduction();
