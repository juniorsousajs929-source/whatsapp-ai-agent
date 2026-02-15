const axios = require('axios');
require('dotenv').config();

const MANYCHAT_API_BASE = 'https://api.manychat.com/fb';

// Helper: Select correct token based on Bot ID
function getToken(botId) {
    if (botId === 'zap2') return process.env.MANYCHAT_TOKEN_ZAP2;
    if (botId === 'zap3') return process.env.MANYCHAT_TOKEN_ZAP3;
    if (botId === 'zap4') return process.env.MANYCHAT_TOKEN_ZAP4;
    if (botId === 'zap5') return process.env.MANYCHAT_TOKEN_ZAP5;
    if (botId === 'zap6') return process.env.MANYCHAT_TOKEN_ZAP6;
    // Default to Zap 1 or Generic API Token
    return process.env.MANYCHAT_TOKEN_ZAP1 || process.env.MANYCHAT_API_TOKEN;
}

async function setCustomFieldByName(subscriberId, fieldName, value, botId = 'zap1') {
    const token = getToken(botId);

    if (!token) {
        console.error(`[ManyChat] No token found for Bot ID: ${botId}`);
        return;
    }

    try {
        // 1. Find the field ID by name
        const fieldsRes = await axios.get(`${MANYCHAT_API_BASE}/page/getCustomFields`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const field = fieldsRes.data.data.find(f => f.name === fieldName);

        if (!field) {
            console.error(`Custom Field '${fieldName}' not found for ${botId}. Please create it.`);
            return;
        }

        // 2. Set the value
        await axios.post(
            `${MANYCHAT_API_BASE}/subscriber/setCustomField`,
            {
                subscriber_id: subscriberId,
                field_id: field.id,
                field_value: value
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        console.log(`[ManyChat] Field '${fieldName}' set for User ${subscriberId} on ${botId}`);

    } catch (error) {
        console.error(`[ManyChat] Error on ${botId}:`, error.response ? error.response.data : error.message);
    }
}

async function sendContent(subscriberId, text, botId = 'zap1') {
    const token = getToken(botId);
    if (!token) return console.error(`[ManyChat] No token for ${botId}`);

    try {
        await axios.post(
            `${MANYCHAT_API_BASE}/sending/sendContent`,
            {
                subscriber_id: subscriberId,
                data: {
                    version: 'v2',
                    content: {
                        type: 'whatsapp',
                        messages: [{ type: 'text', text: text }]
                    }
                }
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log(`[ManyChat] Message sent to ${subscriberId} via ${botId}`);
    } catch (error) {
        console.error(`[ManyChat] Send Error on ${botId}:`, error.response ? error.response.data : error.message);
    }
}

async function addTagByName(subscriberId, tagName, botId = 'zap1') {
    const token = getToken(botId);
    if (!token) return console.error(`[ManyChat] No token for ${botId}`);

    try {
        // 1. Get all tags to find the ID
        const tagsRes = await axios.get(`${MANYCHAT_API_BASE}/page/getTags`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const tag = tagsRes.data.data.find(t => t.name === tagName);

        if (!tag) {
            console.error(`Tag '${tagName}' not found for ${botId}. Please create it.`);
            return;
        }

        // 2. Add the tag to the user
        await axios.post(
            `${MANYCHAT_API_BASE}/subscriber/addTag`,
            {
                subscriber_id: subscriberId,
                tag_id: tag.id
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log(`[ManyChat] Tag '${tagName}' added to User ${subscriberId} on ${botId}`);

    } catch (error) {
        console.error(`[ManyChat] Tag Error on ${botId}:`, error.response ? error.response.data : error.message);
    }
}

module.exports = { setCustomFieldByName, sendContent, addTagByName };
