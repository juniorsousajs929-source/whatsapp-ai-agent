const WHATSAPP_LINKS = [
    "https://wa.me/message/BJNHQE5KTTITE1", // Link 1 (Zap 1)
    "https://wa.me/message/4WCL3T3HBGMOP1", // Link 3 (Zap 3)
];

const counts = {};
const TOTAL_CLICKS = 100;

console.log(`🤖 DISPARANDO ${TOTAL_CLICKS} CLIQUES SIMULADOS AGORA...`);

for (let i = 0; i < TOTAL_CLICKS; i++) {
    const randomLink = WHATSAPP_LINKS[Math.floor(Math.random() * WHATSAPP_LINKS.length)];
    counts[randomLink] = (counts[randomLink] || 0) + 1;
}

console.log("\n🧪 RESULTADO DO TESTE DE CARGA (Hydra Rotator):");
console.log("------------------------------------------------");
console.log(`✅ Link 1 (BJNH...): ${counts[WHATSAPP_LINKS[0]]} cliques (${(counts[WHATSAPP_LINKS[0]] / TOTAL_CLICKS) * 100}%)`);
console.log(`✅ Link 2 (4WCL...): ${counts[WHATSAPP_LINKS[1]]} cliques (${(counts[WHATSAPP_LINKS[1]] / TOTAL_CLICKS) * 100}%)`);
console.log("------------------------------------------------");

if (Math.abs(counts[WHATSAPP_LINKS[0]] - counts[WHATSAPP_LINKS[1]]) < 15) {
    console.log("🔥 STATUS: ROTATOR FUNCIONANDO! (Distribuição Equilibrada)");
} else {
    console.log("⚠️ STATUS: DESEQUILÍBRIO DETECTADO (Verificar Math.random)");
}
