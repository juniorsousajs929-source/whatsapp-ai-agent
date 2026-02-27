const axios = require('axios');
async function run() {
    try {
        console.log("Buscando Health Check...");
        const hl = await axios.get('https://whatsapp-ai-agent-97du.onrender.com/health?bust=' + Date.now(), { headers: { 'Cache-Control': 'no-cache' } });
        console.log(hl.data);

        console.log("Buscando Debug Logs...");
        const res = await axios.get('https://whatsapp-ai-agent-97du.onrender.com/debug-logs?bust=' + Date.now(), { headers: { 'Cache-Control': 'no-cache' } });
        console.log("--- LOGS DO RENDER ---");
        console.log(res.data);
    } catch (e) {
        if (e.response) {
            console.log("Error status:", e.response.status);
            console.log("Error data:", e.response.data);
        } else {
            console.log("CRITICAL ERROR:", e.message);
        }
    }
}
run();
