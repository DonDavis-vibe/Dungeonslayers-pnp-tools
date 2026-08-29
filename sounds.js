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
// Die Ambient-Tracks und Effekte liegen im Schwesterprojekt "How to be a Hero"
// (gleicher Autor) und werden von dessen GitHub-Pages-Seite geladen — so bleibt
// das DS4-Repo schlank. Rechtliches dazu steht dort: nicht-kommerzielles
// Fan-Projekt, Entfernung einzelner Dateien auf Anfrage. Ausgewählt ist nur,
// was zu einem Fantasy-Dungeon passt.
const SOUNDBOARD_BASIS = 'https://dondavis-vibe.github.io/how-to-be-a-hero-character-sheet/';

const SOUNDBOARD = {
    'Reaktionen': [
        { id: 'erfolg',    name: 'Erfolg (Fanfare)',        datei: 'assets/sound/crit.mp3' },
        { id: 'patzer',    name: 'Patzer (Sad Trombone)',   datei: 'assets/sound/fail.mp3' },
        { id: 'schrei',    name: 'Schmerzensschrei',        datei: 'assets/sounds/wilhelm.webm' },
        { id: 'wendung',   name: 'Überraschende Wendung',   datei: 'assets/sounds/dramatic.webm' },
        { id: 'beute',     name: 'Beute (Münzen)',          datei: 'assets/sounds/loot5.webm' }
    ],
    'Kulisse': [
        { id: 'regen',     name: 'Regen & Gewitter',        datei: 'assets/sounds/rain.webm' },
        { id: 'donner',    name: 'Donnerschlag',            datei: 'assets/sounds/thunder_hit.wav' },
        { id: 'taverne',   name: 'Taverne / Menschenmenge', datei: 'assets/sounds/menschen.mp3' },
        { id: 'lagerfeuer',name: 'Wald & Lagerfeuer',       datei: 'assets/sounds/campfire.webm' },
        { id: 'grillen',   name: 'Grillen (Nachtlager)',    datei: 'assets/sounds/crickets.webm' },
        { id: 'gruft',     name: 'Spukhaus / Gruft',        datei: 'assets/sounds/spooky.webm' }
    ],
    'Dungeon': [
        { id: 'tuer',      name: 'Türknarren',              datei: 'assets/sounds/door_creak.wav' },
        { id: 'gitter',    name: 'Zellentür / Fallgitter',  datei: 'assets/sounds/prison_door.wav' },
        { id: 'glas',      name: 'Glas zersplittert',       datei: 'assets/sounds/glass_break.wav' },
        { id: 'klopfen',   name: 'Lautes Klopfen',          datei: 'assets/sounds/knock.webm' },
        { id: 'uhr',       name: 'Tickendes Uhrwerk',       datei: 'assets/sounds/clock.webm' }
    ],
    'Kampf & Magie': [
        { id: 'kampf',     name: 'Schwertkampf',            datei: 'assets/sounds/combat.webm' },
        { id: 'schwert',   name: 'Klinge ziehen',           datei: 'assets/sounds/sword_draw.wav' },
        { id: 'magie',     name: 'Zauber wirkt',            datei: 'assets/sounds/magic.webm' },
        { id: 'explosion', name: 'Explosion / Feuerball',   datei: 'assets/sounds/explosion_close.mp3' },
        { id: 'galopp',    name: 'Pferdegalopp',            datei: 'assets/sounds/horse_gallop.wav' }
    ],
    'Tisch-Kontrolle': [
        { id: 'gong',      name: 'Gong / Glocke',           datei: 'assets/sounds/bell.webm' },
        { id: 'spannung',  name: 'Spannung (Boom)',         datei: 'assets/sounds/suspense.webm' },
        { id: 'szene',     name: 'Szenenwechsel (Whoosh)',  datei: 'assets/sounds/whoosh_transition.wav' }
    ],
    'Musik': [
        { id: 'm_spannung', name: 'Dunkle Spannung',        datei: 'assets/sounds/tension.webm' },
        { id: 'm_boss',     name: 'Bosskampf (Orchester)',  datei: 'assets/sounds/boss.webm' },
        { id: 'm_mystery',  name: 'Ermittlung / Rätsel',    datei: 'assets/sounds/music_mystery.mp3' },
        { id: 'm_horror',   name: 'Horror (Klavier)',       datei: 'assets/sounds/music_horror.mp3' },
        { id: 'm_erkundung',name: 'Erkundung (Ambient)',    datei: 'assets/sounds/music_exploration.mp3' },
        { id: 'm_traurig',  name: 'Trauer (Piano)',         datei: 'assets/sounds/sad.webm' },
        { id: 'm_taverne',  name: 'Tavernen-Musik',         datei: 'assets/sounds/medieval.webm' },
        { id: 'm_triumph',  name: 'Triumph (Sieg)',         datei: 'assets/sounds/music_triumph.mp3' }
    ]
};

function soundboardEintrag(id) {
    for (const gruppe of Object.values(SOUNDBOARD)) {
        const s = gruppe.find(x => x.id === id);
        if (s) return s;
    }
    return null;
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
    const s = soundboardEintrag(id);
    if (!s) return;
    try {
        const audio = new Audio(SOUNDBOARD_BASIS + s.datei);
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
