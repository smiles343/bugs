document.getElementById('attackForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const target = document.getElementById('target').value.trim();
    const intensity = document.getElementById('intensity').value;
    const useProxy = document.getElementById('useProxy').checked;
    const btn = document.getElementById('attackBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    const terminalOutput = document.getElementById('terminalOutput');
    const outputContent = document.getElementById('outputContent');
    const resultPanel = document.getElementById('resultData');
    const resultBody = document.getElementById('resultBody');

    if (!target) {
        alert('⚠️ TARGET NUMBER REQUIRED');
        return;
    }

    // ========== UI: ATTACK START ==========
    btn.disabled = true;
    btnText.textContent = '💀 EXECUTING...';
    btnLoader.classList.remove('hidden');
    terminalOutput.classList.remove('hidden');
    resultPanel.classList.add('hidden');
    outputContent.innerHTML = '';

    // ========== SIMULATE TERMINAL OUTPUT ==========
    const terminalLines = [
        '[💀] INITIALIZING EXPLOIT ENGINE...',
        '[💀] TARGET ACQUIRED: ' + target,
        '[💀] INTENSITY: ' + intensity.toUpperCase(),
        '[💀] PROXY: ' + (useProxy ? 'ENABLED' : 'DISABLED'),
        '[💀] ESTABLISHING CONNECTION...',
        '[💀] CONNECTION ESTABLISHED',
        '[💀] DEPLOYING PAYLOADS...'
    ];

    for (const line of terminalLines) {
        outputContent.innerHTML += `<div>> ${line}</div>`;
        await sleep(300);
        outputContent.scrollTop = outputContent.scrollHeight;
    }

    // ========== SEND REQUEST ==========
    try {
        const response = await fetch('/api/attack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target, intensity, useProxy })
        });

        const data = await response.json();

        if (data.success) {
            outputContent.innerHTML += `<div style="color:#ff0040">>> 💀 EXPLOIT SUCCESSFUL</div>`;
            outputContent.innerHTML += `<div>> MESSAGES SENT: ${data.data.messagesSent}</div>`;
            outputContent.innerHTML += `<div>> EXPLOIT ID: ${data.data.exploitId}</div>`;
            outputContent.innerHTML += `<div>> STATUS: TARGET NEUTRALIZED</div>`;
            outputContent.innerHTML += `<div class="typing-cursor"></div>`;

            resultPanel.classList.remove('hidden');
            resultBody.innerHTML = `
                <div>📱 TARGET: <span class="highlight">${data.data.phoneNumber}</span></div>
                <div>🆔 JID: ${data.data.formattedJid}</div>
                <div>💬 PAYLOADS: <span class="highlight">${data.data.messagesSent}</span></div>
                <div>⚡ INTENSITY: ${data.data.intensity.toUpperCase()}</div>
                <div>🆔 EXPLOIT ID: ${data.data.exploitId}</div>
                <div>🕐 TIMESTAMP: ${new Date(data.timestamp).toLocaleString()}</div>
                <div style="margin-top:10px;color:#ff0040;font-size:1.2rem;text-align:center">
                    💀 TARGET DESTROYED 💀
                </div>
            `;

            btnText.textContent = '💀 EXPLOIT COMPLETE';

        } else {
            outputContent.innerHTML += `<div style="color:#ff0040">>> ❌ ${data.error}</div>`;
            btnText.textContent = '❌ EXPLOIT FAILED';
        }

    } catch (error) {
        outputContent.innerHTML += `<div style="color:#ff0040">>> ❌ CONNECTION ERROR: ${error.message}</div>`;
        btnText.textContent = '❌ CONNECTION LOST';
    }

    // ========== UI: RESET ==========
    setTimeout(() => {
        btn.disabled = false;
        btnLoader.classList.add('hidden');
        if (btnText.textContent !== '💀 EXPLOIT COMPLETE') {
            btnText.textContent = '💀 EXECUTE EXPLOIT';
        }
    }, 3000);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== UPDATE SYSTEM STATUS ==========
function updateStatus() {
    const statusEl = document.getElementById('systemStatus');
    const countEl = document.getElementById('targetCount');
    
    fetch('/api/status')
        .then(res => res.json())
        .then(data => {
            statusEl.textContent = `🟢 SYSTEM: ${data.status}`;
        })
        .catch(() => {
            statusEl.textContent = '🔴 SYSTEM: OFFLINE';
        });
}

updateStatus();
setInterval(updateStatus, 30000);

// ========== KEYBOARD SHORTCUT ==========
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        document.getElementById('attackBtn').click();
    }
});

console.log(`
    ██████╗ ███████╗██╗   ██╗    ███████╗███╗   ███╗██╗██╗     ███████╗
    ██╔══██╗██╔════╝██║   ██║    ██╔════╝████╗ ████║██║██║     ██╔════╝
    ██║  ██║█████╗  ██║   ██║    █████╗  ██╔████╔██║██║██║     █████╗  
    ██║  ██║██╔══╝  ╚██╗ ██╔╝    ██╔══╝  ██║╚██╔╝██║██║██║     ██╔══╝  
    ██████╔╝███████╗ ╚████╔╝     ███████╗██║ ╚═╝ ██║██║███████╗███████╗
    ╚═════╝ ╚══════╝  ╚═══╝      ╚══════╝╚═╝     ╚═╝╚═╝╚══════╝╚══════╝
                                                                        
    [💀] WHATSAPP EXPLOIT v3.0
    [💀] DEVELOPER: DEV SMILE
    [💀] USE CTRL+ENTER TO EXECUTE
`);
