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
    ['populateStaticSelects', 'renderAll', 'renderCombat', 'renderGmDashboard',
     'renderKartenWerkzeuge', 'renderCombatModifiers', 'refreshBoundInputs'].forEach(fn => {
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
        const label = LANG === 'de' ? 'Auf Englisch umstellen' : 'Switch to German';
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
    'Volksbonus': 'Race bonus', 'Klassenbonus': 'Class bonus',
    'Verteilt:': 'Assigned:', 'Übrig:': 'Left:',
    'Verteile <strong>{n} Punkte</strong> auf die drei Attribute. Kein Attribut darf über <strong>{max}</strong> liegen.':
        'Distribute <strong>{n} points</strong> across the three attributes. No attribute may exceed <strong>{max}</strong>.',
    'Verteile <strong>{n} Punkte</strong> auf die sechs Eigenschaften. Höchstens <strong>{max}</strong> je Eigenschaft — 0 ist erlaubt. Volks- und Klassenbonus kommen im nächsten Schritt obendrauf.':
        'Distribute <strong>{n} points</strong> across the six traits. At most <strong>{max}</strong> per trait — 0 is allowed. Race and class bonus come on top in the next step.',
    'Name des Helden': "Hero's name",
    'Übersicht': 'Overview',
    'EP': 'XP', 'TP': 'TP',
    'Namenloser Held': 'Nameless hero',
    'Als Zauberwirker startest du mit einem Zauberspruch der Stufe 1 — trage ihn nach dem Übernehmen im Zauber-Panel ein.':
        'As a spellcaster you start with one level-1 spell — add it in the spell panel after applying.',
    'Bitte ein Volk wählen.': 'Please choose a race.',
    'Bitte eine Klasse wählen.': 'Please choose a class.',
    'Bitte einen Zauberwirker-Typ wählen.': 'Please choose a spellcaster type.',
    'Bitte den Volksbonus wählen.': 'Please choose the race bonus.',
    'Bitte den Klassenbonus wählen.': 'Please choose the class bonus.',
    'keine': 'none', 'keins': 'none', 'keine Kreatur gefunden.': 'no creature found.',
    'Bonus:': 'Bonus:',

    // Klassen-Rollen und Volks-Eigenheiten (kurze Beschreibungen im Assistenten)
    'Nahkampf-Frontkämpfer': 'Melee front-line fighter',
    'Fernkampf / Schleichen / Skirmish': 'Ranged / stealth / skirmish',
    'Magie': 'Magic',
    'Heilung & Unterstützung': 'Healing & support',
    'Offensiv- & Defensivmagie': 'Offensive & defensive magic',
    'Offensivmagie': 'Offensive magic',
    'Leichtfüßig: +2 auf Schleichen-Proben': 'Light-footed: +2 on stealth checks',
    'Nachtsicht: sieht auch bei Dunkelheit klar': 'Night vision: sees clearly in darkness',
    'Unsterblich: altert kaum, stirbt nur durch Gewalt':
        'Immortal: barely ages, dies only by violence',
    '+1 zusätzlicher Talentpunkt bei Erschaffung (insgesamt 2 TP statt 1)':
        '+1 extra talent point at creation (2 TP total instead of 1)',
    'Dunkelsicht: sieht auch im Dunkeln': 'Dark vision: sees in the dark',
    'Langlebig: Alterungsprozess ab Erwachsenwerden verlangsamt':
        'Long-lived: aging slows from adulthood on',
    'Zäh: +1 auf Abwehr': 'Tough: +1 to Defense',

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

    // ---- Willkommensfenster ----
    '👋 Willkommen im Slayer-Arsenal': '👋 Welcome to Slayer-Arsenal',
    '👤 Beispiel ansehen': '👤 View example',
    'Erstmal umschauen': 'Just look around',

    // Die knappen Regelwerks-Kürzel (ST, HÄ, GEI+VE, KÖR+ST+WB …) bleiben wie
    // Talent-/Zaubernamen stehen — sie sitzen jeweils neben dem ausgeschriebenen,
    // übersetzten Wert und sind Regelwerks-Shorthand, keine UI-Beschriftung.

    // ---- Kampfmodifikatoren: Größenunterschied-Auswahl ----
    'Gegner 1 Kategorie größer (+2)': 'Opponent 1 category larger (+2)',
    'Gegner 2 Kategorien größer (+4)': 'Opponent 2 categories larger (+4)',
    'Gegner 1 Kategorie kleiner (−2)': 'Opponent 1 category smaller (−2)',
    'Gegner 2 Kategorien kleiner (−4)': 'Opponent 2 categories smaller (−4)',

    // ---- Zauber-Panel ----
    'Bekannte Zauber:': 'Known spells:',
    'Nur ein Zauber kann vorbereitet sein': 'Only one spell can be prepared',
    'Noch keine Zauber. Zauberwirker starten mit einem Zauber der Stufe 1.':
        'No spells yet. Spellcasters start with one level-1 spell.',
    'vorbereitet': 'prepared', 'vorbereiten': 'prepare', 'Abklingzeit': 'Cooldown',

    // ---- Kartenwerkzeuge / Hinweise ----
    'Mausrad zoomt · deine Figur ziehen meldet einen Zug beim Spielleiter an':
        'Scroll wheel zooms · dragging your token proposes a move to the GM',
    '🔓 Züge frei': '🔓 Moves free', '🔒 Züge prüfen': '🔒 Confirm moves',
    'Figuren leeren': 'Clear tokens',
    '✋ Bewegen': '✋ Pan', '📏 Messen': '📏 Measure', 'Einpassen': 'Fit',
    'Noch keine Würfe.': 'No rolls yet.',
    'Aus: jeder Spielerzug muss bestätigt werden. An: Spieler bewegen ihre Figur frei — praktisch außerhalb des Kampfes.':
        'Off: every player move must be confirmed. On: players move their token freely — handy outside combat.',
    'Einzelne Gegner vor den Spielern verbergen': 'Hide individual opponents from the players',

    // ---- Tooltips / title-Attribute (statisches index.html) ----
    'Auf Deutsch umstellen': 'Switch to German',
    'Hilfe: Attribute und Eigenschaften': 'Help: attributes & traits',
    'Bei der Erschaffung werden 8 Punkte verteilt': '8 points are distributed at creation',
    'Hilfe: Lebenskraft und Rasten': 'Help: health & resting',
    'Nach dem Kampf: die Hälfte der im Kampf verlorenen LK zurück':
        'After combat: recover half of the HP lost during that combat',
    '24 Stunden: 1W20/2 LK zurück (+1 je 4h Bettruhe)':
        '24 hours: recover 1d20/2 HP (+1 per 4h of bed rest)',
    'Abwehr-Probe würfeln (PW 0)': 'Roll a Defense check (CV 0)',
    'Schlagen-Probe würfeln (PW 0)': 'Roll a Melee check (CV 0)',
    'Schießen-Probe würfeln (PW 0)': 'Roll a Ranged check (CV 0)',
    'Hilfe: Zaubersprüche': 'Help: spells',
    'Hilfe: Gruppe und Kampf': 'Help: party & combat',
    'Nur der Spielleiter sieht die Nachricht': 'Only the GM sees the message',
    'Hilfe: Bonus/Malus für den nächsten Wurf': 'Help: bonus/penalty for the next roll',
    'Zählt einmalig zum nächsten Wurf und stellt sich danach zurück — für aktives Parade, einen Vertrauten in Reichweite, Gegenstände mit begrenztem Effekt oder eine Ansage des Spielleiters.':
        'Applies once to the next roll and resets afterwards — for active parry, a familiar in range, items with a limited effect, or a GM ruling.',
    'Hilfe: Proben würfeln': 'Help: rolling checks',
    'Das Regelwerk legt für Handwerksproben keine feste Formel fest — Attribut und Eigenschaft bestimmt die Spielleitung.':
        'The rulebook sets no fixed formula for craft checks — the GM picks the attribute and trait.',
    'Beide Seiten würfeln; die höhere gelungene Probe gewinnt':
        'Both sides roll; the higher successful check wins',
    'Hilfe: Beliebige Würfel': 'Help: arbitrary dice',
    '+2 je Runde, höchstens +10': '+2 per round, up to +10',
    'Blindlings in eine Menge schießen: +1 je Individuum (max. +20). Das Ziel bestimmt der Zufall, der Schaden wird auf den normalen Höchstschaden gedeckelt.':
        'Firing blindly into a crowd: +1 per individual (max. +20). The target is random, damage is capped at normal maximum damage.',
    '−1 je Baum, Gegner, Kamerad oder Wandstück, an dem vorbeigeschossen wird':
        '−1 per tree, opponent, ally or piece of wall the shot passes',
    '−10, durch das Talent gemildert': '−10, reduced by the talent',
    'Gefesselte oder schlafende Gegner: doppelter Schaden im Nahkampf, Abwehr ohne Rüstung':
        'Bound or sleeping opponents: double damage in melee, defense without armor',
    'Den Schlagen-Wert auf bis zu vier angrenzende Gegner aufteilen (Regelwerk S.43)':
        'Split the Melee value across up to four adjacent opponents (rulebook p.43)',
    'Hilfe: Mehrere Gegner': 'Help: multiple opponents',
    'Raum-Code, Verbindung und Discord-Anbindung': 'Room code, connection and Discord integration',
    'Regeln der Runde festlegen und verteilen': 'Set the group rules and share them',
    'Notizen, Kampf und Karte als Datei sichern': 'Save notes, combat and map as a file',
    'Hilfe: Sitzung speichern und laden': 'Help: save & load session',
    'Kurzanleitung für das Dashboard': 'Quick guide for the dashboard',
    'Deine Lautstärke': 'Your volume',
    'Hilfe: Kampf und Initiative': 'Help: combat & initiative',
    'Hilfe: SL-Würfel': 'Help: GM dice',
    'Nur du hörst es': 'Only you hear it',
    'Bei allen verbundenen Spielern abspielen': 'Play for all connected players',
    'Ein Fanwerk zu Dungeonslayers — zu den Fanwerk-Richtlinien':
        'A fan work for Dungeonslayers — to the fan-work guidelines',
    'Das letzte Handout erneut anzeigen': 'Show the last handout again',
    'Hilfe: Regel-Spickzettel': 'Help: rules cheat sheet',
    'Hilfe: Multiplayer': 'Help: multiplayer',
    'Hilfe: Discord-Anbindung': 'Help: Discord integration',
    'Hilfe: Charakterbild': 'Help: character portrait',
    'Hilfe: Talente': 'Help: talents',
    'Hilfe: Inventar': 'Help: inventory',
    'Hilfe: Notizen': 'Help: notes',
    'Hilfe: Karte': 'Help: map',
    'Hilfe: Hinweistöne': 'Help: alert sounds',
    'Sounds sind an — klicken zum Stummschalten': 'Sounds are on — click to mute',
    'Sounds sind aus — klicken zum Einschalten': 'Sounds are off — click to unmute',
    'z.B. Flammenklinge, 1× Feuerstrahl pro Kampf': 'e.g. flame blade, 1× fire ray per combat',
    'Text für die Spieler …': 'Text for the players …',
    'Nötig, wenn beide Seiten hinter strengem NAT sitzen (Mobilfunk, Firmennetz).':
        'Needed when both sides are behind strict NAT (mobile network, corporate network).',
    'TURN-URL': 'TURN URL',

    // ---- Talent-Auswahl ----
    'Talent suchen...': 'Search talents...',
    'auch noch nicht erreichbare': 'incl. not yet reachable',
    'Stufe': 'Level',
    'Bezahlen aus:': 'Pay from:',
    'Offene TP:': 'Open TP:',
    '{n} Talente': '{n} talents',
    'Keine passenden Talente gefunden.': 'No matching talents found.',
    'ab Stufe': 'from level',
    'Höchstrang': 'Max rank',
    'kein TP frei': 'no TP free',
    'Gebiet wählen': 'Choose field', 'Rang +1': 'Rank +1', 'Lernen': 'Learn',
    'je Gebiet max. Rang': 'per field max. rank',
    'Rang': 'Rank', 'max. Rang': 'max. rank', 'bis Rang': 'up to rank',
    'Heldenklasse': 'Hero class', 'Hausregel': 'House rule',
    'Die Heldenklasse hebt den Höchstrang später an': 'The hero class raises the max rank later',
    'Pro Rang:': 'Per rank:', 'Mehrfach wählbar:': 'Repeatable:', 'Voraussetzung:': 'Requirement:',
    'Bitte zuerst Klasse (und bei Zauberwirkern den Typ) wählen — davon hängt ab, welche Talente zur Verfügung stehen.':
        'Please choose a class first (and, for spellcasters, the type) — it determines which talents are available.',

    // ---- Zauber-Auswahl ----
    'Zauber suchen...': 'Search spells...',
    'auch höherstufige': 'incl. higher level',
    '{n} Zauber': '{n} spells',
    'bekannt': 'known', 'geistesbeeinflussend': 'mind-affecting',
    'Dauer:': 'Duration:', 'Distanz:': 'Range:', 'Abklingzeit:': 'Cooldown:', 'Preis:': 'Price:',
    'Die angezeigten Stufen sind bereits umgerechnet.': 'The levels shown are already converted.',
    'Keine passenden Zauber gefunden.': 'No matching spells found.',
    'Zauber kosten keine Lern- oder Talentpunkte. Pro Stufenaufstieg dürfen Zauber gelernt werden, deren Zauberstufen zusammen die neue Charakterstufe ergeben — der Spielleiter entscheidet, ob der Spruch überhaupt aufzutreiben ist.':
        'Spells cost no learning or talent points. On each level-up you may learn spells whose spell levels add up to the new character level — the GM decides whether the spell can be found at all.',
    'Zauber lernen können Zauberwirker (Klasse und Typ wählen) sowie Paladine ab Stufe {n}.':
        'Spellcasters (choose class and type) and paladins from level {n} can learn spells.',

    // ---- Bestiarium ----
    'Kreatur oder Kategorie suchen...': 'Search creature or category...',
    'Keine Kreatur gefunden.': 'No creature found.',
    'LK': 'HP',
    'In den Kampf': 'Add to combat', '+ Karte': '+ Map',
    'Besonderes:': 'Special:',
    'In den Kampf und zugleich als Figur auf die Karte, in passender Größe':
        'Add to combat and place as a token on the map, at the right size',
    'Größenkategorie — je Kategorie Unterschied ±2 auf den Angriff (S.44)':
        'Size category — ±2 to the attack per category of difference (p.44)',
    '<strong>GH</strong> = Gegnerhärte: die zusammengerechnete Heldenstufe einer Gruppe, die gegen <em>ein</em> Exemplar gute Chancen haben sollte.':
        '<strong>GH</strong> = opponent toughness: the combined hero level of a party that should have a good chance against <em>one</em> specimen.',

    // ---- Hausregeln-Dialog ----
    'Diese Einstellungen gelten nur für diesen Browser. Als Spielleiter kannst du sie unten an alle verbundenen Spieler schicken, damit die ganze Runde gleich rechnet.':
        'These settings apply to this browser only. As the GM you can send them to all connected players below so the whole group calculates the same way.',
    '✓ Übernommen.': '✓ Applied.',
    ' Der Bogen rechnet jetzt nach euren Hausregeln.': ' The sheet now follows your house rules.',
    'Steigerungskosten (Lernpunkte)': 'Advancement costs (learning points)',
    'Nach Regelwerk': 'Per rulebook', 'Einheitlich': 'Uniform', 'Frei einstellbar': 'Freely adjustable',
    'Günstige Eigenschaften der Klasse kosten 2 LP, die übrigen 3 LP.':
        "The class's favored traits cost 2 LP, the rest 3 LP.",
    'Jede Eigenschaft kostet': 'Each trait costs',
    'Die häufigste Hausregel: alle Eigenschaften gleich teuer.':
        'The most common house rule: all traits cost the same.',
    'zusätzlicher Talentpunkt': 'extra talent point',
    'Talentpunkte je Stufe': 'Talent points per level',
    'Talentpunkte (TP)': 'Talent points (TP)',
    'Zweiten Talentpunkt-Topf führen': 'Keep a second talent-point pool',
    'Kurzname': 'Short name', 'Anzahl je Stufe': 'Number per level',
    'Wofür ist er gedacht?': "What's it for?",
    'Beide Töpfe werden getrennt gezählt. Beim Lernen eines Talents wählst du, aus welchem du bezahlst — welche Talente aus welchem Topf erlaubt sind, entscheidet eure Runde.':
        'The two pools are counted separately. When learning a talent you choose which to pay from — your group decides which talents each pool allows.',
    'Optionale Kampfregeln (Regelwerk S.45)': 'Optional combat rules (rulebook p.45)',
    '— Immersieg löst sofort einen weiteren Angriff aus': '— a perfect roll immediately triggers another attack',
    '— 1 SP je Runde mit Schaden, höchstens 3, für freie Aktionen und Boni':
        '— 1 SP per round with damage, up to 3, for free actions and bonuses',
    'Das Regelwerk empfiehlt, Slayende Würfel <strong>nicht ohne Slayerpunkte</strong> zu verwenden — Kämpfe werden damit deutlich unberechenbarer und tödlicher.':
        'The rulebook recommends not using slaying dice <strong>without slayer points</strong> — it makes fights markedly more unpredictable and deadly.',
    'Slayende Würfel gelten auch für Abwehrproben und stehen ausdrücklich auch NSC zu. Bei Probenwerten über 20 zählt dafür nur ein Immersieg des ersten Würfels.':
        'Slaying dice also apply to defense checks and explicitly to NPCs too. For check values above 20, only a perfect roll on the first die counts.',
    'Heldenklassen ab Stufe 2': 'Hero classes from level 2',
    '— Fanwerk „Heldenklassen neu"': '— fan rule "Hero classes reworked"',
    'Die Heldenklasse ist schon ab Stufe 2 wählbar. Dafür steigt man langsamer auf (eigene EP-Tabelle). Heldenklassen-Talente und -Sprüche werden ab <strong>Charakterstufe ÷ 2</strong> zugänglich (Stufe-10-Talent also ab Stufe 5). Unter Stufe 5 darf einmalig ein Rang eines Stufe-10-Heldenklassen-Talents gelernt werden. Grundtalente bleiben unberührt.':
        'The hero class can be chosen from level 2. In exchange you level up more slowly (its own XP table). Hero-class talents and spells become available at <strong>character level ÷ 2</strong> (so a level-10 talent from level 5). Below level 5 you may learn one rank of a level-10 hero-class talent once. Base talents are unaffected.',
    'Eigene Ergänzungen': 'Custom additions',
    '+ Heldenklasse': '+ Hero class',
    'Eigene löschen': 'Delete custom',

    // ---- Charakterbogen: Meta / Kampfwerte / Talente / Zauber ----
    'Probe würfeln': 'Roll check', 'PW': 'CV', 'Talente:': 'Talents:',
    'kein Zauber vorbereitet — ZB 0': 'no spell prepared — SB 0',
    'für Schriftrollen — ZB der Rolle beim Wurf einrechnen':
        "for scrolls — add the scroll's SB when rolling",
    'Noch {m} EP bis Stufe {s} ({n} EP)': 'Still {m} XP to level {s} ({n} XP)',
    ' — Heldenklassen-Tabelle': ' — hero-class table',
    'Höchststufe 20 erreicht.': 'Max level 20 reached.',
    'Talentpunkte:': 'Talent points:', 'ausgegeben': 'spent', 'offen': 'open',
    'Hausregeln aktiv — zwei getrennte Töpfe': 'House rules active — two separate pools',
    'passt zu Stufe': 'matches level',
    'TP mehr als auf Stufe': 'TP more than earned at level', 'verdient': 'earned',
    'TP fehlen gegenüber Stufe': 'TP short of level',
    'für diese Klasse nicht verfügbar': 'not available for this class',
    'erst ab Stufe': 'only from level',
    'Gebiet fehlt': 'field missing',
    'Rang senken (TP zurück)': 'Lower rank (TP back)',
    'Höchstrang erreicht': 'Max rank reached', 'Rang steigern': 'Raise rank',
    'Talent entfernen': 'Remove talent', 'Zauber entfernen': 'Remove spell',
    'z.B. Schmied': 'e.g. smith',
    'Volksfähigkeiten:': 'Racial abilities:',
    'Leichtfüßig': 'Light-footed', 'Nachtsicht': 'Night vision', 'Unsterblich': 'Immortal',
    'Dunkelsicht': 'Dark vision', 'Langlebig': 'Long-lived', 'Zäh': 'Tough',
    '1 Talentpunkt gratis': '1 free talent point',
    'Menschen erhalten statt besonderer Volksfähigkeiten einen zusätzlichen Talentpunkt und starten damit auf Stufe 1 mit 2 TP statt 1 TP.':
        'Instead of special racial abilities, humans get an extra talent point and start at level 1 with 2 TP instead of 1.',
    'Bekannte Zauber:': 'Known spells:', 'Gebundene Zauber:': 'Bound spells:',
    ' — zu den gebundenen Sprüchen wechselst du ohne Aktion und ohne Probe':
        ' — you switch to the bound spells without an action and without a check',
    '★ vorbereitet': '★ prepared', '☆ vorbereiten': '☆ prepare',
    '⚙ gebunden': '⚙ bound', '⚙ binden': '⚙ bind',
    'ZB formelhaft': 'SB formulaic', 'abklingend bis Runde': 'cooling down until round',
    'Vorbereiteten Zauber setzen — als gebundener Spruch ohne Aktion und ohne GEI+VE-Probe':
        'Set the prepared spell — as a bound spell, without an action and without a MND+INT check',
    'Vorbereiteten Zauber setzen — Wechseln kostet im Kampf eine Aktion und eine GEI+VE-Probe':
        'Set the prepared spell — switching in combat costs an action and a MND+INT check',
    'An diesen Spruch binden — dann ohne Aktion und ohne Probe hierher wechseln. Beim Wirken zählt sein eigener ZB.':
        "Bind to this spell — then switch here without an action or check. Its own SB counts when cast.",
    'Der Bogen rechnet mit ZB 0 — der tatsächliche Wert hängt vom Ziel ab und gehört als Modifikator in den Wurf':
        'The sheet assumes SB 0 — the actual value depends on the target and belongs in the roll as a modifier',

    // ---- Rassenfähigkeiten-Beschreibungen ----
    'Sieht bei einem Mindestmaß an Licht (z.B. sternenklarer Himmel) wie am helllichten Tag; in völliger Finsternis (stockfinster) jedoch 0m Sichtweite.':
        'Sees as in broad daylight given a minimum of light (e.g. a starlit sky); in total darkness, however, 0m range.',
    'Altert ab dem Erwachsenwerden kaum noch; stirbt nur durch Gewalteinwirkung.':
        'Barely ages once adult; dies only by violence.',
    'Kann selbst in völliger Finsternis noch sehen (Sichtweite 50m im Stockfinsteren, bei kaum Licht wie am Tag).':
        'Can see even in total darkness (50m range in pitch black, as in daylight in dim light).',
    'Der Alterungsprozess verlangsamt sich, sobald der Zwerg erwachsen ist.':
        'Aging slows once the dwarf is adult.',
    'Abwehr +1.': 'Defense +1.',

    // ---- Lebenskraft-Hinweise ----
    '☠ Tot.': '☠ Dead.', 'Bewusstlos.': 'Unconscious.', 'Noch bei Bewusstsein': 'Still conscious',
    'Der Schaden unter 0 übersteigt den Körperwert ({k}) — Tod ab {t} LK. Eine Wiederbelebung kostet dauerhaft 1 Punkt Körper.':
        'The damage below 0 exceeds the Body value ({k}) — death at {t} HP. A resurrection permanently costs 1 point of Body.',
    'Erwacht nach 1W20 Stunden mit 1 LK. Tod ab {t} LK (unter −KÖR {k}).':
        'Wakes after 1d20 hours with 1 HP. Death at {t} HP (below −BOD {k}).',
    'dank Standhaft — bewusstlos erst ab {g} LK, Tod ab {t} LK.':
        'thanks to Steadfast — unconscious only at {g} HP, death at {t} HP.',
    'Bewusstlos bei {g} LK · Tod ab {t} LK (unter −KÖR {k})':
        'Unconscious at {g} HP · death at {t} HP (below −BOD {k})',
    'Der Schaden unter 0 übersteigt den Körperwert.': 'The damage below 0 exceeds the Body value.',

    // ---- Stufenaufstiegs-Dialog ----
    'Bitte zuerst eine Klasse wählen — die Steigerungskosten hängen davon ab.':
        'Please choose a class first — advancement costs depend on it.',
    'gekauft': 'bought',
    'Steigerung zurücknehmen, LP zurück': 'Undo the increase, LP back',
    'Hier wurde nichts mit Lernpunkten gekauft': 'Nothing was bought here with learning points',
    'Höchstwert': 'Max value', 'Steigern': 'Raise', 'Kaufen': 'Buy',
    'Lernpunkte': 'Learning points', 'Talentpunkte': 'Talent points',
    'Pro Stufe gibt es <strong>+2 Lernpunkte</strong> und <strong>+1 Talentpunkt</strong>.':
        'Each level grants <strong>+2 learning points</strong> and <strong>+1 talent point</strong>.',
    'günstige Eigenschaften kosten 2 LP, die übrigen 3 LP.':
        'favored traits cost 2 LP, the rest 3 LP.',
    'Eigenschaften': 'Traits', 'Sonstiges': 'Other',
    'dauerhaft +1': 'permanent +1',
    'Noch keine Lebenskraft gekauft': 'No health bought yet',
    'Kauf zurücknehmen, LP zurück': 'Undo the purchase, LP back',
    'Noch keinen Talentpunkt gekauft': 'No talent point bought yet',
    'Zusätzlicher Talentpunkt': 'Extra talent point',
    '+1 Stufe gutschreiben (+2 LP, +1 TP)': 'Credit +1 level (+2 LP, +1 TP)',
    'Ein Lernpunkt kann stattdessen auch eine neue Sprache oder Schrift kaufen. Neue Zaubersprüche kosten weder LP noch TP.':
        'A learning point can instead buy a new language or script. New spells cost neither LP nor TP.',
    'Klicken schaltet durch: kein Bonus → +1 → +2 → kein Bonus':
        'Click cycles: no bonus → +1 → +2 → no bonus',
    'Höchstwert-Bonus (Mensch)': 'Max-value bonus (human)',
    'vollständig vergeben': 'fully assigned',
    '2 beliebige Eigenschaften +1 oder 1 Eigenschaft +2 auf den Grundwert 12.':
        'Any 2 traits +1 or 1 trait +2 on the base value of 12.',
};
