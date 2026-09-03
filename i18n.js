// Dungeonslayers 4 — schlanke UI-Übersetzung (Deutsch / Englisch)
//
// Schlüssel = deutscher Originaltext. Fehlt eine Übersetzung, bleibt Deutsch
// stehen — nichts kann dadurch "verschwinden". Bewusst NICHT übersetzt:
//   - Regeldaten: Talent-, Zauber-, Kreaturennamen und ihre Effekttexte
//     (data.js/talents.js/zauber.js/bestiarium.js) — das sind Regelwerksbegriffe
//   - die ausführlichen Hilfetexte (hilfe.js) — nur die Titel
//   - Spielleiter-Logzeilen im Detail, Discord-Posts, die Impressumsseite
//
// Zwei Wege ins UI:
//   1. t('deutscher Text')  — in Render-Funktionen um einzelne Strings gelegt
//   2. uebersetzeDOM()       — läuft nach jedem Render über die Textknoten und
//      ersetzt exakte Treffer aus dem Wörterbuch (fängt das statische
//      index.html und alles ab, wo kein t() drumherum steht)

const I18N_KEY = 'ds4_lang';
let LANG = 'de';
(function bestimmeSprache() {
    let ausUrl = null;
    try {
        const p = new URLSearchParams(location.search).get('lang');
        if (p === 'en' || p === 'de') ausUrl = p;
    } catch (e) { /* egal */ }
    try {
        const s = localStorage.getItem(I18N_KEY);
        if (ausUrl) { LANG = ausUrl; localStorage.setItem(I18N_KEY, ausUrl); }
        else if (s === 'en' || s === 'de') LANG = s;
        else if (/^en\b/i.test(navigator.language || '')) LANG = 'en';
    } catch (e) {
        if (ausUrl) LANG = ausUrl;
        else if (/^en\b/i.test(navigator.language || '')) LANG = 'en';
    }
})();
try { document.documentElement.lang = LANG; } catch (e) { /* head-Skript, <html> existiert schon */ }

// Übersetzung eines Strings. Bei 'de' bzw. fehlendem Eintrag: Original zurück.
function t(de) {
    if (LANG === 'de' || de == null) return de;
    const v = I18N_EN[de];
    return v === undefined ? de : v;
}

// Wie t(), aber mit {platzhaltern}:  tp('Stufe {n} erreicht', { n: 4 })
function tp(de, vars) {
    let s = t(de);
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
}

function aktuelleSprache() { return LANG; }

// Nach jedem großen Render aufrufen — übersetzt bzw. stellt Textknoten wieder her.
function domUebersetzen(root) { uebersetzeDOM(root || document.body); }

function spracheWechseln(lang) {
    if ((lang !== 'de' && lang !== 'en') || lang === LANG) return;
    LANG = lang;
    try { localStorage.setItem(I18N_KEY, lang); } catch (e) { /* egal */ }
    document.documentElement.lang = lang;
    // URL-Parameter mitziehen, damit Reload / geteilter Link die Wahl behält
    try {
        const u = new URL(location.href);
        u.searchParams.set('lang', lang);
        history.replaceState(null, '', u);
    } catch (e) { /* egal */ }
    // Erst neu rendern (dann greifen die t()-Aufrufe), dann die statischen Knoten.
    ['renderAll', 'renderCombat', 'renderGmDashboard', 'renderKartenWerkzeuge',
     'renderCombatModifiers'].forEach(fn => {
        if (typeof window[fn] === 'function') { try { window[fn](); } catch (e) {} }
    });
    uebersetzeDOM(document.body);
    metaFuerSprache();
    sprachschalterAktualisieren();
}

// --- Textknoten & Attribute im DOM übersetzen -----------------------------

const I18N_ATTRS = ['placeholder', 'title', 'aria-label'];
const I18N_SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1 };

function uebersetzeTextknoten(n) {
    const p = n.parentNode;
    if (!p || I18N_SKIP[p.nodeName]) return;
    if (LANG === 'en') {
        if (n.__i18nDe !== undefined) return; // schon übersetzt
        const roh = n.nodeValue;
        const key = roh.replace(/\s+/g, ' ').trim();
        if (!key) return;
        const tr = I18N_EN[key];
        if (tr === undefined || tr === key) return;
        n.__i18nDe = roh;
        n.nodeValue = roh.match(/^\s*/)[0] + tr + roh.match(/\s*$/)[0];
    } else if (n.__i18nDe !== undefined) {
        n.nodeValue = n.__i18nDe;
        delete n.__i18nDe;
    }
}

function uebersetzeDOM(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(uebersetzeTextknoten);

    I18N_ATTRS.forEach(attr => {
        const key = 'i18n_' + attr.replace(/-/g, '_');
        const treffer = root.querySelectorAll ? root.querySelectorAll('[' + attr + ']') : [];
        treffer.forEach(el => {
            if (LANG === 'en') {
                if (el.dataset[key] !== undefined) return;
                const roh = (el.getAttribute(attr) || '').trim();
                const tr = roh && I18N_EN[roh];
                if (tr === undefined || tr === roh) return;
                el.dataset[key] = roh;
                el.setAttribute(attr, tr);
            } else if (el.dataset[key] !== undefined) {
                el.setAttribute(attr, el.dataset[key]);
                delete el.dataset[key];
            }
        });
    });
}

// --- Sprachschalter -----------------------------------------------------

function sprachschalterAktualisieren() {
    document.querySelectorAll('[data-setlang]').forEach(b => {
        const an = b.dataset.setlang === LANG;
        b.classList.toggle('aktiv', an);
        b.setAttribute('aria-pressed', an ? 'true' : 'false');
    });
    document.querySelectorAll('[data-lang-toggle]').forEach(b => {
        b.textContent = LANG === 'de' ? '🌐 EN' : '🌐 DE';
        const label = LANG === 'de' ? 'Switch to English' : 'Auf Deutsch umstellen';
        b.setAttribute('aria-label', label);
        b.title = label;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = LANG;
    document.querySelectorAll('[data-setlang]').forEach(b => {
        b.addEventListener('click', () => spracheWechseln(b.dataset.setlang));
    });
    document.querySelectorAll('[data-lang-toggle]').forEach(b => {
        b.addEventListener('click', () => spracheWechseln(LANG === 'de' ? 'en' : 'de'));
    });
    if (LANG === 'en') uebersetzeDOM(document.body);
    metaFuerSprache();
    sprachschalterAktualisieren();
});

// Titel & Meta für die englische Variante — hilft der Auffindbarkeit bei Google,
// wenn ?lang=en gecrawlt wird (der Googlebot rendert das JavaScript).
const META_EN = {
    title: 'Slayer-Arsenal — free character sheet & game master tool for Dungeonslayers 4',
    description: 'Slayer-Arsenal is a free, browser-based toolkit for the Dungeonslayers 4 tabletop RPG: character sheet and generator, rules-accurate 1d20 dice roller with perfect rolls and fumbles, full talent and spell lists and a bestiary, plus a live game master dashboard with an initiative and combat tracker and a shared battlemap. English and German interface, no sign-up, no server.',
    ogTitle: 'Slayer-Arsenal — character sheet & GM tool for Dungeonslayers 4',
    ogDescription: 'Character sheet, combat tracker, battlemap and live multiplayer for Dungeonslayers 4 — in the browser, no account and no server.',
};
function metaFuerSprache() {
    const setMeta = (sel, val) => { const m = document.querySelector(sel); if (m && val) m.setAttribute('content', val); };
    if (LANG === 'en') {
        if (!document.documentElement.dataset.titelDe) document.documentElement.dataset.titelDe = document.title;
        document.title = META_EN.title;
        setMeta('meta[name="description"]', META_EN.description);
        setMeta('meta[property="og:title"]', META_EN.ogTitle);
        setMeta('meta[property="og:description"]', META_EN.ogDescription);
        setMeta('meta[property="og:locale"]', 'en_US');
        setMeta('meta[property="og:locale:alternate"]', 'de_DE');
    } else if (document.documentElement.dataset.titelDe) {
        document.title = document.documentElement.dataset.titelDe;
        // die deutschen Meta-Tags stehen so im HTML — bei Rückwechsel via Reload sauber;
        // für den Live-Wechsel reicht der Titel.
    }
}

// Für hilfe.js: Hinweis im EN-Modus, dass die Detail-Hilfe nur deutsch ist.
function hilfeNurDeutschHinweis() {
    return LANG === 'en'
        ? 'Note: the detailed help texts are only available in German for now.'
        : '';
}

// =========================================================================
// Wörterbuch  Deutsch -> Englisch   (UI-Rahmen, keine Regeldaten)
// =========================================================================
const I18N_EN = {
    // ---- Kopf / Grundnavigation ----
    'Charakterbogen · Kampf-Tracker · Battlemap für Dungeonslayers 4':
        'Character sheet · combat tracker · battlemap for Dungeonslayers 4',
    '🧙 Charakter erschaffen': '🧙 Create character',
    '📡 Multiplayer': '📡 Multiplayer',
    '💾 Speichern': '💾 Save',
    '📂 Laden': '📂 Load',
    '🗺️ Karte': '🗺️ Map',
    '👤 Beispiel': '👤 Example',
    '🗑️ Löschen': '🗑️ Delete',
    '📖 Regeln': '📖 Rules',
    '⚙️ Hausregeln': '⚙️ House rules',
    '❓ Hilfe': '❓ Help',
    'Bogen vollständig leeren': 'Wipe the sheet completely',
    'Steigerungskosten, Talentpunkte und eigene Inhalte': 'Advancement costs, talent points and custom content',
    'Kurzanleitung: was das Tool kann und wie': 'Quick guide: what the tool does and how',
    'Deine Lautstärke — gilt für Hinweistöne und das Soundboard des Spielleiters':
        'Your volume — applies to alert sounds and the GM soundboard',
    'Hilfe: Hinweistöne': 'Help: alert sounds',

    // ---- Panel: Charakter ----
    'Charakter': 'Character',
    'Hilfe: Charakterdaten': 'Help: character data',
    'Stufe 1': 'Level 1',
    'Bild wählen — erscheint beim Spielleiter und als Figur auf der Karte':
        'Choose an image — shown to the GM and as your token on the map',
    'Ein Bild deines Helden. Der Spielleiter sieht es auf seiner Übersicht, und auf der Karte wird deine Figur damit dargestellt.':
        "A picture of your hero. The GM sees it on their overview, and your token on the map uses it.",
    'Bild': 'Image',
    'Bild wählen': 'Choose image',
    'Entfernen': 'Remove',
    'Hilfe: Charakterbild': 'Help: character portrait',
    'Name': 'Name',
    'Spieler': 'Player',
    'Volk': 'Race',
    'Elf': 'Elf', 'Mensch': 'Human', 'Zwerg': 'Dwarf',
    'Klasse': 'Class',
    'Krieger': 'Warrior', 'Späher': 'Scout', 'Zauberwirker': 'Spellcaster',
    'Zauberwirker-Typ': 'Spellcaster type',
    'Heiler': 'Healer', 'Zauberer': 'Mage', 'Schwarzmagier': 'Warlock',
    'Heldenklasse (ab Stufe 10)': 'Hero class (level 10+)',
    'Heldenklasse (ab Stufe 2)': 'Hero class (level 2+)',
    'Erfahrungspunkte': 'Experience points',
    'Lernpunkte (offen)': 'Learning points (unspent)',
    'Talentpunkte (offen)': 'Talent points (unspent)',
    '⬆️ Stufenaufstieg / Punkte ausgeben': '⬆️ Level up / spend points',
    '⬆️ Stufenaufstieg': '⬆️ Level up',

    // ---- Panel: Attribute & Kampfwerte ----
    'Attribute & Eigenschaften': 'Attributes & traits',
    'Hilfe: Attribute': 'Help: attributes',
    'Körper': 'Body', 'Agilität': 'Agility', 'Geist': 'Mind',
    'Stärke': 'Strength', 'Härte': 'Toughness', 'Bewegung': 'Movement',
    'Geschick': 'Dexterity', 'Verstand': 'Intellect', 'Aura': 'Aura',
    'Kampfwerte': 'Combat values',
    'Hilfe: Kampfwerte': 'Help: combat values',
    'Klicken zum Würfeln': 'Click to roll',
    '⛶ Vollbild': '⛶ Fullscreen',
    'Einklappen': 'Collapse', 'Ausklappen': 'Expand',
    'Lebenskraft': 'Health',
    'Abwehr': 'Defense',
    'Initiative': 'Initiative',
    'Laufen': 'Move',
    'Schlagen': 'Melee',
    'Schießen': 'Ranged',
    'Zaubern': 'Spellcasting',
    'Zielzauber': 'Targeted spell',
    'Verschnaufen': 'Catch breath', 'Nachtruhe': "Night's rest", 'Voll': 'Full',
    'Erschöpft': 'Exhausted',

    // ---- Panel: Ausrüstung ----
    'Ausrüstung': 'Equipment',
    'Hilfe: Ausrüstung': 'Help: equipment',
    'Nahkampfwaffe': 'Melee weapon', 'Fernkampfwaffe': 'Ranged weapon',
    'Körperrüstung': 'Body armor', 'Helm': 'Helmet', 'Schienen': 'Greaves', 'Schild': 'Shield',
    'Rüstung': 'Armor', 'Waffe': 'Weapon', 'Schaden': 'Damage',
    '✨ Verbesserungen & Verzauberungen': '✨ Improvements & enchantments',
    'Münzen': 'Coins',
    'Gold': 'Gold', 'Silber': 'Silver', 'Kupfer': 'Copper',

    // ---- Panels: Talente / Zauber / Inventar / Notizen ----
    'Talente': 'Talents', '+ Talent': '+ Talent',
    'Hilfe: Talente': 'Help: talents',
    'Zaubersprüche': 'Spells', 'Zauber': 'Spells', '+ Zauber': '+ Spell',
    'Hilfe: Zauber': 'Help: spells',
    'Inventar': 'Inventory', '+ Gegenstand': '+ Item',
    'Hilfe: Inventar': 'Help: inventory',
    'Notizen': 'Notes',
    'Hilfe: Notizen': 'Help: notes',
    'Rang': 'Rank', 'Probe': 'Check', 'Wert': 'Value', 'Effekt': 'Effect',
    'Steigern': 'Raise', 'Senken': 'Lower',

    // ---- Gruppe & Kampf (Spielersicht) ----
    '👥 Gruppe & Kampf': '👥 Party & combat',
    '🤫 Flüstern': '🤫 Whisper',
    'Hilfe: Gruppe & Kampf': 'Help: party & combat',

    // ---- Würfelkasten ----
    'Würfel': 'Dice',
    'Hilfe: Würfeln': 'Help: rolling',
    '1W20 unterwürfeln': 'Roll 1d20 under',
    'Noch nicht gewürfelt': 'Not rolled yet',
    'Schwierigkeit (Modifikator)': 'Difficulty (modifier)',
    'Bonus/Malus für den nächsten Wurf': 'Bonus/penalty for the next roll',
    'Typische Probe': 'Standard check',
    'Würfeln': 'Roll', 'Würfeln!': 'Roll!',
    'Gebiet': 'Field',
    'Handwerksprobe — Attribut & Eigenschaft': 'Craft check — attribute & trait',
    'Freier Probenwert': 'Free check value',
    'Vergleichende Probe — Gegner-PW': 'Opposed check — opponent CV',
    'Vergleichen': 'Compare',
    'Beliebige Würfel': 'Arbitrary dice',
    'Blanker 1W20': 'Plain 1d20',
    'Routine': 'Routine', 'Sehr leicht': 'Very easy', 'Leicht': 'Easy', 'Normal': 'Normal',
    'Schwer': 'Hard', 'Sehr schwer': 'Very hard', 'Äußerst schwer': 'Extremely hard',
    'Immersieg!': 'Perfect roll!', 'Patzer!': 'Fumble!', 'Erfolg': 'Success', 'Misserfolg': 'Failure',

    // ---- Kampfmodifikatoren ----
    '⚔️ Kampfmodifikatoren': '⚔️ Combat modifiers',
    'Hilfe: Kampfmodifikatoren': 'Help: combat modifiers',
    'Distanz (m)': 'Distance (m)',
    'Runden gezielt': 'Rounds aimed',
    'Getümmel (Individuen)': 'Melee (individuals)',
    'Hindernisse dazwischen': 'Obstacles in between',
    'Ziel im Nahkampf': 'Target in melee',
    'ich liege': 'I am prone', 'Ziel liegt': 'Target is prone',
    'von der Seite': 'from the side', 'von hinten': 'from behind',
    'zwei Waffen': 'two weapons', 'Ziel wehrlos': 'Target defenseless',
    'Größenunterschied': 'Size difference', 'gleich groß': 'same size',
    'Zurücksetzen': 'Reset',
    'Kein Modifikator aktiv.': 'No modifier active.',
    '⚔️ Mehrere Gegner': '⚔️ Multiple opponents',
    'Log leeren': 'Clear log', 'Logbuch': 'Log',

    // ---- SL-Dashboard ----
    '🎲 Spielleiter-Dashboard': '🎲 Game master dashboard',
    'Spielleiter-Dashboard · Dungeonslayers 4': 'Game master dashboard · Dungeonslayers 4',
    'Raum-Code:': 'Room code:',
    '📡 Verbindung': '📡 Connection',
    '💾 Sitzung speichern': '💾 Save session',
    '📂 Sitzung laden': '📂 Load session',
    'Dashboard verlassen': 'Leave dashboard',
    '⚔️ Kampf & Initiative': '⚔️ Combat & initiative',
    'Reihenfolge: absteigende Initiative': 'Order: descending initiative',
    '🎲 Probe von allen': '🎲 Check from everyone',
    '✨ EP vergeben': '✨ Award XP',
    '0 verbunden': '0 connected',
    'Kampagnen-Notizen': 'Campaign notes',
    'Kampf starten': 'Start combat', '⚔️ Kampf starten': '⚔️ Start combat',
    'Kampf beenden': 'End combat', 'Kampf läuft': 'Combat running',
    'Nächster Zug': 'Next turn', 'Nächster Zug →': 'Next turn →', '← Zurück': '← Back',
    'Runde': 'Round',
    '+ Eigener Gegner': '+ Custom opponent', '+ Gegner': '+ Opponent',
    'Aus Bestiarium': 'From bestiary',
    'Spieler übernehmen': 'Pull in players',
    'Noch keine Teilnehmer. Gegner anlegen oder verbundene Spieler übernehmen.':
        'No participants yet. Add opponents or pull in connected players.',
    'Ziel...': 'Target...', 'Ziel': 'Target',
    'Angriff': 'Attack', 'Angreifen': 'Attack', 'Heilen': 'Heal', 'Flüstern': 'Whisper',
    'besiegt': 'defeated', 'bewusstlos': 'unconscious',
    '· Abw': '· Def', '· Schl': '· Mel', '· Ini': '· Ini',
    'Größe': 'Size', 'Rang': 'Rank', 'Gehört': 'Owner',
    '+ Zustand': '+ Status', '− LK': '− HP',
    'winzig': 'tiny', 'klein': 'small', 'groß': 'large',
    'riesig': 'huge', 'gewaltig': 'gigantic',
    'heroisch': 'heroic', 'episch': 'epic',
    'Zustand aufheben': 'Clear status',
    'Zustand hinzufügen (Vergiftet, Brennt, Liegend …)': 'Add a status (Poisoned, Burning, Prone …)',
    'Abwehr gegen Spielerangriff würfeln': 'Roll defense against a player attack',
    'Angriff — der Spieler würfelt seine Abwehr': 'Attack — the player rolls their defense',
    'Anstupsen — kurze Einblendung samt Ton, \'du bist dran\'': "Nudge — brief pop-up with a sound, 'your turn'",
    '📢 Ansage an alle': '📢 Announce to all',
    'SL-Würfel': 'GM dice', 'SL-Wurf': 'GM roll',
    'Wer sieht den Wurf?': 'Who sees the roll?',
    'alle Spieler': 'all players', 'verdeckt — nur ich': 'hidden — only me',
    'Probenwert (NSC/Monster)': 'Check value (NPC/monster)',
    'z.B. 2W6, 3W8+2': 'e.g. 2d6, 3d8+2',
    '1W20': '1d20',
    '🎵 Soundboard': '🎵 Soundboard',
    '🎧 Vorhören': '🎧 Preview', '▶ Für alle': '▶ For everyone',
    '🌙 Fade': '🌙 Fade', '⏹ Stop': '⏹ Stop', '⏹ Ausblenden': '⏹ Hide',
    'Gesamtlautstärke': 'Master volume',
    '(mischt und geht an alle)': '(mixes and goes to everyone)',
    '➕ Eigener Sound': '➕ Custom sound',
    '🖼️ Handout': '🖼️ Handout',
    '▶ Text zeigen': '▶ Show text', '🖼️ Bild zeigen': '🖼️ Show image',
    'Live-Log': 'Live log',
    '🖼️ Vom Spielleiter': '🖼️ From the game master',
    'Noch keine Spieler verbunden. Gib den Raum-Code weiter.':
        'No players connected yet. Share the room code.',
    'Sounds stoppen sich nicht gegenseitig — leg Regen als Kulisse drunter und spiel Kampf, Gong oder einen Schrei darüber.':
        'Sounds do not stop one another — lay rain underneath as ambience and play combat, a gong or a scream on top.',
    'Eigene Dateien (lizenzierte Musik, eigene Atmo …) bleiben nur auf diesem Gerät und gehen beim Abspielen direkt an die verbundenen Spieler — bis 20 MB.':
        'Your own files (licensed music, custom ambience …) stay on this device only and go straight to the connected players on playback — up to 20 MB.',
    'Ein Bild oder einen Textblock (Vorlesetext, Rätsel, Karte …) bei allen Spielern einblenden.':
        'Show an image or a block of text (read-aloud text, riddle, map …) to all players.',

    // ---- Karte ----
    'Hilfe: Karte': 'Help: map',
    'Raster': 'Grid', 'Nebel des Krieges': 'Fog of war', 'Figuren': 'Tokens',
    'Bild laden': 'Load image', 'Vollbild': 'Fullscreen', 'Schließen': 'Close',
    'Neue Karte': 'New map', 'Karte umbenennen': 'Rename map', 'Karte löschen': 'Delete map',
    'Aktive Karte': 'Active map', 'Diese Karte allen zeigen': 'Show this map to everyone',

    // ---- Multiplayer-Dialog ----
    'Als Spielleiter hosten': 'Host as game master',
    'Raum eröffnen': 'Open room',
    'Als Spieler beitreten': 'Join as player',
    'Beitreten': 'Join',
    'Raum-Code': 'Room code', 'Dein Name': 'Your name',
    '🤖 Discord-Anbindung': '🤖 Discord integration',
    'Webhook-URL': 'Webhook URL',
    'Würfe posten': 'Post rolls', 'Ereignisse posten': 'Post events',
    'Test senden': 'Send test',
    'Erweitert: TURN-Server': 'Advanced: TURN server',
    'Benutzer': 'User', 'Passwort': 'Password',
    'TURN speichern': 'Save TURN',
    'Direkte Peer-to-Peer-Verbindung über WebRTC. Keine Accounts, kein Server, keine Kosten.':
        'Direct peer-to-peer connection via WebRTC. No accounts, no server, no cost.',
    'Verbunden': 'Connected', 'Getrennt': 'Disconnected', 'Verbinde…': 'Connecting…',

    // ---- Assistent (Charaktererschaffung) ----
    '🧙 Charaktererschaffung': '🧙 Character creation',
    '1. Volk': '1. Race', '2. Klasse': '2. Class', '3. Attribute': '3. Attributes',
    '4. Eigenschaften': '4. Traits', '5. Boni': '5. Bonuses',
    '6. Ausrüstung': '6. Equipment', '7. Feinschliff': '7. Finishing touches',
    '✓ Charakter übernehmen': '✓ Apply character',
    'Das Volk bestimmt einen Eigenschaftsbonus und die Volksfähigkeiten.':
        'Your race determines a trait bonus and the racial abilities.',
    'Die Klasse bestimmt Bonus, Rüstungszugang und Steigerungskosten.':
        'Your class determines the bonus, armor access and advancement costs.',
    'Zauberwirker-Typ': 'Spellcaster type',
    'Jetzt kommen Volks- und Klassenbonus obendrauf — hier dürfen Eigenschaften erstmals über 4 steigen.':
        'Now the race and class bonus are added on top — here traits may exceed 4 for the first time.',
    'Als Zauberwirker startest du mit einem Zauberspruch der Stufe 1 — trage ihn nach dem Übernehmen im Zauber-Panel ein.':
        'As a spellcaster you start with one level-1 spell — add it in the spell panel after applying.',
    'Bitte ein Volk wählen.': 'Please choose a race.',
    'Bitte eine Klasse wählen.': 'Please choose a class.',
    'Bitte einen Zauberwirker-Typ wählen.': 'Please choose a spellcaster type.',
    'Bitte den Volksbonus wählen.': 'Please choose the race bonus.',
    'Bitte den Klassenbonus wählen.': 'Please choose the class bonus.',
    'keine': 'none', 'keins': 'none', 'keine Kreatur gefunden.': 'no creature found.',

    // ---- gemeinsame Knöpfe ----
    'Weiter →': 'Next →', 'Fertig': 'Done', 'Abbrechen': 'Cancel',
    '👤 Beispielcharakter laden': '👤 Load example character',
    '⭐ Talent wählen': '⭐ Choose talent',
    '✨ Zauber lernen': '✨ Learn spell',
    '👹 Bestiarium': '👹 Bestiary',
    '📖 Regel-Spickzettel': '📖 Rules cheat sheet',
    '❓ Hilfe & Kurzanleitung': '❓ Help & quick guide',
    'Übernehmen': 'Apply', 'Speichern': 'Save',
    'Suchen…': 'Search…', 'Suche…': 'Search…', 'Filter': 'Filter',
    'Auf Regelwerk zurücksetzen': 'Reset to rulebook',
    '📤 An Spieler senden': '📤 Send to players',
    '💾 Als Datei': '💾 As file',

    // ---- Hausregeln-Dialog ----
    'Steigerungskosten': 'Advancement costs',
    'Talentpunkte-Verteilung': 'Talent point distribution',
    'Slayerpunkte': 'Slayer points', 'Slayende Würfel': 'Slaying dice',
    'Heldenklassen': 'Hero classes',
    'Eigene Talente': 'Custom talents', 'Eigene Zauber': 'Custom spells',
    'Eigene Heldenklassen': 'Custom hero classes',
    'An die Runde synchronisieren': 'Sync to the group',

    // ---- Hinweistexte in den Panels ----
    'Erschaffung: 20 Punkte auf die Attribute (max. 8 je Attribut), 8 Punkte auf die Eigenschaften (max. 4 je Eigenschaft) — Volks- und Klassenbonus kommen danach obendrauf.':
        'Creation: 20 points on the attributes (max. 8 each), 8 points on the traits (max. 4 each) — race and class bonus are added on top afterwards.',
    'Der Bonus fließt direkt in Schlagen, Schießen und Abwehr ein. Die Notiz ist frei — für eingebettete Zauber, freie Aktionen oder was das Stück sonst kann. Für die Rüstzeit zählen magische Boni nicht mit (Regelwerk S.44).':
        'The bonus flows straight into Melee, Ranged and Defense. The note is free-form — for embedded spells, free actions or whatever else the piece can do. Magical bonuses do not count towards donning time (rulebook p.44).',
    'Noch keine Talente gewählt. Bei der Erschaffung gibt es 1 Talentpunkt (Menschen 2).':
        'No talents chosen yet. Creation grants 1 talent point (humans 2).',
    'Jeder Rang kostet 1 Talentpunkt. Die Auswahl zeigt nur Talente, die deine Klasse auf deiner Stufe lernen darf — Höchstränge werden erzwungen.':
        'Each rank costs 1 talent point. The list only shows talents your class may learn at your level — maximum ranks are enforced.',
    'Startausrüstung: einfache Kleidung, Feuerstein & Zunder, Wasserschlauch, Decke, Rucksack, 2× Heilkraut, 10 Goldmünzen.':
        'Starting equipment: simple clothes, flint & tinder, waterskin, blanket, backpack, 2× healing herb, 10 gold coins.',
    'wird nach dem Wurf geleert': 'cleared after the roll',
    'Z.B. 2W6, 3W8+2': 'e.g. 2d6, 3d8+2',

    // ---- Fußzeile: Zusatz / Attribution ----
    'Dies ist ein inoffizielles Fan-Projekt von': 'This is an unofficial fan project by',
    'und steht in keiner Verbindung zu Christian Kennig oder dem Burning Books Verlag.':
        'and is not affiliated with Christian Kennig or Burning Books Verlag.',
    'Entwickelt von': 'Developed by',
    'Repository auf GitHub': 'Repository on GitHub',
    'Am Tisch getestet von': 'Playtested by',
    'Das Pen-&-Paper-Regelsystem': 'The pen & paper rules system',
    'wurde geschaffen von': 'was created by',
    '; seine Texte und Regelmechaniken unterliegen der': '; its texts and rules mechanics are licensed under',
    'Lizenz. Das Regelwerk gibt es kostenlos unter': '. The rulebook is available for free at',
    'Impressum & Datenschutz': 'Legal notice & privacy',
    'In English': 'In English',

    // ---- längere Absätze (Footer) ----
    'Enthalten sind die vollständigen Talent- und Zauberlisten sowie das Bestiarium aus dem Regelwerk. Charaktere lassen sich als Datei speichern und weitergeben. Es braucht keine Anmeldung, keinen Server und keine Installation.':
        'It includes the full talent and spell lists plus the bestiary from the rulebook. Characters can be saved to a file and passed around. No sign-up, no server, no installation.',
};
