const https = require('https');

async function getRates() {
    // using a public free exchange API
    const url = 'https://open.er-api.com/v6/latest/USD';

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const rates = JSON.parse(data).rates;
            const target = 35.00;

            console.log(`\n--- PRECIOS ACTUALIZADOS ($${target} USD BASE) ---\n`);

            const currencies = {
                'Argentina (ARS)': rates.ARS,
                'Venezuela/Ecuador/Costa Rica/USA (USD)': 1,
                'España/Italia (EUR)': rates.EUR,
                'Chile (CLP)': rates.CLP,
                'Colombia (COP)': rates.COP,
                'Perú (PEN)': rates.PEN,
                'México (MXN)': rates.MXN,
                'Panamá (PAB / USD)': 1,
                'Uruguay (UYU)': rates.UYU,
                'Paraguay (PYG)': rates.PYG,
                'Rep. Dominicana (DOP)': rates.DOP,
                'Guatemala (GTQ)': rates.GTQ,
                'Costa Rica - Colones (CRC)': rates.CRC
            };

            for (const [country, rate] of Object.entries(currencies)) {
                if (rate) {
                    const localPrice = (target * rate);
                    let formatted = '';

                    // Format based on currency
                    if (country.includes('COP') || country.includes('PYG') || country.includes('CLP') || country.includes('ARS')) {
                        formatted = Math.round(localPrice).toLocaleString('es-ES'); // No decimals for big numbers
                    } else if (country.includes('EUR')) {
                        formatted = localPrice.toFixed(2).replace('.', ',') + ' €';
                    } else {
                        formatted = localPrice.toFixed(2);
                    }

                    console.log(`* ${country}: ${formatted}`);
                } else {
                    console.log(`* ${country}: RATE NOT FOUND`);
                }
            }
        });
    }).on('error', err => {
        console.error("Error fetching rates:", err.message);
    });
}

getRates();
