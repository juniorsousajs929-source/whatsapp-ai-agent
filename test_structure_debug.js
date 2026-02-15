const axios = require('axios');

const BASE_URL = 'http://localhost:3000/webhook';
const USER_ID = 'debug_user_123';

async function testStructure() {
    console.log("--- Starting Structure Test ---");
    try {
        const payload = {
            user_id: USER_ID,
            message: "Hola" // Trigger intro
        };
        console.log(`Sending: ${JSON.stringify(payload)}`);

        const res = await axios.post(BASE_URL, payload);

        console.log("\nServer Response Status:", res.status);
        console.log("Server Response Body:", JSON.stringify(res.data, null, 2));

        if (res.data && res.data.ai_reply) {
            console.log("\n✅ AI Reply Received:", res.data.ai_reply);
        } else {
            console.log("\n❌ No AI Reply in response body.");
        }

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        if (error.response) {
            console.error("Response Status:", error.response.status);
            console.error("Response Body:", JSON.stringify(error.response.data, null, 2));
        }
    }
    console.log("--- End Test ---");
}

testStructure();
