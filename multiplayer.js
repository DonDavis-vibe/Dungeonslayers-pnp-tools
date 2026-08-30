// Dungeonslayers 4 — Live-Multiplayer (WebRTC via PeerJS) + Spielleiter-Dashboard
// Serverlos: Spieler verbinden sich per Raum-Code direkt mit dem Spielleiter.

let peer = null;
let hostConnection = null;
let clientConnections = {};
let isGmMode = false;
let connectedPlayers = {};

let peerJsLoaded = false;
let peerJsLoading = false;
let peerJsCallbacks = [];
let joinTimeout = null;
let hostReconnectAttempts = 0;
let hostReconnectPending = false;
let roomOnline = false;

const PEER_PREFIX = 'ds4-';
const JOIN_TIMEOUT_MS = 20000;
const SESSION_KEY = 'ds4_multiplayer_session';

const STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
];

// PeerJS wird erst bei Bedarf nachgeladen — die App funktioniert auch offline solo.
function ensurePeerJs(callback) {
    if (peerJsLoaded && typeof Peer !== 'undefined') { callback(); return; }
    peerJsCallbacks.push(callback);
    if (peerJsLoading) return;
    peerJsLoading = true;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
    script.onload = () => {
        peerJsLoaded = true;
        peerJsLoading = false;
        const callbacks = peerJsCallbacks;
        peerJsCallbacks = [];
        callbacks.forEach(cb => cb());
    };
    script.onerror = () => {
        peerJsLoading = false;
        peerJsCallbacks = [];
        setMultiplayerStatus('Multiplayer-Komponente konnte nicht geladen werden (offline?).', 'var(--fail)');
    };
    document.head.appendChild(script);
}

// --- Session über Reload retten --------------------------------------------

function saveSession(role, roomCode) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role, roomCode })); } catch (e) { /* blockiert */ }
}
function clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* blockiert */ }
}
function loadSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
}

document.addEventListener('DOMContentLoaded', () => {
    const stored = loadSession();
    if (!stored || !stored.roomCode) return;
    setMultiplayerStatus('Stelle vorherige Sitzung wieder her...', 'var(--accent)');
    if (stored.role === 'player') setConnectionBadge('connecting', stored.roomCode);
    ensurePeerJs(() => {
        if (stored.role === 'gm') hostMultiplayerSession(stored.roomCode);
        else joinMultiplayerSession(stored.roomCode);
    });
});

// --- Modal & Status ---------------------------------------------------------

// Zuletzt genutzter Raum-Code — überlebt auch eine getrennte Verbindung, damit
// ein Klick auf die Statusanzeige den Code für einen neuen Beitritt parat hat.
let letzterRaumCode = '';

function openMultiplayerModal() {
    if (!peerJsLoaded) {
        setMultiplayerStatus('Lade Multiplayer-Komponente...', 'var(--accent)');
        ensurePeerJs(() => setMultiplayerStatus(''));
    }
    loadTurnSettings();
    if (typeof loadDiscordSettings === 'function') loadDiscordSettings();

    const feld = document.getElementById('multiplayer-join-code');
    if (feld && letzterRaumCode && !feld.value) feld.value = letzterRaumCode;

    // Läuft schon ein Raum, führt "Raum eröffnen" nur zu Verwirrung (es würde
    // die Verbindung neu aufbauen). Dann zeigen wir stattdessen den Code —
    // wichtig, damit man von hier aus überhaupt an die Discord-Anbindung kommt.
    const vor = document.getElementById('mp-modal-vor-session');
    const drin = document.getElementById('mp-modal-in-session');
    if (vor && drin) {
        vor.style.display = isGmMode ? 'none' : '';
        drin.style.display = isGmMode ? '' : 'none';
        if (isGmMode) {
            const code = document.getElementById('gm-room-code');
            const ziel = document.getElementById('mp-modal-room');
            if (code && ziel) ziel.textContent = code.textContent;
        }
    }

    openModal('multiplayer-modal');
}
function closeMultiplayerModal() { closeModal('multiplayer-modal'); }

function setMultiplayerStatus(html, color = 'var(--text)') {
    const el = document.getElementById('multiplayer-status');
    if (!el) return;
    el.innerHTML = html;
    el.style.color = color;
}

// --- Dauerhafte Verbindungsanzeige in der Kopfzeile -------------------------

// Bleibt unsichtbar, solange niemand Multiplayer nutzt. Sobald ein Beitritt
// läuft, zeigt sie durchgehend an, ob die Verbindung zum Spielleiter steht.
function setConnectionBadge(zustand, roomCode) {
    const badge = document.getElementById('mp-badge');
    const text = document.getElementById('mp-badge-text');
    if (!badge || !text) return;

    badge.classList.remove('visible', 'connected', 'connecting', 'lost');
    // Das Gruppen-Panel haengt an der Verbindung und muss mitgehen
    if (typeof renderGruppe === 'function') renderGruppe();

    if (!zustand) {
        badge.removeAttribute('title');
        return;
    }

    const raum = roomCode ? ` · Raum ${roomCode}` : '';
    const zustaende = {
        connecting: {
            text: 'Verbinde...',
            title: 'Verbindung zum Spielleiter wird aufgebaut.'
        },
        connected: {
            text: `Mit Spielleiter verbunden${raum}`,
            title: 'Würfe und Werte werden live an den Spielleiter übertragen. Klicken für das Multiplayer-Menü.'
        },
        lost: {
            text: 'Verbindung getrennt',
            title: 'Die Verbindung zum Spielleiter ist abgebrochen. Klicken, um erneut beizutreten.'
        }
    };

    const konfig = zustaende[zustand];
    if (!konfig) return;

    badge.classList.add('visible', zustand);
    text.textContent = konfig.text;
    badge.title = konfig.title;
}

// --- TURN-Konfiguration -----------------------------------------------------

function getCustomTurnServer() {
    try {
        const stored = JSON.parse(localStorage.getItem('ds4_turn') || 'null');
        if (stored && stored.urls) return stored;
    } catch (e) { /* unlesbar, ignorieren */ }
    return null;
}

function peerConfig() {
    const iceServers = [...STUN_SERVERS];
    const custom = getCustomTurnServer();
    if (custom) iceServers.push(custom);
    return { config: { iceServers } };
}

function saveTurnSettings() {
    const url = document.getElementById('turn-url').value.trim();
    if (!url) {
        localStorage.removeItem('ds4_turn');
        setMultiplayerStatus('TURN-Server entfernt.', 'var(--text-dim)');
        return;
    }
    if (!/^turns?:/i.test(url)) {
        setMultiplayerStatus('TURN-URL muss mit turn: oder turns: beginnen.', 'var(--fail)');
        return;
    }
    localStorage.setItem('ds4_turn', JSON.stringify({
        urls: url,
        username: document.getElementById('turn-user').value.trim(),
        credential: document.getElementById('turn-pass').value
    }));
    setMultiplayerStatus('✓ TURN-Server gespeichert.', 'var(--success)');
}

function loadTurnSettings() {
    const custom = getCustomTurnServer();
    if (!custom) return;
    document.getElementById('turn-url').value = Array.isArray(custom.urls) ? custom.urls[0] : custom.urls;
    document.getElementById('turn-user').value = custom.username || '';
    document.getElementById('turn-pass').value = custom.credential || '';
}

// --- Spielleiter (Host) -----------------------------------------------------

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne I/O/0/1 wegen Verwechslungsgefahr
    let code = '';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

function hostMultiplayerSession(preferredCodeArg) {
    const preferredCode = typeof preferredCodeArg === 'string' ? preferredCodeArg : undefined;

    ensurePeerJs(() => {
        if (peer) peer.destroy();
        hostReconnectAttempts = 0;
        hostReconnectPending = false;
        roomOnline = false;

        setMultiplayerStatus(preferredCode ? 'Stelle Raum wieder her...' : 'Eröffne Raum...', 'var(--accent)');
        const roomCode = preferredCode || generateRoomCode();
        peer = new Peer(PEER_PREFIX + roomCode, peerConfig());

        // 'open' feuert auch nach einem Reconnect erneut — das Dashboard darf dann
        // nicht neu initialisiert werden, sonst wäre das Live-Log mitten im Spiel weg.
        peer.on('open', () => {
            if (!isGmMode) {
                closeMultiplayerModal();
                enterGmMode(roomCode);
            } else if (!roomOnline) {
                addGmLog('System', 'Verbindung zum Signalling-Server wiederhergestellt.', 'neutral');
            }
            hostReconnectAttempts = 0;
            setRoomStatus(true);
            saveSession('gm', roomCode);
        });

        peer.on('disconnected', () => { setRoomStatus(false); reconnectHost(); });

        peer.on('connection', conn => {
            conn.on('data', data => handleIncomingData(conn.peer, data));
            conn.on('close', () => {
                const name = connectedPlayers[conn.peer] ? connectedPlayers[conn.peer].name : 'Ein Spieler';
                delete clientConnections[conn.peer];
                delete connectedPlayers[conn.peer];
                renderGmDashboard();
                // Die Verbliebenen sollen sehen, dass jemand weg ist
                sendeGruppenliste();
                addGmLog('System', `${name} hat den Raum verlassen.`, 'neutral');
            });
            conn.on('error', () => {
                delete clientConnections[conn.peer];
                renderGmDashboard();
            });
            clientConnections[conn.peer] = conn;
        });

        peer.on('error', err => {
            if (err.type === 'unavailable-id') {
                clearSession();
                setMultiplayerStatus(preferredCode
                    ? 'Der alte Raum-Code ist noch belegt. Kurz warten und neu hosten.'
                    : 'Raum-Code bereits vergeben. Bitte erneut hosten.', 'var(--fail)');
            } else {
                setMultiplayerStatus('Fehler: ' + err.type, 'var(--fail)');
            }
        });
    });
}

// Der Signalling-Server trennt inaktive Peers. PeerJS meldet sich nicht von selbst
// neu an — ohne das hier wäre der Raum für neue Spieler unauffindbar.
function reconnectHost() {
    if (!peer || peer.destroyed || !isGmMode || peer.open || hostReconnectPending) return;
    if (hostReconnectAttempts >= 8) {
        addGmLog('System', 'Verbindung verloren. Bitte Dashboard schließen und neu hosten.', 'patzer');
        return;
    }

    const delay = Math.min(2000 * Math.pow(2, hostReconnectAttempts), 30000);
    hostReconnectAttempts++;
    hostReconnectPending = true;

    setTimeout(() => {
        if (!peer || peer.destroyed || peer.open) { hostReconnectPending = false; return; }
        try { peer.reconnect(); } catch (e) { /* nächster Versuch folgt */ }
        setTimeout(() => {
            hostReconnectPending = false;
            if (!peer || peer.destroyed) return;
            if (peer.open) {
                hostReconnectAttempts = 0;
                if (!roomOnline) { setRoomStatus(true); addGmLog('System', 'Verbindung wiederhergestellt.', 'neutral'); }
            } else {
                reconnectHost();
            }
        }, 3000);
    }, delay);
}

function setRoomStatus(online) {
    roomOnline = online;
    const el = document.getElementById('gm-room-status');
    if (!el) return;
    el.innerHTML = online ? '🟢 Raum online' : '🔴 Raum offline';
    el.style.color = online ? 'var(--success)' : 'var(--fail)';
    el.title = online
        ? 'Neue Spieler können beitreten.'
        : 'Signalling-Server nicht erreichbar — bereits verbundene Spieler bleiben aktiv, neue können nicht beitreten.';
}

function enterGmMode(roomCode) {
    isGmMode = true;
    // Die Spieler-Verbindungsanzeige gehört nicht ins Dashboard — dort steht der Raumstatus
    setConnectionBadge(null);
    document.getElementById('player-view').style.display = 'none';
    document.getElementById('gm-dashboard').style.display = 'block';
    document.getElementById('gm-room-code').textContent = roomCode;
    document.getElementById('gm-general-notes').value = localStorage.getItem('ds4_gm_notes') || '';
    renderGmDashboard();
    renderCombat();
    // Die Karte wandert mit ins Dashboard
    if (typeof karteEinhaengen === 'function') karteEinhaengen();
    // Liegt eine frühere Sitzung vor, zur Wiederherstellung anbieten
    if (typeof sitzungAnbieten === 'function') sitzungAnbieten();
    addGmLog('System', `Sitzung gestartet — Raum-Code ${roomCode}`, 'erfolg');
}

function exitGmMode() {
    if (peer) peer.destroy();
    peer = null;
    isGmMode = false;
    clientConnections = {};
    connectedPlayers = {};
    clearSession();
    document.getElementById('gm-dashboard').style.display = 'none';
    document.getElementById('player-view').style.display = '';
    // Karte zurück in die Spieleransicht holen
    if (typeof karteEinhaengen === 'function') karteEinhaengen();
}

function saveGmGeneralNotes(value) {
    localStorage.setItem('ds4_gm_notes', value);
}

// --- Datenempfang beim Spielleiter -----------------------------------------

function handleIncomingData(peerId, payload) {
    if (!payload || typeof payload !== 'object') return;

    // Karten-Nachrichten behandelt mapui.js selbst
    if (typeof handleKartenNachricht === 'function' && handleKartenNachricht(payload, peerId)) return;

    if (payload.type === 'state') {
        const isNew = !connectedPlayers[peerId];
        connectedPlayers[peerId] = payload.data;
        renderGmDashboard();
        // Laufender Kampf: aktualisierte LK/Initiative sofort in die Reihenfolge übernehmen
        if (combatActive) renderCombat();
        if (isNew) {
            addGmLog('System', `${escapeHtml(payload.data.name || 'Ein Held')} ist beigetreten.`, 'erfolg');
            // Neu Beigetretene bekommen die Hausregeln der Runde gleich mit
            if (typeof hausregeln !== 'undefined' && typeof hausregelnAktiv === 'function' && hausregelnAktiv()) {
                sendToPlayer(peerId, { type: 'hausregeln', regeln: hausregeln });
            }
            if (typeof combatActive !== 'undefined' && combatActive) sendeKampfstand();
        }
        // Die Runde soll voneinander wissen: jede Aenderung geht als Gruppenliste zurueck
        sendeGruppenliste();
    } else if (payload.type === 'roll') {
        const player = connectedPlayers[peerId];
        const name = player ? player.name : 'Unbekannt';
        const msg = sichererHtml(payload.message);
        const status = sichererStatus(payload.status);
        addGmLog(name, msg, status);
        // Alle anderen Spieler bekommen den Wurf ins Logbuch — der Absender hat ihn schon
        broadcastToPlayers({ type: 'mitschrieb', von: name, message: msg, status }, peerId);
    } else if (payload.type === 'whisper') {
        const player = connectedPlayers[peerId];
        const name = player ? player.name : 'Unbekannt';
        addGmLog(name, `🤫 <em>flüstert:</em> ${sichererHtml(payload.text)}`, 'neutral');
        if (typeof spielSound === 'function') spielSound('fluestern');
    } else if (payload.type === 'healRequest') {
        behandleHealRequest(peerId, payload);
    } else if (payload.type === 'spielerAngriff') {
        behandleSpielerAngriff(peerId, payload);
    }
}

// Ein Spieler hat im Kampf getroffen und ein Ziel aus dem Tracker gewählt.
// Der NSC würfelt seine Abwehr (npcDefend rechnet und meldet den Rest), damit
// der Spielleiter nichts von Hand abziehen muss.
function behandleSpielerAngriff(vonPeerId, payload) {
    if (typeof combatants === 'undefined') return;
    const angreifer = connectedPlayers[vonPeerId];
    const name = angreifer ? angreifer.name : 'Ein Held';
    const npc = combatants.find(c => c.type === 'npc' && c.name === payload.zielName);
    const schaden = parseInt(payload.schaden, 10) || 0;
    if (!npc) {
        addGmLog('System', `<strong>${escapeHtml(name)}</strong> trifft <strong>${escapeHtml(payload.zielName || '?')}</strong> für ${schaden} — steht aber nicht (mehr) im Tracker, bitte von Hand abziehen.`, 'fehlschlag');
        return;
    }
    addGmLog('System', `<strong>${escapeHtml(name)}</strong> greift <strong>${escapeHtml(npc.name)}</strong> an (Schaden ${schaden})${payload.ga ? ` · ${payload.ga > 0 ? '+' : ''}${payload.ga} Gegnerabwehr` : ''} — Abwehr läuft automatisch.`, 'neutral');
    if (typeof npcDefend === 'function') npcDefend(npc.id, schaden, parseInt(payload.ga, 10) || 0);
}

// --- Handouts: Bild oder Text an alle Spieler ----------------------------

function slHandoutText() {
    const feld = document.getElementById('sl-handout-text');
    const text = (feld ? feld.value : '').trim();
    if (!text) { setHandoutHinweis('Erst einen Text eintippen.'); return; }
    broadcastToPlayers({ type: 'handout', text });
    setHandoutHinweis('Text an alle Spieler geschickt.');
    addGmLog('Spielleiter', '🖼️ Handout (Text) an alle geschickt.', 'neutral');
}

function slHandoutBild(event) {
    const datei = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!datei) return;
    if (typeof BattleMap === 'undefined' || !BattleMap.bildVerkleinern) {
        setHandoutHinweis('Bild-Werkzeug nicht verfügbar.');
        return;
    }
    setHandoutHinweis('Bild wird vorbereitet …');
    BattleMap.bildVerkleinern(datei, 1400, 0.72).then(ergebnis => {
        broadcastToPlayers({ type: 'handout', bild: ergebnis.dataUrl });
        const vorschau = document.getElementById('sl-handout-vorschau');
        if (vorschau) { vorschau.src = ergebnis.dataUrl; vorschau.style.display = 'block'; }
        setHandoutHinweis(`Bild an ${Object.keys(clientConnections).length} Spieler geschickt${ergebnis.verkleinert ? ' (verkleinert)' : ''}.`);
        addGmLog('Spielleiter', '🖼️ Handout (Bild) an alle geschickt.', 'neutral');
    }).catch(fehler => setHandoutHinweis('Fehler: ' + (fehler && fehler.message || fehler)));
}

function slHandoutAusblenden() {
    broadcastToPlayers({ type: 'handout', clear: true });
    const vorschau = document.getElementById('sl-handout-vorschau');
    if (vorschau) { vorschau.style.display = 'none'; vorschau.removeAttribute('src'); }
    setHandoutHinweis('Handout bei den Spielern ausgeblendet.');
    addGmLog('Spielleiter', '🖼️ Handout ausgeblendet.', 'neutral');
}

function setHandoutHinweis(text) {
    const el = document.getElementById('sl-handout-hinweis');
    if (el) el.textContent = text || '';
}

// Heilzauber zwischen Spielern: es gibt keine direkte Verbindung zwischen
// ihnen, deshalb leitet der Spielleiter automatisch weiter - ohne selbst
// etwas tun zu muessen, genau wie bei einem eingehenden Angriff.
function behandleHealRequest(vonPeerId, payload) {
    const absender = connectedPlayers[vonPeerId];
    const absenderName = absender ? absender.name : 'Jemand';
    const betrag = parseInt(payload.betrag, 10) || 0;
    if (!betrag) return;

    const zielEintrag = Object.entries(connectedPlayers).find(([, p]) => p.name === payload.zielName);
    if (!zielEintrag) {
        addGmLog('System', `${escapeHtml(absenderName)} wollte <strong>${escapeHtml(payload.zielName)}</strong> heilen, ist aber nicht mehr verbunden.`, 'fehlschlag');
        sendToPlayer(vonPeerId, { type: 'message', text: `${payload.zielName} ist nicht mehr verbunden — die Heilung kam nicht an.` });
        return;
    }

    const [zielPeerId] = zielEintrag;
    // Derselbe Nachrichtentyp wie bei gmHealPlayer — die Zielseite behandelt
    // beides identisch (Kappung aufs Maximum, eigenes Log, Echo an den SL).
    sendToPlayer(zielPeerId, { type: 'heal', amount: betrag });
    addGmLog('System', `<strong>${escapeHtml(absenderName)}</strong> heilt <strong>${escapeHtml(payload.zielName)}</strong> um ${betrag} LK (${escapeHtml(payload.quelle || 'Zauber')}).`, 'erfolg');
}

// --- Der Spielleiter als Verteiler ------------------------------------------
//
// Bisher floss alles nur in eine Richtung: Spieler meldeten sich beim SL, und der
// behielt es fuer sich. Fuer Mitspieler-Uebersicht und Kampfanzeige muss er das
// Gesammelte zurueckgeben. Beides bewusst schlank gehalten - keine Portraits,
// keine Inventare, nur was am Tisch sichtbar waere.

function sendeGruppenliste() {
    if (!isGmMode) return;
    const gruppe = Object.values(connectedPlayers).map(p => ({
        name: p.name,
        klasse: p.klasse,
        stufe: p.stufe,
        // Klein genug, um es bei jeder Aenderung mitzuschicken - dieselbe Idee
        // wie beim Spielleiter-Dashboard, nur zum Wiedererkennen der Mitspieler
        portrait: p.portrait || '',
        lkCurrent: p.lkCurrent,
        lkMax: p.lkMax,
        bewusstlos: p.lkCurrent <= (p.bewusstlosAb || 0),
        tot: !!p.tot
    }));
    broadcastToPlayers({ type: 'party', gruppe });
}

// Wer ist dran, in welcher Runde, und wie ist die Reihenfolge? Ohne das konnten
// Spieler nicht einmal erkennen, DASS ein Kampf laeuft.
function sendeKampfstand() {
    if (!isGmMode) return;
    if (typeof combatants === 'undefined') return;

    const aktiv = typeof combatActive !== 'undefined' && combatActive;
    const reihenfolge = aktiv ? combatants.map((c, i) => ({
        name: c.name,
        istSpieler: c.type === 'player',
        amZug: i === turnIndex,
        // Gegner-LK geht die Spieler nichts an, eigene Leute schon
        lkCurrent: c.type === 'player' ? c.lkCurrent : null,
        lkMax: c.type === 'player' ? c.lkMax : null,
        // Zustände sieht die ganze Runde (Vergiftet, Brennt, Liegend …)
        zustaende: (c.zustaende || []).map(z => ({ text: z.text, runden: z.runden }))
    })) : [];

    broadcastToPlayers({
        type: 'combat',
        aktiv,
        runde: typeof currentRound === 'number' ? currentRound : 0,
        reihenfolge
    });
}

// --- GM Dashboard Rendering -------------------------------------------------

const GM_COLORS = ['#d4a24c', '#6fa84a', '#4a90d4', '#c4569e', '#d4784a', '#8a6fd4', '#4ac4b8', '#c44a4a'];

function colorForPlayer(name) {
    const stored = localStorage.getItem('ds4_color_' + name);
    if (stored) return stored;
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return GM_COLORS[Math.abs(hash) % GM_COLORS.length];
}

function renderGmDashboard() {
    const grid = document.getElementById('gm-players-grid');
    const emptyHint = document.getElementById('gm-empty-hint');
    if (!grid) return;

    const peerIds = Object.keys(connectedPlayers);
    document.getElementById('gm-player-count').textContent =
        `${peerIds.length} verbunden`;
    emptyHint.style.display = peerIds.length ? 'none' : '';
    renderGmWurfSicht();

    // Laufende Notizeingabe nicht durch das Neuzeichnen unterbrechen
    const active = document.activeElement;
    const focusedName = active && active.dataset && active.dataset.gmnote ? active.dataset.gmnote : null;
    const cursor = focusedName ? [active.selectionStart, active.selectionEnd] : null;

    grid.innerHTML = peerIds.map(peerId => {
        const p = connectedPlayers[peerId];
        const color = colorForPlayer(p.name);
        const lkPct = p.lkMax > 0 ? Math.max(0, Math.min(100, (p.lkCurrent / p.lkMax) * 100)) : 0;
        const lkColor = lkPct > 50 ? 'var(--success)' : (lkPct > 25 ? 'var(--accent)' : 'var(--fail)');
        const notes = localStorage.getItem('ds4_gmnote_' + p.name) || '';

        const statBox = (label, value) => `<div class="gm-stat"><span>${label}</span><strong>${value}</strong></div>`;

        const portrait = p.portrait
            ? `<img class="gm-portrait" src="${p.portrait}" alt="" style="border-color:${color}">`
            : `<span class="gm-portrait gm-portrait-leer" style="border-color:${color};color:${color}">${escapeHtml((p.name || '?').trim().slice(0, 2).toUpperCase())}</span>`;

        return `<div class="panel gm-player-card" style="border-top-color:${color}">
            <div class="panel-head" style="background:linear-gradient(180deg, ${color}22, transparent)">
                ${portrait}
                <h3 style="color:${color}">${escapeHtml(p.name || 'Namenlos')}</h3>
                <div class="panel-actions"><span class="tag">Stufe ${p.stufe}</span></div>
            </div>
            <div class="panel-body">
                <div class="hint">${escapeHtml(p.volk || '—')} ${escapeHtml(p.klasse || '')} ${p.spieler ? '· ' + escapeHtml(p.spieler) : ''}</div>

                <div style="margin-top:0.6rem">
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem">
                        <span>Lebenskraft</span>
                        <strong style="color:${lkColor}">${p.lkCurrent} / ${p.lkMax}</strong>
                    </div>
                    <div class="lk-bar-track" style="margin-top:0.2rem">
                        <div class="lk-bar-fill" style="width:${lkPct}%;background:${lkColor}"></div>
                    </div>
                    ${p.tot
                    ? '<div class="hint" style="color:var(--patzer);margin-top:0.2rem"><strong>☠ Gestorben</strong></div>'
                    : (p.lkCurrent <= (p.bewusstlosAb || 0)
                        ? '<div class="hint" style="color:var(--fail);margin-top:0.2rem"><strong>Bewusstlos!</strong></div>' : '')}
                    ${(() => {
                        const kampf = (typeof combatants !== 'undefined') ? combatants.find(c => c.peerId === peerId) : null;
                        const zl = kampf && kampf.zustaende || [];
                        return zl.length
                            ? `<div class="combat-zustaende" style="margin-top:0.35rem">${zl.map(z => `<span class="zustand-chip mini">${escapeHtml(z.text)}${z.runden != null ? `<b>${z.runden}</b>` : ''}</span>`).join('')}</div>`
                            : '';
                    })()}
                </div>

                <div class="gm-stat-row">
                    ${statBox('Abwehr', p.abwehr)}
                    ${statBox('Init', p.initiative)}
                    ${statBox('Schlagen', p.schlagen)}
                    ${statBox('Schießen', p.schiessen)}
                    ${p.isCaster ? statBox('Zaubern', p.zaubern) : ''}
                    ${p.isCaster ? statBox('Zielz.', p.zielzauber) : ''}
                </div>

                <details style="margin-top:0.6rem">
                    <summary style="cursor:pointer;font-size:0.85rem;color:var(--text-dim)">Werte &amp; Ausrüstung</summary>
                    <div class="hint" style="margin-top:0.4rem">
                        <strong>Attribute:</strong> KÖR ${p.attribute.koerper} · AGI ${p.attribute.agilitaet} · GEI ${p.attribute.geist}<br>
                        <strong>Eigenschaften:</strong> ${Object.entries(p.eigenschaften).map(([k, v]) => `${DS4_EIGENSCHAFT_ABBR[k]} ${v}`).join(' · ')}<br>
                        <strong>Waffen:</strong> ${escapeHtml(p.equipment.melee || '—')} / ${escapeHtml(p.equipment.ranged || '—')}<br>
                        <strong>Rüstung:</strong> PA ${p.panzerung}<br>
                        <strong>EP/LP/TP:</strong> ${p.ep ?? 0} EP · ${p.lp ?? 0} LP · ${p.tp ?? 0} TP offen<br>
                        <strong>Münzen:</strong> ${p.gold} GM · ${p.silber} SM · ${p.kupfer} KM
                        ${p.talents && p.talents.length ? `<br><strong>Talente:</strong> ${p.talents.map(t => escapeHtml(t.name) + ' ' + (t.rang || 1)).join(', ')}` : ''}
                    </div>
                </details>

                ${p.spells && p.spells.length ? `
                <details style="margin-top:0.4rem">
                    <summary style="cursor:pointer;font-size:0.85rem;color:var(--text-dim)">Zauber (${p.spells.length})</summary>
                    <div class="hint" style="margin-top:0.4rem">
                        ${p.spells.map(s => `${s.prepared ? '★ ' : (s.routine ? '⚙ ' : '')}${escapeHtml(s.name)}${s.cooldownUntil ? ` <span style="color:var(--fail)">(abklingend bis Runde ${s.cooldownUntil})</span>` : ''}`).join('<br>')}
                    </div>
                </details>` : (p.preparedSpell ? `<div class="hint" style="margin-top:0.4rem"><strong>Vorbereitet:</strong> ${escapeHtml(p.preparedSpell)}</div>` : '')}

                ${p.inventory && p.inventory.length ? `
                <details style="margin-top:0.4rem">
                    <summary style="cursor:pointer;font-size:0.85rem;color:var(--text-dim)">Inventar (${p.inventory.length})</summary>
                    <div class="hint" style="margin-top:0.4rem">
                        ${p.inventory.map(i => `${escapeHtml(i.name)}${i.menge > 1 ? ' ×' + i.menge : ''}`).join(' · ')}
                    </div>
                </details>` : ''}

                <div style="display:flex;gap:0.3rem;margin-top:0.6rem;flex-wrap:wrap">
                    <button class="btn btn-sm btn-danger" data-card-attack="${peerId}">Angreifen</button>
                    <button class="btn btn-sm" data-card-heal="${peerId}">Heilen</button>
                    <button class="btn btn-sm btn-ghost" data-card-nudge="${peerId}" title="Kurze Einblendung samt Ton beim Spieler — 'du bist dran'">👉 Anstupsen</button>
                    <button class="btn btn-sm btn-ghost" data-card-probe="${peerId}">Probe fordern</button>
                    <button class="btn btn-sm btn-ghost" data-card-msg="${peerId}">Flüstern</button>
                    <button class="btn btn-sm btn-ghost" data-card-ep="${peerId}">EP</button>
                </div>

                <div style="margin-top:0.6rem">
                    <div class="hint" style="margin-bottom:0.2rem">Geheime SL-Notizen</div>
                    <textarea rows="3" style="width:100%" data-gmnote="${escapeHtml(p.name)}">${escapeHtml(notes)}</textarea>
                </div>
            </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('[data-gmnote]').forEach(area => {
        area.addEventListener('input', () => {
            localStorage.setItem('ds4_gmnote_' + area.dataset.gmnote, area.value);
        });
    });

    grid.querySelectorAll('[data-card-attack]').forEach(btn => btn.addEventListener('click', () => {
        const eingabe = parseAngriffsEingabe(prompt(
            'Angriff auf den Spieler — gib den PROBENWERT ein, er wird ausgewürfelt.\n' +
            'Der Spieler würfelt danach selbst seine Abwehr.\n' +
            'Gegnerabwehr optional dahinter, z.B. "14 -2".\n' +
            'Fester Schaden ohne Wurf (Falle, Sturz): "=" davor, z.B. "=8":'));
        if (eingabe) gmAttackPlayer(btn.dataset.cardAttack, eingabe.schaden, 'Spielleiter', eingabe.ga);
    }));
    grid.querySelectorAll('[data-card-heal]').forEach(btn => btn.addEventListener('click', () => {
        const amount = parseInt(prompt('Wie viele LK heilen?'), 10);
        if (!isNaN(amount)) gmHealPlayer(btn.dataset.cardHeal, amount);
    }));
    grid.querySelectorAll('[data-card-probe]').forEach(btn => btn.addEventListener('click', () => {
        const name = prompt('Welche Probe?\n\n' + DS4_TYPISCHE_PROBEN.map(p => p.name).join(', '), 'Bemerken');
        if (name) gmRequestProbe(btn.dataset.cardProbe, name);
    }));
    grid.querySelectorAll('[data-card-nudge]').forEach(btn => btn.addEventListener('click', () => gmNudge(btn.dataset.cardNudge)));
    grid.querySelectorAll('[data-card-msg]').forEach(btn => btn.addEventListener('click', () => {
        const text = prompt('Nachricht an diesen Spieler:');
        if (text) gmSendMessage(btn.dataset.cardMsg, text);
    }));
    grid.querySelectorAll('[data-card-ep]').forEach(btn => btn.addEventListener('click', () => {
        const amount = parseInt(prompt('Wie viele EP für diesen Helden?'), 10);
        if (!isNaN(amount) && amount !== 0) gmGrantEp(btn.dataset.cardEp, amount);
    }));

    if (focusedName) {
        const restored = grid.querySelector(`[data-gmnote="${CSS.escape(focusedName)}"]`);
        if (restored) { restored.focus(); restored.setSelectionRange(cursor[0], cursor[1]); }
    }
}

// --- GM Log & Würfel --------------------------------------------------------

// Nachrichten der Gegenseite landen als HTML im Log bzw. in der Einblendung.
// Der Bogen selbst verschickt dabei <strong>/<em>; alles andere wird entschärft,
// damit ein fremder Teilnehmer im Raum kein beliebiges Markup einschleusen kann.
const ERLAUBTE_TAGS = /&lt;(\/?)(strong|em|b|i|br)\s*\/?&gt;/gi;

function sichererHtml(text) {
    return String(text == null ? '' : text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(ERLAUBTE_TAGS, (_, schraeg, tag) => `<${schraeg}${tag.toLowerCase()}>`);
}

// Der Status steuert eine CSS-Klasse — nur bekannte Werte durchlassen
function sichererStatus(status) {
    return ['immersieg', 'erfolg', 'fehlschlag', 'patzer', 'neutral'].includes(status) ? status : 'neutral';
}

let gmLog = [];

function addGmLog(source, message, status = 'neutral') {
    const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    gmLog.unshift({ time, source, message, status });
    if (gmLog.length > 80) gmLog.length = 80;
    renderGmLog();
}

function renderGmLog() {
    const list = document.getElementById('gm-live-log');
    if (!list) return;
    if (!gmLog.length) { list.innerHTML = '<div class="empty-hint">Noch keine Aktivität.</div>'; return; }
    list.innerHTML = gmLog.map(e => {
        const color = e.source === 'System' ? 'var(--text-dim)' : colorForPlayer(e.source);
        return `<li class="${e.status}">
            <span class="log-time">${e.time}</span>
            <strong style="color:${color}">${escapeHtml(e.source)}</strong><br>${e.message}
        </li>`;
    }).join('');
}

function clearGmLog() {
    gmLog = [];
    renderGmLog();
}

function rollGmProbe() {
    const pw = parseInt(document.getElementById('gm-pw').value, 10) || 0;
    const result = rollProbe(pw, { label: 'SL-Probe' });
    showProbeResult(result, 'gm-');
    let msg = `<strong>SL-Probe</strong> (PW ${result.pw}) — ${DS4_STATUS_TEXT[result.status]} · Wurf ${result.rolls.map(r => r.die).join('+')}`;
    if (result.success) msg += ` · Ergebnis <strong>${result.total}</strong>`;
    verteileSlWurf(msg, result.status, result);
}

// Beliebige Würfel für den Spielleiter — respektiert "Wer sieht den Wurf?".
function rollGmBeliebigeWuerfel() {
    const feld = document.getElementById('gm-wuerfel-formel');
    const w = wuerfelFormel(feld.value);
    if (!w.ok) { feld.title = w.fehler; return; }
    const detail = w.wuerfe.length > 1 ? ` (${w.wuerfe.join(' + ')})` : '';
    document.getElementById('gm-dice-number').textContent = w.summe;
    document.getElementById('gm-dice-label').textContent = w.formel;
    document.getElementById('gm-dice-status').textContent = '';
    document.getElementById('gm-dice-detail').textContent = detail.trim();
    document.getElementById('gm-dice-display').className = 'dice-display';
    verteileSlWurf(`<strong>${w.formel}</strong> = <strong>${w.summe}</strong>${detail}`, 'neutral', null);
}

function rollGmPlainD20() {
    const die = d20();
    document.getElementById('gm-dice-number').textContent = die;
    document.getElementById('gm-dice-label').textContent = 'Blanker 1W20';
    document.getElementById('gm-dice-status').textContent = '';
    document.getElementById('gm-dice-detail').textContent = '';
    document.getElementById('gm-dice-display').className = 'dice-display';
    verteileSlWurf(`Blanker 1W20: <strong>${die}</strong>`, 'neutral');
}

// --- Spieler (Client) -------------------------------------------------------

function joinMultiplayerSession(codeArg) {
    const raw = typeof codeArg === 'string' ? codeArg : document.getElementById('multiplayer-join-code').value;
    const code = (raw || '').trim().toUpperCase();
    if (code.length !== 4) {
        setMultiplayerStatus('Bitte den 4-stelligen Raum-Code eingeben.', 'var(--fail)');
        return;
    }

    letzterRaumCode = code;
    spielerAbsichtlichGetrennt = false;

    ensurePeerJs(() => {
        setMultiplayerStatus('Verbinde...', 'var(--accent)');
        setConnectionBadge('connecting', code);
        if (peer) peer.destroy();
        peer = new Peer(peerConfig());

        peer.on('open', () => {
            hostConnection = peer.connect(PEER_PREFIX + code, { reliable: true });

            // PeerJS kennt keinen Timeout für den DataChannel — ohne das hier bliebe
            // die Anzeige bei einem gescheiterten Verbindungsaufbau ewig auf "Verbinde...".
            clearTimeout(joinTimeout);
            joinTimeout = setTimeout(() => {
                if (hostConnection && hostConnection.open) return;
                diagnoseFailedConnection(hostConnection);
            }, JOIN_TIMEOUT_MS);

            hostConnection.on('open', () => {
                clearTimeout(joinTimeout);
                setMultiplayerStatus('✓ Verbunden mit dem Spielleiter.', 'var(--success)');
                setConnectionBadge('connected', code);
                spielerReconnectVersuche = 0;   // geglückt, Zähler zurücksetzen
                saveSession('player', code);
                setTimeout(closeMultiplayerModal, 1000);
                syncMultiplayerState();
                // Falls der Spielleiter bereits eine Karte teilt, nachfordern
                hostConnection.send({ type: 'mapAnfordern' });
                addLog('Mit Spielleiter verbunden (Raum ' + code + ')', 'erfolg');
            });

            hostConnection.on('data', payload => handleGmCommand(payload));

            hostConnection.on('close', () => {
                hostConnection = null;
                setConnectionBadge('lost', code);
                addLog('Verbindung zum Spielleiter getrennt.', 'fehlschlag');
                // Kurze Aussetzer (WLAN, Standby) sollen die Runde nicht sprengen
                spielerReconnect(code);
            });

            hostConnection.on('error', () => {
                clearTimeout(joinTimeout);
                setMultiplayerStatus('Verbindungsfehler.', 'var(--fail)');
                setConnectionBadge('lost', code);
            });
        });

        peer.on('error', err => {
            clearTimeout(joinTimeout);
            setConnectionBadge('lost', code);
            if (err.type === 'peer-unavailable') {
                clearSession();
                setMultiplayerStatus(`Raum <strong>${escapeHtml(code)}</strong> nicht gefunden.<br>
                    <span style="font-weight:normal;font-size:0.85rem">Code prüfen — oder der Spielleiter muss den Raum neu eröffnen.</span>`, 'var(--fail)');
            } else if (['network', 'server-error', 'socket-error'].includes(err.type)) {
                setMultiplayerStatus('Signalling-Server nicht erreichbar. Später erneut versuchen.', 'var(--fail)');
            } else {
                setMultiplayerStatus('Fehler: ' + err.type, 'var(--fail)');
            }
        });
    });
}

// --- Spieler: automatisch wieder verbinden ---------------------------------

let spielerReconnectVersuche = 0;
let spielerReconnectLaeuft = false;
let spielerAbsichtlichGetrennt = false;

function spielerReconnect(code) {
    if (spielerAbsichtlichGetrennt || spielerReconnectLaeuft) return;
    if (spielerReconnectVersuche >= 6) {
        setMultiplayerStatus('Wiederverbinden fehlgeschlagen. Bitte manuell beitreten.', 'var(--fail)');
        addLog('Automatisches Wiederverbinden aufgegeben — bitte manuell beitreten.', 'fehlschlag');
        clearSession();
        return;
    }

    // Wartezeit verdoppelt sich: 2s, 4s, 8s ... höchstens 30s
    const wartezeit = Math.min(2000 * Math.pow(2, spielerReconnectVersuche), 30000);
    spielerReconnectVersuche++;
    spielerReconnectLaeuft = true;
    setConnectionBadge('connecting', code);
    setMultiplayerStatus(`Verbindung verloren — Versuch ${spielerReconnectVersuche} in ${Math.round(wartezeit / 1000)}s...`, 'var(--accent)');

    setTimeout(() => {
        spielerReconnectLaeuft = false;
        if (hostConnection && hostConnection.open) return;   // ist schon wieder da
        if (spielerAbsichtlichGetrennt) return;
        joinMultiplayerSession(code);
    }, wartezeit);
}

// Nach dem Timeout die ICE-Kandidaten auswerten — sie verraten, woran es lag.
async function diagnoseFailedConnection(conn) {
    clearSession();
    setConnectionBadge('lost');
    const pc = conn && conn.peerConnection;
    let localTypes = [];
    let remoteCount = 0;

    if (pc) {
        try {
            const stats = await pc.getStats();
            stats.forEach(r => {
                if (r.type === 'local-candidate' && r.candidateType) localTypes.push(r.candidateType);
                if (r.type === 'remote-candidate') remoteCount++;
            });
        } catch (e) { /* Diagnose optional */ }
    }

    const hasUdp = localTypes.some(t => ['host', 'srflx', 'relay'].includes(t));
    const hasRelay = localTypes.includes('relay');
    const sub = 'font-weight:normal;font-size:0.85rem';

    if (!hasUdp) {
        setMultiplayerStatus(`WebRTC ist in diesem Browser blockiert.<br><span style="${sub}">
            Häufigste Ursache: eine VPN- oder Privacy-Erweiterung mit WebRTC-Leak-Schutz.
            Diese deaktivieren oder einen anderen Browser nutzen.</span>`, 'var(--fail)');
    } else if (remoteCount === 0) {
        setMultiplayerStatus(`Keine Antwort vom Spielleiter.<br><span style="${sub}">
            Der Raum existiert, aber die Gegenseite hat keine Verbindungsdaten geschickt.
            Beim Spielleiter könnte WebRTC blockiert sein.</span>`, 'var(--fail)');
    } else if (!hasRelay && !getCustomTurnServer()) {
        setMultiplayerStatus(`Keine direkte Verbindung möglich.<br><span style="${sub}">
            Beide Seiten sitzen hinter strengem NAT (Mobilfunk/Firmennetz).
            Dafür wird ein TURN-Server gebraucht — im Multiplayer-Menü unter "Erweitert".</span>`, 'var(--fail)');
    } else {
        setMultiplayerStatus(`Verbindungsaufbau fehlgeschlagen.<br><span style="${sub}">
            Netzwerk oder TURN-Zugangsdaten prüfen.</span>`, 'var(--fail)');
    }

    if (conn) conn.close();
}

// --- Senden -----------------------------------------------------------------

// Kompakter Zustand für das SL-Dashboard — nicht der komplette Bogen.
function buildSharedState() {
    const derived = computeDerived(charForRules());
    const cls = activeClass();
    const prepared = (appData.spells || []).find(s => s.prepared);

    return {
        name: characterName(),
        spieler: appData.spieler,
        // Kleingerechnetes Charakterbild: erscheint auf der SL-Übersicht und als Figur auf der Karte
        portrait: appData.portrait || '',
        volk: appData.volk ? DS4_RACES[appData.volk].name : '',
        klasse: cls ? (cls.isCaster && appData.subtype ? cls.subtypes[appData.subtype].name : cls.name) : '',
        isCaster: istZauberwirker(),
        stufe: stufeFuerEp(appData.ep || 0, !!appData.heldenklasse),
        lkCurrent: appData.lkCurrent || 0,
        lkMax: derived.lebenskraft,
        // Damit der Spielleiter Bewusstlosigkeit und Tod richtig anzeigen kann
        bewusstlosAb: derived.bewusstlosAb || 0,
        tot: (appData.lkCurrent || 0) <= todesGrenze(appData.attribute.koerper || 0),
        abwehr: derived.abwehr,
        initiative: derived.initiative,
        schlagen: derived.schlagen,
        schiessen: derived.schiessen,
        // Der Spielleiter braucht Laufen, um Zugvorschläge auf der Karte zu prüfen
        laufen: derived.laufen,
        zaubern: derived.zaubern,
        zielzauber: derived.zielzauber,
        panzerung: derived.panzerung,
        attribute: appData.attribute,
        eigenschaften: effectiveEigenschaften(),
        equipment: appData.equipment,
        talents: appData.talents,
        preparedSpell: prepared ? prepared.name : '',
        // Der Spielleiter muss auch sehen, was die Gruppe dabeihat und kann
        spells: (appData.spells || []).map(s => ({ name: s.name, prepared: !!s.prepared, routine: !!s.routine, cooldownUntil: s.cooldownUntil || 0 })),
        inventory: (appData.inventory || []).map(i => ({ name: i.name, menge: i.menge })),
        ep: appData.ep || 0, lp: appData.lp || 0, tp: appData.tp || 0,
        gold: appData.gold, silber: appData.silber, kupfer: appData.kupfer
    };
}

function syncMultiplayerState() {
    if (!hostConnection || !hostConnection.open) return;
    hostConnection.send({ type: 'state', data: buildSharedState() });
}

// alsEreignis=false, wenn der Text bereits als Probe an Discord ging — sonst
// stünde derselbe Wurf zweimal im Kanal.
function sendMultiplayerLog(message, status = 'neutral', alsEreignis = true) {
    if (alsEreignis && typeof discordPostEreignis === 'function') discordPostEreignis(message, status);
    if (isGmMode) { addGmLog('Spielleiter', message, status); return; }
    if (!hostConnection || !hostConnection.open) return;
    hostConnection.send({ type: 'roll', message, status });
}

function sendMultiplayerRoll(result, extra) {
    // Modifikator (Schwierigkeit + einmaliger Wurf-Bonus) offenlegen, damit der
    // Spielleiter im Live-Log sieht, wogegen wirklich gewuerfelt wurde.
    const pwText = result.modifier
        ? `PW ${result.basePw} ${result.modifier > 0 ? '+' : '−'}${Math.abs(result.modifier)} = ${result.pw}`
        : `PW ${result.pw}`;
    let msg = `<strong>${escapeHtml(result.label)}</strong> (${pwText}) — ${DS4_STATUS_TEXT[result.status]}`;
    msg += ` · Wurf ${result.rolls.map(r => r.die).join('+')}`;
    if (result.success) msg += ` · Ergebnis <strong>${result.total}</strong>`;
    if (extra) msg += ` · ${extra}`;
    sendMultiplayerLog(msg, result.status, false);
}

// --- Spielleiter → Spieler --------------------------------------------------

function sendToPlayer(peerId, payload) {
    const conn = clientConnections[peerId];
    if (conn && conn.open) conn.send(payload);
}

function broadcastToPlayers(payload, ausserPeerId) {
    Object.entries(clientConnections).forEach(([peerId, conn]) => {
        if (conn.open && peerId !== ausserPeerId) conn.send(payload);
    });
}

// Ein SL-Wurf: ins eigene Log, und je nach Sichtbarkeit an alle Spieler, an
// einen einzelnen oder an niemanden. "verdeckt" geht bewusst auch nicht nach
// Discord — sonst wäre er dort ja doch zu sehen.
function verteileSlWurf(msg, status, result) {
    const sicht = (document.getElementById('gm-wurf-sicht') || {}).value || 'alle';
    let logMsg = msg;
    if (sicht === 'verdeckt') logMsg += ' <span class="hint">🔒 verdeckt</span>';
    else if (sicht !== 'alle') {
        const p = connectedPlayers[sicht];
        logMsg += ` <span class="hint">🔒 nur ${escapeHtml(p ? p.name : '?')}</span>`;
    }
    addGmLog('Spielleiter', logMsg, status);

    if (sicht === 'alle') {
        broadcastToPlayers({ type: 'mitschrieb', von: 'Spielleiter', message: msg, status });
        if (result && typeof discordPostProbe === 'function') discordPostProbe(result, '');
    } else if (sicht !== 'verdeckt') {
        sendToPlayer(sicht, { type: 'mitschrieb', von: 'Spielleiter (nur an dich)', message: msg, status });
    }
}

// Die Auswahlliste "Wer sieht den Wurf?" an die verbundenen Spieler anpassen.
function renderGmWurfSicht() {
    const sel = document.getElementById('gm-wurf-sicht');
    if (!sel) return;
    const aktuell = sel.value;
    const spieler = Object.entries(connectedPlayers)
        .map(([pid, p]) => `<option value="${pid}">nur ${escapeHtml(p.name)}</option>`).join('');
    sel.innerHTML = `<option value="alle">alle Spieler</option><option value="verdeckt">verdeckt — nur ich</option>${spieler}`;
    if ([...sel.options].some(o => o.value === aktuell)) sel.value = aktuell;
}

// Kampf-Würfe (NSC-Angriff/-Abwehr, SL-Angriff) sind öffentlich — ins Log aller.
function meldeKampfwurfAnSpieler(msg, status) {
    broadcastToPlayers({ type: 'mitschrieb', von: '', message: msg, status });
}

// Der Spielleiter greift an: der Spieler würfelt selbst seine Abwehr (Regelwerk S.41)
// und meldet den durchgekommenen Schaden zurück.
function gmAttackPlayer(peerId, damage, quelle, gaMod = 0) {
    const player = connectedPlayers[peerId];
    if (!player) return;
    sendToPlayer(peerId, { type: 'attack', damage, quelle, gaMod });
    const gaText = gaMod ? ` (Gegnerabwehr ${gaMod > 0 ? '+' : ''}${gaMod})` : '';
    addGmLog('Spielleiter', `Angriff auf <strong>${escapeHtml(player.name)}</strong>: ${damage} Schaden${quelle ? ' durch ' + escapeHtml(quelle) : ''}${gaText} — Abwehr läuft...`, 'neutral');
}

// Erfahrungspunkte vergeben — an einen Spieler oder an die ganze Gruppe.
function gmGrantEp(peerId, amount) {
    if (!amount) return;
    if (peerId) {
        sendToPlayer(peerId, { type: 'ep', amount });
        const player = connectedPlayers[peerId];
        addGmLog('Spielleiter', `<strong>${escapeHtml(player ? player.name : '?')}</strong> erhält ${amount} EP.`, 'erfolg');
    } else {
        broadcastToPlayers({ type: 'ep', amount });
        addGmLog('Spielleiter', `Die Gruppe erhält je <strong>${amount} EP</strong>.`, 'erfolg');
        if (typeof discordPostEreignis === 'function') discordPostEreignis(`Die Gruppe erhält je **${amount} EP**.`, 'erfolg');
    }
}

// Summiert die EP aller besiegten Kreaturen im laufenden Kampf.
function besiegteEp() {
    return combatants
        .filter(c => c.type === 'npc' && c.lkCurrent <= 0 && c.ep)
        .reduce((sum, c) => sum + c.ep, 0);
}

// EP-Vergabe nach Regelwerk S.88: Die EP für getötete oder überlistete Gegner
// errechnen sich aus der EP-SUMME aller Gegner GETEILT DURCH die Anzahl der
// beteiligten Charaktere. Für ein erreichtes Abenteuerziel kommt mindestens ein
// Viertel der Gegner-EP obendrauf.
function promptGrantEp() {
    const summe = besiegteEp();
    // Beteiligt sind die verbundenen Helden; ohne Verbindung mindestens einer
    const helden = Math.max(1, Object.keys(connectedPlayers).length);
    const proKopf = Math.floor(summe / helden);

    const zeilen = summe
        ? [`Besiegte Gegner in diesem Kampf: ${summe} EP.`,
           `Geteilt durch ${helden} beteiligte${helden === 1 ? 'n' : ''} Held${helden === 1 ? 'en' : 'en'}: ` +
           `${proKopf} EP pro Kopf (Regelwerk S.88).`,
           '',
           `Für ein abgeschlossenes Abenteuerziel kommen mindestens ${Math.floor(summe / 4 / helden)} EP dazu ` +
           '(ein Viertel der Gegner-EP).']
        : ['Kein besiegter Gegner mit EP-Wert im laufenden Kampf.',
           'Rollenspiel bringt bis zu Stufe × 2 EP pro Situation,',
           'gute Ideen und überwundene Fallen 5–25 EP.'];

    const eingabe = prompt(zeilen.join('\n') + '\n\nWie viele EP bekommt jeder Held?', proKopf || '');
    const amount = parseInt(eingabe, 10);
    if (!isNaN(amount) && amount !== 0) gmGrantEp(null, amount);
}

function promptRequestProbe() {
    const namen = DS4_TYPISCHE_PROBEN.map(p => p.name);
    const eingabe = prompt(
        'Welche Probe sollen die Spieler würfeln?\n\n' + namen.join(', '),
        'Bemerken');
    if (!eingabe) return;
    broadcastToPlayers({ type: 'requestProbe', probeName: eingabe });
    addGmLog('Spielleiter', `fordert von allen eine <strong>${escapeHtml(eingabe)}</strong>-Probe.`, 'neutral');
}

function gmApplyDamage(peerId, amount, quelle) {
    const player = connectedPlayers[peerId];
    if (!player) return;
    sendToPlayer(peerId, { type: 'damage', amount, quelle });
    addGmLog('Spielleiter', `<strong>${escapeHtml(player.name)}</strong> erleidet ${amount} Schaden (ohne Abwehr)${quelle ? ' durch ' + escapeHtml(quelle) : ''}.`, 'fehlschlag');
}

function gmHealPlayer(peerId, amount) {
    const player = connectedPlayers[peerId];
    if (!player) return;
    sendToPlayer(peerId, { type: 'heal', amount });
    addGmLog('Spielleiter', `<strong>${escapeHtml(player.name)}</strong> wird um ${amount} LK geheilt.`, 'erfolg');
}

function gmSendMessage(peerId, text) {
    if (!text) return;
    if (peerId) {
        sendToPlayer(peerId, { type: 'message', text, ansage: false });
        const player = connectedPlayers[peerId];
        addGmLog('Spielleiter', `Flüstern an <strong>${escapeHtml(player ? player.name : '?')}</strong>: ${escapeHtml(text)}`, 'neutral');
    } else {
        broadcastToPlayers({ type: 'message', text, ansage: true });
        addGmLog('Spielleiter', `An alle: ${escapeHtml(text)}`, 'neutral');
        // Ansagen an alle gehören auch in den Discord-Kanal, Flüstern nicht
        if (typeof discordPostEreignis === 'function') discordPostEreignis(text, 'neutral');
    }
}

function promptBroadcast() {
    const text = prompt('Ansage an alle Spieler:');
    if (text) gmSendMessage(null, text);
}

function gmRequestProbe(peerId, probeName) {
    sendToPlayer(peerId, { type: 'requestProbe', probeName });
    const player = connectedPlayers[peerId];
    addGmLog('Spielleiter', `fordert von <strong>${escapeHtml(player ? player.name : '?')}</strong> eine ${escapeHtml(probeName)}-Probe.`, 'neutral');
}

// --- Soundboard: der Spielleiter löst Klänge bei allen aus ----------------

function slSoundPegel() {
    const s = document.getElementById('sl-sound-pegel');
    return s ? (parseFloat(s.value) || 0) : 0.7;
}

// Nur beim Spielleiter — zum Reinhören, ohne dass es die Runde hört.
function slSoundVorhoeren(id) {
    if (typeof soundboardAbspielen === 'function') soundboardAbspielen(id, slSoundPegel());
}

function slSoundAbspielen(id) {
    const pegel = slSoundPegel();
    if (typeof soundboardAbspielen === 'function') soundboardAbspielen(id, pegel);
    const name = typeof soundboardName === 'function' ? soundboardName(id) : id;
    const eigen = typeof eigenerSound === 'function' ? eigenerSound(id) : null;
    if (eigen) {
        // Eigene Datei hat keine für die Spieler erreichbare URL — der Inhalt geht
        // direkt per WebRTC mit, einmal pro Auslösung.
        eigen.blob.arrayBuffer().then(buffer => {
            broadcastToPlayers({ type: 'soundboard-eigen', name: eigen.name, typ: eigen.blob.type, buffer, pegel });
        });
    } else {
        broadcastToPlayers({ type: 'soundboard', soundId: id, pegel });
    }
    addGmLog('Spielleiter', `🎵 <strong>${escapeHtml(name)}</strong> — für alle abgespielt`, 'neutral');
}

function slSoundStop() {
    if (typeof soundboardStop === 'function') soundboardStop();
    broadcastToPlayers({ type: 'soundboard-stop' });
}

function slSoundFade() {
    if (typeof soundboardFade === 'function') soundboardFade();
    broadcastToPlayers({ type: 'soundboard-fade' });
}

function slSoundPegelAendern(wert) {
    const pegel = Math.max(0, Math.min(1, parseFloat(wert) || 0));
    if (typeof soundboardPegelSetzen === 'function') soundboardPegelSetzen(pegel);
    broadcastToPlayers({ type: 'soundboard-vol', pegel });
}

// --- Eigene Sounds: hochladen, auflisten, entfernen ----------------------
//
// Bleiben nur auf dem SL-Gerät (IndexedDB, siehe sounds.js). Beim Abspielen für
// alle wandert der Dateiinhalt direkt per WebRTC an die verbundenen Spieler.

function setSlSoundHinweis(text) {
    const el = document.getElementById('sl-sound-hinweis');
    if (el) el.textContent = text || '';
}

function slEigenenSoundHochladen(event) {
    const datei = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!datei) return;
    if (!/^audio\//.test(datei.type) && !/\.(mp3|ogg|oga|wav|webm|weba|m4a|opus|flac|aac)$/i.test(datei.name)) {
        setSlSoundHinweis('Das sieht nicht nach einer Audiodatei aus (mp3, ogg, wav, webm …).');
        return;
    }
    if (datei.size > EIGENE_SOUND_MAX) {
        setSlSoundHinweis(`„${datei.name}" ist größer als 20 MB — das dauert beim Übertragen an die Spieler zu lange. Bitte kürzen oder stärker komprimieren.`);
        return;
    }
    const eintrag = {
        id: 'eigen:' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: datei.name.replace(/\.[^.]+$/, ''),
        blob: datei
    };
    eigenenSoundSichern(eintrag).then(() => {
        eigeneSounds.push({ id: eintrag.id, name: eintrag.name, blob: datei });
        renderSoundboardAuswahl();
        renderEigeneSoundListe();
        const sel = document.getElementById('sl-sound-auswahl');
        if (sel) sel.value = eintrag.id;
        setSlSoundHinweis(`„${eintrag.name}" liegt im Soundboard — nur auf diesem Gerät gespeichert.`);
    }).catch(e => {
        setSlSoundHinweis('Speichern fehlgeschlagen: ' + ((e && e.message) || e));
    });
}

function slEigenenSoundEntfernen(id) {
    eigenenSoundLoeschen(id).then(() => {
        eigeneSounds = eigeneSounds.filter(s => s.id !== id);
        renderSoundboardAuswahl();
        renderEigeneSoundListe();
        setSlSoundHinweis('');
    });
}

function renderEigeneSoundListe() {
    const box = document.getElementById('sl-eigene-sounds');
    if (!box) return;
    box.innerHTML = eigeneSounds.map(s =>
        `<div class="eigen-sound-zeile">` +
        `<span title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</span>` +
        `<button class="btn btn-sm btn-ghost" type="button" onclick="slEigenenSoundEntfernen('${s.id}')" title="Aus dem Soundboard entfernen">✕</button>` +
        `</div>`
    ).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderEigeneSoundListe === 'function') renderEigeneSoundListe();
});

// Anstupsen: kurze Einblendung samt "Du bist am Zug"-Ton beim Spieler, ohne
// den Kampf weiterzuschalten — für "du bist dran" oder "jetzt bist DU gemeint".
function gmNudge(peerId) {
    if (!peerId) return;
    sendToPlayer(peerId, { type: 'nudge' });
    const player = connectedPlayers[peerId];
    addGmLog('Spielleiter', `stupst <strong>${escapeHtml(player ? player.name : '?')}</strong> an.`, 'neutral');
}

// --- Spieler: Befehle vom Spielleiter --------------------------------------

function handleGmCommand(payload) {
    if (!payload || typeof payload !== 'object') return;

    // Karten-Nachrichten behandelt mapui.js selbst
    if (typeof handleKartenNachricht === 'function' && handleKartenNachricht(payload)) return;

    switch (payload.type) {
        case 'attack': {
            // Abwehr ist eine automatische Probe, keine Aktion (Regelwerk S.41).
            // Die Gegnerabwehr der angreifenden Waffe senkt den Probenwert.
            const derived = computeDerived(charForRules());
            // Slayende Würfel gelten auch für die Abwehr (Regelwerk S.45)
            const slayend = typeof slayendeWuerfelAktiv === 'function' && slayendeWuerfelAktiv();
            const result = rollProbe(derived.abwehr, { label: 'Abwehr', modifier: payload.gaMod || 0, slayend });
            showProbeResult(result);

            const reduced = result.success ? result.total : 0;
            const finalDamage = Math.max(0, payload.damage - reduced);
            const vorher = applyIncomingDamage(finalDamage);

            let extra = result.success
                ? `Schaden ${payload.damage} − ${reduced} Abwehr = <strong>${finalDamage}</strong>`
                : `Abwehr misslungen — voller Schaden <strong>${finalDamage}</strong>`;
            if (result.slayendZusatz) extra += ` · ⚡ ${slayendText(result)}`;
            if (result.patzer) extra += ` · ${kampfpatzerText('abwehr')}`;

            addLog(`Angriff${payload.quelle ? ' von ' + escapeHtml(payload.quelle) : ''}: ${payload.damage} Schaden — ${DS4_STATUS_TEXT[result.status]} · ${extra}`, result.status);
            sendMultiplayerLog(`<strong>Abwehr</strong> (PW ${result.pw}) — ${DS4_STATUS_TEXT[result.status]} · Wurf ${result.rolls.map(r => r.die).join('+')} · ${extra} · LK jetzt ${appData.lkCurrent}`, result.status);
            // Erst die Ursache melden, dann die Folge
            meldeLkSchwelle(vorher);
            break;
        }
        case 'damage': {
            const vorher = applyIncomingDamage(payload.amount);
            addLog(`${payload.amount} Schaden${payload.quelle ? ' durch ' + escapeHtml(payload.quelle) : ''} (keine Abwehr möglich) — LK ${appData.lkCurrent}`, 'fehlschlag');
            sendMultiplayerLog(`erleidet ${payload.amount} Schaden — LK jetzt ${appData.lkCurrent}`, 'fehlschlag');
            meldeLkSchwelle(vorher);
            break;
        }
        case 'heal': {
            const max = lastDerived ? lastDerived.lebenskraft : 0;
            appData.lkCurrent = Math.min(max, (appData.lkCurrent || 0) + payload.amount);
            refreshBoundInputs();
            renderDerived();
            scheduleSave();
            if (typeof spielSound === 'function') spielSound('heilung');
            addLog(`Geheilt um ${payload.amount} LK — jetzt ${appData.lkCurrent}/${max}`, 'erfolg');
            sendMultiplayerLog(`wird um ${payload.amount} LK geheilt — jetzt ${appData.lkCurrent}/${max}`, 'erfolg');
            break;
        }
        case 'message':
            showGmMessage(sichererHtml(payload.text));
            addLog(`<strong>Spielleiter:</strong> ${escapeHtml(payload.text)}`, 'neutral');
            if (typeof spielSound === 'function') spielSound(payload.ansage ? 'ansage' : 'fluestern');
            break;
        case 'handout':
            zeigeHandout(payload);
            break;
        case 'nudge':
            showGmMessage('<strong>👉 Der Spielleiter stupst dich an!</strong>');
            addLog('👉 <strong>Der Spielleiter stupst dich an</strong> — du bist wohl dran.', 'neutral');
            if (typeof spielSound === 'function') spielSound('dein-zug');
            break;
        case 'mitschrieb': {
            // Wuerfe der Mitspieler, des Spielleiters und aus dem Kampf — der
            // Spielleiter verteilt sie, damit jedes Logbuch alles hat.
            const von = payload.von ? `<strong>${escapeHtml(payload.von)}</strong> · ` : '';
            addLog(von + sichererHtml(payload.message), sichererStatus(payload.status));
            break;
        }
        case 'soundboard':
            if (typeof soundboardAbspielen === 'function') soundboardAbspielen(payload.soundId, payload.pegel);
            break;
        case 'soundboard-eigen':
            if (typeof eigenenSoundAbspielen === 'function') {
                eigenenSoundAbspielen(payload.buffer || payload.blob, payload.pegel, payload.typ);
            }
            break;
        case 'soundboard-stop':
            if (typeof soundboardStop === 'function') soundboardStop();
            break;
        case 'soundboard-fade':
            if (typeof soundboardFade === 'function') soundboardFade();
            break;
        case 'soundboard-vol':
            if (typeof soundboardPegelSetzen === 'function') soundboardPegelSetzen(payload.pegel);
            break;
        case 'requestProbe': {
            showGmMessage(`Der Spielleiter fordert eine <strong>${escapeHtml(payload.probeName)}</strong>-Probe.`);
            addLog(`Spielleiter fordert eine ${escapeHtml(payload.probeName)}-Probe.`, 'neutral');
            // Passende typische Probe im Würfelbereich vorwählen
            const idx = DS4_TYPISCHE_PROBEN.findIndex(p => p.name.toLowerCase() === String(payload.probeName).toLowerCase());
            if (idx >= 0) {
                const sel = document.getElementById('f-typische-probe');
                if (sel) { sel.value = idx; sel.scrollIntoView({ block: 'center' }); }
            }
            break;
        }
        case 'ep': {
            appData.ep = (appData.ep || 0) + payload.amount;
            const vorher = stufeFuerEp((appData.ep || 0) - payload.amount, !!appData.heldenklasse);
            const nachher = stufeFuerEp(appData.ep, !!appData.heldenklasse);
            refreshBoundInputs();
            renderMeta();
            scheduleSave();
            addLog(`<strong>+${payload.amount} EP</strong> vom Spielleiter — jetzt ${appData.ep} EP`, 'erfolg');
            if (nachher > vorher) {
                // Gutschrift zentral, damit auch hier die Hausregeln der Runde gelten
                const gutschrift = gutschriftFuerStufen(nachher - vorher);
                refreshBoundInputs();
                renderAll();
                scheduleSave();
                showGmMessage(`<strong>Stufenaufstieg!</strong> Stufe ${nachher} erreicht — ${gutschrift} gutgeschrieben.`);
                addLog(`<strong>Stufe ${nachher} erreicht!</strong> ${gutschrift}`, 'erfolg');
                sendMultiplayerLog(`steigt auf <strong>Stufe ${nachher}</strong> auf!`, 'immersieg');
            }
            syncMultiplayerState();
            break;
        }
        case 'round':
            currentRound = payload.round;
            tickSpellCooldowns(payload.round);
            break;
        case 'hausregeln':
            // Der Spielleiter gibt die Regeln der Runde vor
            if (typeof hausregelnEmpfangen === 'function') hausregelnEmpfangen(payload.regeln);
            break;
        case 'party':
            gruppenStand = payload.gruppe || [];
            renderGruppe();
            break;
        case 'combat': {
            const warAmZug = kampfStand.amZug;
            const warAktiv = kampfStand.aktiv;
            kampfStand = {
                aktiv: !!payload.aktiv,
                runde: payload.runde || 0,
                reihenfolge: payload.reihenfolge || [],
                amZug: (payload.reihenfolge || []).some(e => e.amZug && e.name === characterName())
            };
            // Nur beim Wechsel melden, nicht bei jeder Aktualisierung
            if (kampfStand.aktiv && !warAktiv && typeof spielSound === 'function') spielSound('kampf-beginnt');
            if (kampfStand.amZug && !warAmZug) {
                showGmMessage('<strong>Du bist am Zug!</strong> Runde ' + kampfStand.runde);
                if (typeof spielSound === 'function') spielSound('dein-zug');
            }
            renderGruppe();
            break;
        }
    }
}

// Wendet Schaden an und liefert den vorherigen Stand zurück. Die Meldung über
// Bewusstlosigkeit oder Tod macht der Aufrufer über meldeLkSchwelle() — und zwar
// NACH seiner eigenen Schadensmeldung, damit die Ursache vor der Folge steht.
function applyIncomingDamage(amount) {
    const vorher = appData.lkCurrent || 0;
    appData.lkCurrent = vorher - amount;
    refreshBoundInputs();
    renderDerived();
    scheduleSave();
    syncMultiplayerState();
    if (typeof spielSound === 'function') spielSound('schaden');
    return vorher;
}

// --- Gruppe und Kampf beim Spieler ------------------------------------------

let gruppenStand = [];
let kampfStand = { aktiv: false, runde: 0, reihenfolge: [], amZug: false };

function renderGruppe() {
    const panel = document.getElementById('panel-gruppe');
    const kampfBox = document.getElementById('kampf-status');
    const liste = document.getElementById('gruppen-liste');
    if (!panel || !kampfBox || !liste) return;

    // Ohne Verbindung gibt es weder Gruppe noch Kampf
    const verbunden = !!(hostConnection && hostConnection.open);
    panel.style.display = verbunden ? '' : 'none';
    if (!verbunden) return;

    if (kampfStand.aktiv) {
        const dran = kampfStand.reihenfolge.find(e => e.amZug);
        const chips = zl => (zl || []).map(z =>
            `<span class="zustand-chip mini">${escapeHtml(z.text)}${z.runden != null ? `<b>${z.runden}</b>` : ''}</span>`).join('');
        const reihe = kampfStand.reihenfolge.map(e => {
            const klassen = ['kampf-eintrag'];
            if (e.amZug) klassen.push('am-zug');
            if (e.name === characterName()) klassen.push('ich');
            const lk = (e.lkCurrent !== null && e.lkCurrent !== undefined)
                ? ` <span class="hint">${e.lkCurrent}/${e.lkMax}</span>` : '';
            // Freund/Feind auf einen Blick — die Initiative-Reihenfolge bleibt gemischt
            const symbol = e.istSpieler ? '🛡️' : '👹';
            const zst = (e.zustaende && e.zustaende.length) ? ` ${chips(e.zustaende)}` : '';
            return `<div class="${klassen.join(' ')}">${e.amZug ? '▶ ' : ''}${symbol} ${escapeHtml(e.name)}${lk}${zst}</div>`;
        }).join('');

        const meine = (kampfStand.reihenfolge.find(e => e.name === characterName()) || {}).zustaende || [];
        const meineZeile = meine.length
            ? `<div class="kampf-eigene-zustaende">Du bist: ${chips(meine)}</div>` : '';

        kampfBox.innerHTML = `
            <div class="kampf-kopf ${kampfStand.amZug ? 'ich-dran' : ''}">
                ⚔️ <strong>Kampf läuft</strong> — Runde ${kampfStand.runde}
                ${kampfStand.amZug
                    ? '<div class="kampf-dran">Du bist am Zug!</div>'
                    : `<div class="hint">Am Zug: ${dran ? escapeHtml(dran.name) : '—'}</div>`}
                ${meineZeile}
            </div>
            <div class="kampf-reihenfolge">${reihe}</div>`;
    } else {
        kampfBox.innerHTML = '<div class="hint">Gerade läuft kein Kampf.</div>';
    }

    const andere = gruppenStand.filter(p => p.name !== characterName());
    if (!andere.length) {
        liste.innerHTML = '<div class="hint">Keine Mitspieler verbunden.</div>';
        return;
    }
    liste.innerHTML = andere.map(p => {
        const anteil = p.lkMax ? Math.max(0, Math.min(100, (p.lkCurrent / p.lkMax) * 100)) : 0;
        const zustand = p.tot ? '<span style="color:var(--fail)">tot</span>'
            : p.bewusstlos ? '<span style="color:var(--fail)">bewusstlos</span>' : '';
        const farbe = colorForPlayer(p.name);
        const avatar = p.portrait
            ? `<img class="gm-portrait" src="${p.portrait}" alt="" style="border-color:${farbe}">`
            : `<span class="gm-portrait gm-portrait-leer" style="border-color:${farbe};color:${farbe}">${escapeHtml((p.name || '?').trim().slice(0, 2).toUpperCase())}</span>`;
        return `<div class="gruppen-eintrag">
            <div class="gruppen-kopf">
                ${avatar}
                <strong>${escapeHtml(p.name)}</strong>
                <span class="hint">${escapeHtml(p.klasse || '')}${p.stufe ? ' · Stufe ' + p.stufe : ''}</span>
                <span style="margin-left:auto">${p.lkCurrent}/${p.lkMax} ${zustand}</span>
            </div>
            <div class="lk-bar-track"><div class="lk-bar-fill" style="width:${anteil}%"></div></div>
        </div>`;
    }).join('');
}

// Bisher konnte nur der Spielleiter fluestern. Die Gegenrichtung fehlte ganz.
function fluesterAnSl() {
    if (!hostConnection || !hostConnection.open) {
        alert('Keine Verbindung zum Spielleiter.');
        return;
    }
    const text = prompt('Nachricht an den Spielleiter (nur er sieht sie):');
    if (!text) return;
    hostConnection.send({ type: 'whisper', text });
    addLog(`🤫 <em>An den Spielleiter:</em> ${escapeHtml(text)}`, 'neutral');
}

// --- Handout beim Spieler anzeigen --------------------------------------

let letztesHandout = null;   // {bild} | {text} — für den „erneut zeigen"-Knopf

function zeigeHandout(payload) {
    const modal = document.getElementById('handout-modal');
    const koerper = document.getElementById('handout-body');
    const knopf = document.getElementById('handout-wieder');
    if (!modal || !koerper) return;

    if (payload.clear) {
        letztesHandout = null;
        if (typeof closeModal === 'function') closeModal('handout-modal');
        if (knopf) knopf.style.display = 'none';
        return;
    }

    if (payload.bild) {
        koerper.innerHTML = `<img src="${payload.bild}" alt="Handout des Spielleiters">`;
        letztesHandout = { bild: payload.bild };
    } else {
        koerper.innerHTML = `<div class="handout-text">${escapeHtml(payload.text || '')}</div>`;
        letztesHandout = { text: payload.text || '' };
    }
    if (knopf) knopf.style.display = '';
    if (typeof openModal === 'function') openModal('handout-modal');
    if (typeof spielSound === 'function') spielSound('ansage');
}

function handoutErneutZeigen() {
    if (letztesHandout) zeigeHandout(letztesHandout);
}

// Einblendung für Nachrichten des Spielleiters
function showGmMessage(html) {
    let box = document.getElementById('gm-message-toast');
    if (!box) {
        box = document.createElement('div');
        box.id = 'gm-message-toast';
        box.className = 'gm-toast';
        document.body.appendChild(box);
    }
    box.innerHTML = `<div class="gm-toast-head">👑 Spielleiter</div><div>${html}</div>`;
    box.classList.add('visible');
    clearTimeout(box._timer);
    box._timer = setTimeout(() => box.classList.remove('visible'), 9000);
    box.onclick = () => box.classList.remove('visible');
}
