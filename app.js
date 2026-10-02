// ═══════════════════════════════════════════════════════════
// TELEGRAM WEBAPP INIT
// ═══════════════════════════════════════════════════════════
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f0f1e');
    tg.setBackgroundColor('#0f0f1e');
}

// ═══════════════════════════════════════════════════════════
// CONFIG — YAHAN APNA BOT WEBHOOK URL DAALO
// ═══════════════════════════════════════════════════════════
const API_ENDPOINT = 'https://unstirrable-hyperphysical-whitney.ngrok-free.dev/api/verify';

// ═══════════════════════════════════════════════════════════
// FINGERPRINT COLLECTION
// ═══════════════════════════════════════════════════════════
async function collectFingerprint() {
    const fp = {
        // Telegram data
        user_id: tg?.initDataUnsafe?.user?.id || null,
        username: tg?.initDataUnsafe?.user?.username || null,
        first_name: tg?.initDataUnsafe?.user?.first_name || null,
        language_code: tg?.initDataUnsafe?.user?.language_code || null,
        is_premium: tg?.initDataUnsafe?.user?.is_premium || false,
        init_data: tg?.initData || null,

        // Browser data
        user_agent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        screen_color_depth: window.screen.colorDepth,
        pixel_ratio: window.devicePixelRatio,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone_offset: new Date().getTimezoneOffset(),
        hardware_concurrency: navigator.hardwareConcurrency || null,
        device_memory: navigator.deviceMemory || null,
        touch_points: navigator.maxTouchPoints || 0,

        // Canvas fingerprint
        canvas_fp: getCanvasFingerprint(),

        // WebGL fingerprint
        webgl_fp: getWebGLFingerprint(),

        // Timestamp
        timestamp: Date.now(),
    };

    return fp;
}

// ═══════════════════════════════════════════════════════════
// CANVAS FINGERPRINT
// ═══════════════════════════════════════════════════════════
function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');

        // Draw text with unique styling
        ctx.textBaseline = 'top';
        ctx.font = '14px "Arial"';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('OSINTrix-Verify, 2026!', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('OSINTrix-Verify, 2026!', 4, 17);

        // Get hash
        const dataURL = canvas.toDataURL();
        let hash = 0;
        for (let i = 0; i < dataURL.length; i++) {
            const char = dataURL.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    } catch (e) {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// WEBGL FINGERPRINT
// ═══════════════════════════════════════════════════════════
function getWebGLFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return null;

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return null;

        return {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        };
    } catch (e) {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════
function showCard(cardId) {
    ['mainCard', 'loadingCard', 'successCard', 'errorCard'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(cardId).classList.remove('hidden');
}

function showError(msg) {
    document.getElementById('errorMsg').textContent = msg;
    showCard('errorCard');
}

// ═══════════════════════════════════════════════════════════
// MAIN VERIFY FLOW
// ═══════════════════════════════════════════════════════════
async function verify() {
    try {
        showCard('loadingCard');

        // Collect fingerprint
        const fingerprint = await collectFingerprint();

        // Send to bot
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fingerprint),
        });

        const result = await response.json();

        if (result.ok) {
            showCard('successCard');
            // Haptic feedback
            tg?.HapticFeedback?.notificationOccurred('success');
        } else {
            showError(result.message || 'Verification failed');
            tg?.HapticFeedback?.notificationOccurred('error');
        }

    } catch (error) {
        console.error('Verify error:', error);
        showError('Network error. Please try again.');
    }
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════
document.getElementById('verifyBtn').addEventListener('click', verify);

document.getElementById('retryBtn').addEventListener('click', () => {
    showCard('mainCard');
});

document.getElementById('closeBtn').addEventListener('click', () => {
    if (tg) {
        tg.close();
    } else {
        window.history.back();
    }
});

// Prevent scroll bounce
document.body.addEventListener('touchmove', (e) => {
    if (e.target === document.body) {
        e.preventDefault();
    }
}, { passive: false });