const axios = require('axios');
const token = '3610204:6f8bcd73cd2f6d836b962d7e3608d071';

async function check() {
    try {
        console.log("Conectando ao ManyChat API...");
        const res = await axios.get('https://api.manychat.com/fb/page/getCustomFields', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const fields = res.data.data;
        const target = fields.find(f => f.name === 'teste_robo');
        if (target) {
            console.log("✅ SUCESSO: Custom Field 'teste_robo' ENCONTRADO! ID:", target.id);
        } else {
            console.log("❌ ERRO: Custom Field 'teste_robo' NÃO ENCONTRADO na sua conta do ManyChat.");
            console.log("Campos encontrados na sua conta:", fields.map(f => f.name).join(', '));
        }
    } catch (e) {
        console.error("❌ ERRO DA API MANYCHAT:", e.response && e.response.data ? e.response.data : e.message);
    }
}
check();
