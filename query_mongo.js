require('dotenv').config();
const mongoose = require('mongoose');
const { getEchoGuard, getHistory, getBotMap, connectDB } = require('./src/services/dbService');

async function check() {
    await connectDB();
    const bot = await getBotMap('gloria_amnesia_test_100');
    console.log("Bot Map:", bot);

    // session key is bot:userId
    const history = await getHistory(`${bot}:gloria_amnesia_test_100`);
    console.log(`\nHistory for ${bot}:gloria_amnesia_test_100`);
    console.log(JSON.stringify(history, null, 2));

    const echo = await getEchoGuard('gloria_amnesia_test_100');
    console.log("\nLast Response:", echo);

    process.exit(0);
}
check();
