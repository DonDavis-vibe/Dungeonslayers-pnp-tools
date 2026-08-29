// Dungeonslayers 4 — kurze Hinweistöne für Ereignisse, die man sonst leicht
// verpasst, allen voran: dass überhaupt ein Kampf begonnen hat. Sechs Dateien,
// je 1-3 Sekunden. Herkunft und Lizenz stehen in sounds/README.md.
//
// Bewusst mit <audio>-Elementen statt Web Audio API: einfacher, und für
// kurze One-Shot-Sounds reicht das. Browser blockieren Autoplay nur vor der
// ersten Nutzerinteraktion — Multiplayer beizutreten/zu eröffnen ist selbst
// schon ein Klick, danach spielt die Wiedergabe anstandslos.

const SOUND_STUMM_KEY = 'ds4_sound_stumm';

const SOUND_DATEIEN = {
    'kampf-beginnt': 'sounds/kampf-beginnt.mp3',
    'dein-zug': 'sounds/dein-zug.mp3',
    'schaden': 'sounds/schaden.mp3',
    'heilung': 'sounds/heilung.mp3',
    'fluestern': 'sounds/fluestern.mp3',
    'ansage': 'sounds/ansage.mp3'
};

let soundStumm = false;
try { soundStumm = localStorage.getItem(SOUND_STUMM_KEY) === '1'; } catch (e) { /* Speicher evtl. blockiert */ }

function spielSound(name) {
    if (soundStumm) return;
    const pfad = SOUND_DATEIEN[name];
    if (!pfad) return;
    try {
        const audio = new Audio(pfad);
        audio.volume = 0.6 * getGeraetLautstaerke();
        // Blockiertes Autoplay oder eine fehlende Datei sind kein Absturzgrund
        audio.play().catch(() => {});
    } catch (e) { /* im Zweifel einfach keinen Ton */ }
}

// --- Soundboard des Spielleiters ------------------------------------------
//
// Kurze Effekte liegen als CC0-Dateien von Kenney (kenney.nl) im Repo unter
// sounds/soundboard/ — siehe die LIZENZ.txt dort. Die langen Kulissen- und
// Musikstücke (Regen, Taverne, Bosskampf …) wären zu groß fürs Repo und
// werden von der GitHub-Pages-Seite des Schwesterprojekts "How to be a Hero"
// geladen (gleicher Autor). Ein Eintrag mit http(s) ist extern, alles andere
// liegt lokal unter sounds/soundboard/.
const SOUNDBOARD_EXTERN = 'https://dondavis-vibe.github.io/how-to-be-a-hero-character-sheet/';

const SOUNDBOARD = {
    'Reaktionen': [
        { id: 'erfolg',    name: 'Erfolg (Fanfare)',        quelle: 'fanfare-kurz.ogg' },
        { id: 'patzer',    name: 'Patzer (Sad Trombone)',   quelle: 'assets/sound/fail.mp3' },
        { id: 'stich',     name: 'Dramatischer Stich',      quelle: 'stich-dramatisch.ogg' },
        { id: 'heimlich',  name: 'Heimlich / Verpatzt',     quelle: 'pizzicato-heimlich.ogg' },
        { id: 'beute',     name: 'Beute (Münzen)',          quelle: 'muenzen.ogg' },
        { id: 'schrei',    name: 'Schmerzensschrei',        quelle: 'assets/sounds/wilhelm.webm' }
    ],
    'Kulisse': [
        { id: 'regen',     name: 'Regen & Gewitter',        quelle: 'assets/sounds/rain.webm' },
        { id: 'donner',    name: 'Donnerschlag',            quelle: 'assets/sounds/thunder_hit.wav' },
        { id: 'taverne',   name: 'Taverne / Menschenmenge', quelle: 'assets/sounds/menschen.mp3' },
        { id: 'lagerfeuer',name: 'Wald & Lagerfeuer',       quelle: 'assets/sounds/campfire.webm' },
        { id: 'grillen',   name: 'Grillen (Nachtlager)',    quelle: 'assets/sounds/crickets.webm' },
        { id: 'gruft',     name: 'Spukhaus / Gruft',        quelle: 'assets/sounds/spooky.webm' }
    ],
    'Dungeon': [
        { id: 'tuer_auf',  name: 'Tür öffnet sich',         quelle: 'tuer-auf.ogg' },
        { id: 'tuer_zu',   name: 'Tür fällt zu',            quelle: 'tuer-zu.ogg' },
        { id: 'knarren',   name: 'Türknarren',              quelle: 'knarren.ogg' },
        { id: 'riegel',    name: 'Riegel / Schloss',        quelle: 'riegel.ogg' },
        { id: 'buch',      name: 'Buch aufschlagen',        quelle: 'buch.ogg' },
        { id: 'gitter',    name: 'Zellentür / Fallgitter',  quelle: 'assets/sounds/prison_door.wav' },
        { id: 'glas',      name: 'Glas zersplittert',       quelle: 'assets/sounds/glass_break.wav' }
    ],
    'Kampf & Magie': [
        { id: 'klinge',    name: 'Klinge ziehen',           quelle: 'klinge-ziehen.ogg' },
        { id: 'zischt',    name: 'Klinge zischt',           quelle: 'klinge-zischt.ogg' },
        { id: 'hieb',      name: 'Wuchtiger Hieb',          quelle: 'hieb.ogg' },
        { id: 'kampf',     name: 'Schwertkampf (Kulisse)',  quelle: 'assets/sounds/combat.webm' },
        { id: 'magie',     name: 'Zauber wirkt',            quelle: 'assets/sounds/magic.webm' },
        { id: 'explosion', name: 'Explosion / Feuerball',   quelle: 'assets/sounds/explosion_close.mp3' },
        { id: 'galopp',    name: 'Pferdegalopp',            quelle: 'assets/sounds/horse_gallop.wav' }
    ],
    'Tisch-Kontrolle': [
        { id: 'gong',      name: 'Gong / Glocke',           quelle: 'assets/sounds/bell.webm' },
        { id: 'spannung',  name: 'Spannung (Boom)',         quelle: 'assets/sounds/suspense.webm' },
        { id: 'szene',     name: 'Szenenwechsel (Whoosh)',  quelle: 'assets/sounds/whoosh_transition.wav' }
    ],
    'Musik': [
        { id: 'm_spannung', name: 'Dunkle Spannung',        quelle: 'assets/sounds/tension.webm' },
        { id: 'm_boss',     name: 'Bosskampf (Orchester)',  quelle: 'assets/sounds/boss.webm' },
        { id: 'm_mystery',  name: 'Ermittlung / Rätsel',    quelle: 'assets/sounds/music_mystery.mp3' },
        { id: 'm_horror',   name: 'Horror (Klavier)',       quelle: 'assets/sounds/music_horror.mp3' },
        { id: 'm_erkundung',name: 'Erkundung (Ambient)',    quelle: 'assets/sounds/music_exploration.mp3' },
        { id: 'm_traurig',  name: 'Trauer (Piano)',         quelle: 'assets/sounds/sad.webm' },
        { id: 'm_taverne',  name: 'Tavernen-Musik',         quelle: 'assets/sounds/medieval.webm' },
        { id: 'm_triumph',  name: 'Triumph (Sieg)',         quelle: 'assets/sounds/music_triumph.mp3' }
    ]
};

function soundboardEintrag(id) {
    for (const gruppe of Object.values(SOUNDBOARD)) {
        const s = gruppe.find(x => x.id === id);
        if (s) return s;
    }
    return null;
}

// Volle URL zu einem Soundboard-Eintrag: lokale Dateien liegen unter
// sounds/soundboard/, alles mit http(s) davor kommt von der externen Seite.
function soundboardUrl(s) {
    if (!s || !s.quelle) return null;
    if (/^https?:/.test(s.quelle)) return s.quelle;
    if (s.quelle.indexOf('/') !== -1) return SOUNDBOARD_EXTERN + s.quelle; // assets/... vom Schwesterprojekt
    return 'sounds/soundboard/' + s.quelle;
}

function soundboardName(id) {
    const s = soundboardEintrag(id);
    return s ? s.name : id;
}

// Lautstärke dieses Geräts (der Regler neben dem 🔊). Er legt sich als
// Gesamtpegel über das, was der Spielleiter mitschickt — SL-Pegel × Geräte-
// Pegel. Bewusst nur im localStorage: eine Geräteeinstellung, kein
// Charakterwert, gehört nicht in die exportierte JSON.
const LAUTSTAERKE_KEY = 'ds4_lautstaerke';
let geraetLautstaerke = 1;
try {
    const v = parseFloat(localStorage.getItem(LAUTSTAERKE_KEY));
    if (!isNaN(v)) geraetLautstaerke = Math.max(0, Math.min(1, v));
} catch (e) { /* localStorage evtl. blockiert */ }

function getGeraetLautstaerke() { return geraetLautstaerke; }

function setGeraetLautstaerke(wert) {
    geraetLautstaerke = Math.max(0, Math.min(1, parseFloat(wert) || 0));
    try { localStorage.setItem(LAUTSTAERKE_KEY, String(geraetLautstaerke)); } catch (e) { /* egal */ }
    laufendeSounds.forEach(a => pegelAnwenden(a, a.slPegel));
    document.querySelectorAll('[data-lautstaerke-slider]').forEach(s => { s.value = geraetLautstaerke; });
}

let laufendeSounds = [];

function pegelAnwenden(audio, slPegel) {
    const sl = (typeof slPegel === 'number' && !isNaN(slPegel)) ? slPegel : 0.7;
    audio.slPegel = sl;
    audio.volume = Math.max(0, Math.min(1, sl * getGeraetLautstaerke()));
}

// Einen Soundboard-Klang abspielen (beim SL beim Vorhören/Auslösen, beim
// Spieler auf Ansage des SL). slPegel ist der Wert des SL-Reglers.
function soundboardAbspielen(id, slPegel) {
    if (soundStumm) return;
    const url = soundboardUrl(soundboardEintrag(id));
    if (!url) return;
    try {
        const audio = new Audio(url);
        pegelAnwenden(audio, typeof slPegel === 'number' ? slPegel : 0.7);
        audio.play().catch(() => {});
        laufendeSounds.push(audio);
        audio.addEventListener('ended', () => { laufendeSounds = laufendeSounds.filter(a => a !== audio); });
    } catch (e) { /* kein Ton, kein Drama */ }
}

function soundboardStop() {
    laufendeSounds.forEach(a => { a.pause(); a.currentTime = 0; });
    laufendeSounds = [];
}

function soundboardFade() {
    const raus = laufendeSounds;
    laufendeSounds = [];
    raus.forEach(audio => {
        const start = audio.volume;
        const schritte = 30;
        let i = 0;
        const iv = setInterval(() => {
            i++;
            audio.volume = Math.max(0, start * (1 - i / schritte));
            if (i >= schritte) { clearInterval(iv); audio.pause(); audio.currentTime = 0; }
        }, 100);
    });
}

// Der SL hat seinen Gesamtregler verschoben — laufende Sounds nachziehen.
function soundboardPegelSetzen(slPegel) {
    laufendeSounds.forEach(a => pegelAnwenden(a, slPegel));
}

// Auswahlliste im SL-Dashboard mit Gruppen füllen
function renderSoundboardAuswahl() {
    const sel = document.getElementById('sl-sound-auswahl');
    if (!sel) return;
    sel.innerHTML = Object.entries(SOUNDBOARD).map(([gruppe, sounds]) =>
        `<optgroup label="${gruppe}">` +
        sounds.map(s => `<option value="${s.id}">${s.name}</option>`).join('') +
        `</optgroup>`
    ).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    renderSoundboardAuswahl();
    document.querySelectorAll('[data-lautstaerke-slider]').forEach(s => { s.value = geraetLautstaerke; });
});

function soundStummUmschalten() {
    soundStumm = !soundStumm;
    try { localStorage.setItem(SOUND_STUMM_KEY, soundStumm ? '1' : '0'); } catch (e) { /* blockiert */ }
    renderSoundKnopf();
}

function renderSoundKnopf() {
    document.querySelectorAll('[data-sound-knopf]').forEach(btn => {
        btn.textContent = soundStumm ? '🔇' : '🔊';
        btn.title = soundStumm
            ? 'Sounds sind stumm — klicken zum Einschalten'
            : 'Sounds sind an — klicken zum Stummschalten';
    });
}

document.addEventListener('DOMContentLoaded', renderSoundKnopf);
