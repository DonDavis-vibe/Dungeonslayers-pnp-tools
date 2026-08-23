// Dungeonslayers 4 — optionale Discord-Anbindung
// Postet Würfe und Ereignisse über einen Webhook in einen Discord-Kanal, damit
// die ganze Gruppe mitliest und nicht nur der Spielleiter.
//
// Die Webhook-URL ist ein Zugangsschlüssel: Wer sie hat, kann in den Kanal
// schreiben. Sie liegt deshalb nur im localStorage dieses Browsers und wird
// bewusst NICHT in die Charakter-JSON exportiert.

const DISCORD_KEY = 'ds4_discord';

const DISCORD_FARBEN = {
    immersieg: 0xf0c069,
    erfolg: 0x6fa84a,
    fehlschlag: 0xb8462f,
    patzer: 0x8c2b22,
    neutral: 0xd4a24c
};

const DISCORD_ICONS = {
    immersieg: '⭐',
    erfolg: '✅',
    fehlschlag: '❌',
    patzer: '💀',
    neutral: '🎲'
};

function discordSettings() {
    try {
        const stored = JSON.parse(localStorage.getItem(DISCORD_KEY) || 'null');
        if (stored && stored.url) return stored;
    } catch (e) { /* unlesbar, als deaktiviert behandeln */ }
    return null;
}

function discordAktiv() {
    const s = discordSettings();
    return !!(s && s.url && s.enabled !== false);
}

// Discord-Webhooks haben die Form
// https://discord.com/api/webhooks/<id>/<token> (auch discordapp.com und ptb./canary.)
function istWebhookUrl(url) {
    return /^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url.trim());
}

// --- Versand ---------------------------------------------------------------

// Discord drosselt Webhooks (etwa 5 Anfragen je 2 Sekunden). Die Warteschlange
// hält einen Mindestabstand ein, damit nichts verworfen wird.
let discordQueue = [];
let discordSending = false;
const DISCORD_ABSTAND_MS = 450;

function discordEnqueue(payload) {
    discordQueue.push(payload);
    if (discordQueue.length > 40) discordQueue.shift(); // Rückstau begrenzen
    if (!discordSending) discordFlush();
}

async function discordFlush() {
    const settings = discordSettings();
    if (!settings) { discordQueue = []; discordSending = false; return; }

    discordSending = true;
    while (discordQueue.length) {
        const payload = discordQueue.shift();
        try {
            const antwort = await fetch(settings.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (antwort.status === 429) {
                // Discord bittet um Pause — Eintrag zurücklegen und warten
                const info = await antwort.json().catch(() => ({}));
                const warte = Math.min(5000, (info.retry_after || 1) * 1000);
                discordQueue.unshift(payload);
                await new Promise(r => setTimeout(r, warte));
                continue;
            }
            if (!antwort.ok) {
                console.warn('Discord antwortete mit Status', antwort.status);
                if (antwort.status === 401 || antwort.status === 404) {
                    // Webhook ungültig oder gelöscht — nicht weiter versuchen
                    discordQueue = [];
                    discordMelde('Discord-Webhook ist ungültig oder wurde gelöscht.', 'fehlschlag');
                    break;
                }
            }
        } catch (e) {
            // Netzwerkfehler darf das Tool nie blockieren
            console.warn('Discord nicht erreichbar:', e);
            break;
        }
        await new Promise(r => setTimeout(r, DISCORD_ABSTAND_MS));
    }
    discordSending = false;
}

function discordMelde(text, status) {
    if (typeof addLog === 'function' && !isGmMode) addLog(text, status);
    else if (typeof addGmLog === 'function' && isGmMode) addGmLog('System', text, status);
}

// HTML aus den Logtexten entfernen — Discord kann damit nichts anfangen.
// Fett und kursiv werden vorher in Discords Markdown übersetzt.
function discordText(html) {
    return String(html)
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

function discordAbsender() {
    if (typeof isGmMode !== 'undefined' && isGmMode) return 'Spielleiter';
    return (typeof characterName === 'function' ? characterName() : 'Held');
}

// --- Öffentliche Schnittstelle ---------------------------------------------

// Ein Probenergebnis posten
function discordPostProbe(result, extra) {
    const s = discordSettings();
    if (!discordAktiv() || s.wuerfe === false) return;

    const wuerfe = result.rolls.map(r => r.die).join(' + ');
    const zeilen = [
        `**Probenwert:** ${result.pw}${result.modifier ? ` (${result.modifier > 0 ? '+' : ''}${result.modifier})` : ''}`,
        `**Wurf:** ${wuerfe}`
    ];
    if (result.success) zeilen.push(`**Ergebnis:** ${result.total}`);
    if (extra) zeilen.push(discordText(extra));

    discordEnqueue({
        username: discordAbsender(),
        embeds: [{
            title: `${DISCORD_ICONS[result.status]} ${result.label} — ${DS4_STATUS_TEXT[result.status].replace(/[⭐✅❌💀]\s*/, '')}`,
            description: zeilen.join('\n'),
            color: DISCORD_FARBEN[result.status] || DISCORD_FARBEN.neutral
        }]
    });
}

// Ein sonstiges Ereignis posten (Schaden, Heilung, Stufenaufstieg, Ansagen ...)
function discordPostEreignis(text, status = 'neutral') {
    const s = discordSettings();
    if (!discordAktiv() || s.ereignisse === false) return;

    discordEnqueue({
        username: discordAbsender(),
        embeds: [{
            description: `${DISCORD_ICONS[status] || '•'} ${discordText(text)}`,
            color: DISCORD_FARBEN[status] || DISCORD_FARBEN.neutral
        }]
    });
}

// --- Einstellungen ----------------------------------------------------------

function saveDiscordSettings() {
    const url = document.getElementById('discord-url').value.trim();
    const statusEl = document.getElementById('discord-status');

    if (!url) {
        localStorage.removeItem(DISCORD_KEY);
        statusEl.innerHTML = 'Discord-Anbindung entfernt.';
        statusEl.style.color = 'var(--text-dim)';
        renderDiscordState();
        return;
    }

    if (!istWebhookUrl(url)) {
        statusEl.innerHTML = 'Das sieht nicht nach einer Webhook-URL aus. Sie beginnt mit <code>https://discord.com/api/webhooks/</code>.';
        statusEl.style.color = 'var(--fail)';
        return;
    }

    localStorage.setItem(DISCORD_KEY, JSON.stringify({
        url,
        enabled: true,
        wuerfe: document.getElementById('discord-wuerfe').checked,
        ereignisse: document.getElementById('discord-ereignisse').checked
    }));

    statusEl.innerHTML = '✓ Gespeichert. Würfe gehen ab jetzt auch nach Discord.';
    statusEl.style.color = 'var(--success)';
    renderDiscordState();
}

function testDiscordWebhook() {
    const statusEl = document.getElementById('discord-status');
    if (!discordAktiv()) {
        statusEl.innerHTML = 'Erst eine Webhook-URL speichern.';
        statusEl.style.color = 'var(--fail)';
        return;
    }
    discordEnqueue({
        username: discordAbsender(),
        embeds: [{
            title: '🎲 Testnachricht',
            description: 'Die Dungeonslayers-Anbindung funktioniert. Ab jetzt landen eure Würfe hier.',
            color: DISCORD_FARBEN.neutral
        }]
    });
    statusEl.innerHTML = 'Testnachricht abgeschickt — schau in deinen Discord-Kanal.';
    statusEl.style.color = 'var(--accent-bright)';
}

function loadDiscordSettings() {
    const s = discordSettings();
    const urlFeld = document.getElementById('discord-url');
    if (!urlFeld) return;
    if (s) {
        urlFeld.value = s.url;
        document.getElementById('discord-wuerfe').checked = s.wuerfe !== false;
        document.getElementById('discord-ereignisse').checked = s.ereignisse !== false;
    }
    renderDiscordState();
}

// Kleine Anzeige im Multiplayer-Menü, ob die Anbindung gerade läuft
function renderDiscordState() {
    const el = document.getElementById('discord-state');
    if (!el) return;
    if (discordAktiv()) {
        const s = discordSettings();
        const was = [s.wuerfe !== false ? 'Würfe' : null, s.ereignisse !== false ? 'Ereignisse' : null]
            .filter(Boolean).join(' und ') || 'nichts';
        el.innerHTML = `<span class="tag" style="border-color:var(--success);color:#b9dfa0">● aktiv — ${was}</span>`;
    } else {
        el.innerHTML = '<span class="tag">○ nicht eingerichtet</span>';
    }
}
