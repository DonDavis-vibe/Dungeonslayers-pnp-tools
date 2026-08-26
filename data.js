// Dungeonslayers 4 (DS4) — Regeldaten
// Quelle: regeln/Dungeonslayers4.pdf (kostenloses Regelwerk, dungeonslayers.net)
// Diese Datei enthält reine Spieldaten (Rassen, Klassen, Ausrüstung, XP-Tabelle).
// Talente & Zaubersprüche sind bewusst NICHT vollständig hinterlegt (100+ / 150+ Einträge,
// siehe regeln/ds4_rules_summary.md) — der Bogen erlaubt freie Einträge dafür.
//
// Dungeonslayers wurde geschaffen von Christian Kennig ((c) 2011, Burning Books, Berlin).
// Texte und Regelmechaniken stehen unter CC BY-NC-SA 4.0 - diese abgeleitete Datei
// daher ebenfalls: https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de

const DS4_EIGENSCHAFTEN_BY_ATTRIBUT = {
    koerper: ['staerke', 'haerte'],
    agilitaet: ['bewegung', 'geschick'],
    geist: ['verstand', 'aura']
};

const DS4_ATTRIBUT_NAMES = { koerper: 'Körper', agilitaet: 'Agilität', geist: 'Geist' };
const DS4_EIGENSCHAFT_NAMES = {
    staerke: 'Stärke', haerte: 'Härte', bewegung: 'Bewegung',
    geschick: 'Geschick', verstand: 'Verstand', aura: 'Aura'
};
const DS4_EIGENSCHAFT_ABBR = {
    staerke: 'ST', haerte: 'HÄ', bewegung: 'BE', geschick: 'GE', verstand: 'VE', aura: 'AU'
};

const DS4_RACES = {
    elf: {
        name: 'Elf',
        bonusOptions: ['bewegung', 'geschick', 'aura'],
        capBonus: ['bewegung', 'geschick', 'aura'],
        traits: [
            'Leichtfüßig: +2 auf Schleichen-Proben',
            'Nachtsicht: sieht auch bei Dunkelheit klar',
            'Unsterblich: altert kaum, stirbt nur durch Gewalt'
        ],
        weaponBans: []
    },
    mensch: {
        name: 'Mensch',
        bonusOptions: ['staerke', 'haerte', 'bewegung', 'geschick', 'verstand', 'aura'],
        capBonus: 'FREI', // 2 beliebige Eigenschaften +1 ODER 1 Eigenschaft +2
        traits: [
            '+1 zusätzlicher Talentpunkt bei Erschaffung (insgesamt 2 TP statt 1)'
        ],
        weaponBans: []
    },
    zwerg: {
        name: 'Zwerg',
        bonusOptions: ['staerke', 'haerte', 'geschick'],
        capBonus: ['staerke', 'haerte', 'geschick'],
        traits: [
            'Dunkelsicht: sieht auch im Dunkeln',
            'Langlebig: Alterungsprozess ab Erwachsenwerden verlangsamt',
            'Zäh: +1 auf Abwehr'
        ],
        weaponBans: ['Bihänder', 'Schlachtbeil', 'Bogen, Lang-', 'Bogen, Elfen-']
    }
};

const DS4_CLASSES = {
    krieger: {
        name: 'Krieger',
        role: 'Nahkampf-Frontkämpfer',
        bonusOptions: ['staerke', 'haerte'],
        capBonus: ['staerke', 'haerte'],
        armor: { stoff: true, leder: true, kette: true, platte: true, helme: true, schienen: true, schilde: true },
        isCaster: false,
        lpCosts: { staerke: 2, haerte: 2, bewegung: 3, geschick: 3, verstand: 3, aura: 3, lk: 1, tp: 3 },
        heldenklassen: ['Berserker', 'Paladin', 'Waffenmeister']
    },
    spaeher: {
        name: 'Späher',
        role: 'Fernkampf / Schleichen / Skirmish',
        bonusOptions: ['bewegung', 'geschick'],
        capBonus: ['bewegung', 'geschick'],
        armor: { stoff: true, leder: true, kette: true, platte: false, helme: true, schienen: true, schilde: true },
        isCaster: false,
        lpCosts: { staerke: 3, haerte: 3, bewegung: 2, geschick: 2, verstand: 3, aura: 3, lk: 1, tp: 3 },
        heldenklassen: ['Attentäter', 'Meisterdieb', 'Waldläufer']
    },
    zauberwirker: {
        name: 'Zauberwirker',
        role: 'Magie',
        bonusOptions: ['verstand', 'aura'],
        capBonus: ['verstand', 'aura'],
        isCaster: true,
        lpCosts: { staerke: 3, haerte: 3, bewegung: 3, geschick: 3, verstand: 2, aura: 2, lk: 1, tp: 3 },
        subtypes: {
            heiler: {
                name: 'Heiler',
                role: 'Heilung & Unterstützung',
                armor: { stoff: true, leder: true, kette: false, platte: false, helme: false, schienen: 'nur Leder', schilde: true },
                heldenklassen: ['Druide', 'Kampfmönch', 'Kleriker']
            },
            zauberer: {
                name: 'Zauberer',
                role: 'Offensiv- & Defensivmagie',
                armor: { stoff: true, leder: false, kette: false, platte: false, helme: false, schienen: false, schilde: true },
                heldenklassen: ['Elementarist', 'Erzmagier', 'Kriegszauberer']
            },
            schwarzmagier: {
                name: 'Schwarzmagier',
                role: 'Offensivmagie',
                armor: { stoff: true, leder: false, kette: false, platte: false, helme: false, schienen: false, schilde: true },
                heldenklassen: ['Blutmagier', 'Dämonologe', 'Nekromant']
            }
        }
    }
};

// Heldenklassen, die einer nicht zaubernden Grundklasse Zauberzugang verschaffen.
// Im Grundregelwerk ist der Paladin der einzige Fall (S.16): Er wirkt Heilersprüche,
// deren Zugangsstufen um 9 nach oben verschoben sind — Heilende Hand also ab Stufe 10.
const DS4_HELDEN_ZAUBERZUGANG = {
    Paladin: {
        liste: 'heiler',
        stufenversatz: 9,
        hinweis: 'Paladine wirken Heilersprüche. Die Zugangsstufen entsprechen denen des Heilers +9.'
    }
};

// EP-Tabelle: Stufe -> {ep, epHeld, lp, tp}. LP/TP sind die Zuwächse BEIM Erreichen der Stufe.
const DS4_XP_TABLE = [
    { stufe: 1, ep: 0, epHeld: null, lp: 0, tp: 1 },
    { stufe: 2, ep: 100, epHeld: null, lp: 2, tp: 1 },
    { stufe: 3, ep: 300, epHeld: null, lp: 2, tp: 1 },
    { stufe: 4, ep: 600, epHeld: null, lp: 2, tp: 1 },
    { stufe: 5, ep: 1000, epHeld: null, lp: 2, tp: 1 },
    { stufe: 6, ep: 1500, epHeld: null, lp: 2, tp: 1 },
    { stufe: 7, ep: 2100, epHeld: null, lp: 2, tp: 1 },
    { stufe: 8, ep: 2800, epHeld: null, lp: 2, tp: 1 },
    { stufe: 9, ep: 3600, epHeld: null, lp: 2, tp: 1 },
    { stufe: 10, ep: 4500, epHeld: null, lp: 2, tp: 1 },
    { stufe: 11, ep: 5500, epHeld: 6000, lp: 2, tp: 1 },
    { stufe: 12, ep: 6600, epHeld: 7600, lp: 2, tp: 1 },
    { stufe: 13, ep: 7800, epHeld: 9300, lp: 2, tp: 1 },
    { stufe: 14, ep: 9100, epHeld: 11100, lp: 2, tp: 1 },
    { stufe: 15, ep: 10500, epHeld: 13000, lp: 2, tp: 1 },
    { stufe: 16, ep: 12000, epHeld: 15000, lp: 2, tp: 1 },
    { stufe: 17, ep: 13700, epHeld: 17200, lp: 2, tp: 1 },
    { stufe: 18, ep: 15600, epHeld: 19600, lp: 2, tp: 1 },
    { stufe: 19, ep: 17700, epHeld: 22200, lp: 2, tp: 1 },
    { stufe: 20, ep: 20000, epHeld: 25000, lp: 2, tp: 1 }
];

const DS4_DIFFICULTY_MODIFIERS = [
    { label: 'Routine', mod: 8 },
    { label: 'Sehr leicht', mod: 4 },
    { label: 'Leicht', mod: 2 },
    { label: 'Normal', mod: 0 },
    { label: 'Schwer', mod: -2 },
    { label: 'Sehr schwer', mod: -4 },
    { label: 'Äußerst schwer', mod: -8 }
];

// Waffentabelle, abgeglichen mit dem Regelwerk S.80 (PDF S.90).
//   type          'melee' | 'ranged' | 'both'
//   twoHanded     im Regelwerk mit "(2h)" gekennzeichnet — schließt einen Schild aus
//   dwarfBanned   Fußnote *: für Zwerge zu unhandlich
//   reichweite    Anhang B (S.153): erreicht Ziele bis zu 2 Felder entfernt
//   stosswaffe    Anhang B: trifft auch Ziele, vor denen jemand steht
//   zerbricht     Fußnoten **/****: zerbricht bei einem Schlagen- bzw. Schießen-Patzer
//   distanzJe     Meter je Punkt Distanzmalus (Standard 10; Schleuder/Wurfmesser 2)
//   patzerSelbst  Fußnote ***: bei einem Schlagen-Patzer trifft der Angreifer sich selbst
//   zielzauberMod Bonus auf Zielzauber, solange die Waffe geführt wird (Kampfstab +1)
//   initMod/gaMod dieselben Angaben als Zahl, damit sie in die Werte einfließen
const DS4_WEAPONS = [
    { name: 'Waffenlos', wb: 0, type: 'melee', gaMod: 5, besonderes: 'Gegnerabwehr +5', price: '—' },
    { name: 'Dolch', wb: 0, type: 'melee', initMod: 1, besonderes: 'Initiative +1', price: '2 GM' },
    { name: 'Schlagring', wb: 0, type: 'melee', besonderes: 'wie waffenlos, aber ohne Abwehr-Bonus für Gegner', price: '1 GM' },
    { name: 'Schleuder', wb: 0, type: 'ranged', distanzJe: 2, besonderes: 'Distanzmalus −1 pro 2m', price: '1 SM' },
    { name: 'Wurfmesser', wb: 0, type: 'both', distanzJe: 2, besonderes: 'Distanzmalus −1 pro 2m; auch für den Nahkampf geeignet', price: '2 GM' },
    { name: 'Axt', wb: 1, type: 'melee', besonderes: '—', price: '6 GM' },
    // Unter "Diverses" (S.79) statt in der Waffentabelle gelistet — nur WB angegeben.
    // Robuste, preiswerte Alternative zur Keule, die bei einem Patzer zerbricht.
    { name: 'Brechstange', wb: 1, type: 'melee', besonderes: 'unter „Diverses" gelistet; zerbricht nicht wie hölzerne Waffen', price: '15 SM' },
    { name: 'Fackel', wb: 1, type: 'melee', besonderes: 'unter „Diverses" gelistet; brennt 2 Stunden', price: '1 KM' },
    { name: 'Hammer', wb: 1, type: 'melee', gaMod: -1, besonderes: 'Gegnerabwehr −1', price: '7 GM' },
    { name: 'Kampfstab', wb: 1, type: 'melee', twoHanded: true, reichweite: 2, stosswaffe: true, zerbricht: 'schlagen', zielzauberMod: 1, besonderes: 'Zielzauber +1', price: '5 SM' },
    { name: 'Keule', wb: 1, type: 'melee', zerbricht: 'schlagen', besonderes: '—', price: '2 SM' },
    { name: 'Speer', wb: 1, type: 'both', reichweite: 2, stosswaffe: true, zerbricht: 'schiessen', besonderes: 'sowohl für Nah- als auch Fernkampf', price: '1 GM' },
    { name: 'Schwert, Breit-', wb: 1, type: 'melee', gaMod: -2, besonderes: 'Gegnerabwehr −2', price: '8 GM' },
    { name: 'Schwert, Kurz-', wb: 1, type: 'melee', besonderes: 'Werte gelten auch für Krummsäbel', price: '6 GM' },
    { name: 'Bogen, Kurz-', wb: 1, type: 'ranged', twoHanded: true, initMod: 1, besonderes: 'Initiative +1', price: '6 GM' },
    { name: 'Streitkolben/Morgenstern', wb: 1, type: 'melee', gaMod: -1, besonderes: 'Gegnerabwehr −1', price: '7 GM' },
    { name: 'Lanze', wb: '1 (Trab) / 4 (Galopp)', type: 'melee', zerbricht: 'schlagen', besonderes: 'nur beritten: im Trab WB+1, im Galopp WB+4', price: '2 GM' },
    { name: 'Schwert, Lang-', wb: 2, type: 'melee', besonderes: 'Werte gelten auch für Krummschwerter', price: '7 GM' },
    { name: 'Bogen, Lang-', wb: 2, type: 'ranged', twoHanded: true, dwarfBanned: true, initMod: 1, besonderes: 'Initiative +1', price: '10 GM' },
    { name: 'Armbrust, leicht', wb: 2, type: 'ranged', twoHanded: true, initMod: -2, besonderes: 'Initiative −2', price: '8 GM' },
    { name: 'Flegel', wb: 2, type: 'melee', initMod: -2, besonderes: 'Initiative −2', price: '8 GM' },
    { name: 'Hellebarde', wb: 2, type: 'melee', twoHanded: true, initMod: -2, reichweite: 2, stosswaffe: true, zerbricht: 'schlagen', besonderes: 'Initiative −2; typische Stadtwachenwaffe', price: '4 GM' },
    { name: 'Streitaxt', wb: 3, type: 'melee', twoHanded: true, initMod: -2, besonderes: 'Initiative −2', price: '7 GM' },
    { name: 'Streithammer', wb: 3, type: 'melee', twoHanded: true, initMod: -4, besonderes: 'Initiative −4', price: '6 GM' },
    { name: 'Bihänder', wb: 3, type: 'melee', twoHanded: true, dwarfBanned: true, initMod: -2, gaMod: -4, reichweite: 2, besonderes: 'Initiative −2, Gegnerabwehr −4', price: '10 GM' },
    { name: 'Armbrust, schwer', wb: 3, type: 'ranged', twoHanded: true, initMod: -4, gaMod: -2, besonderes: 'Initiative −4, Gegnerabwehr −2', price: '15 GM' },
    { name: 'Bogen, Elfen-', wb: 3, type: 'ranged', twoHanded: true, dwarfBanned: true, initMod: 1, besonderes: 'Initiative +1', price: '75 GM' },
    { name: 'Zwergenaxt', wb: 3, type: 'melee', twoHanded: true, initMod: -1, gaMod: -2, besonderes: 'Initiative −1, Gegnerabwehr −2', price: '60 GM' },
    { name: 'Schlachtgeißel', wb: 3, type: 'melee', initMod: -4, gaMod: -4, patzerSelbst: true, besonderes: 'Initiative −4, Gegnerabwehr −4; bei einem Schlagen-Patzer trifft der Angreifer sich selbst', price: '16 GM' },
    { name: 'Schlachtbeil', wb: 4, type: 'melee', twoHanded: true, dwarfBanned: true, initMod: -6, gaMod: -4, reichweite: 2, besonderes: 'Initiative −6, Gegnerabwehr −4', price: '20 GM' }
];

// slot: 'koerper' | 'helm' | 'schienen' | 'schild'
// typ  : Rüstungsart der Klassentabelle (Regelwerk S.41) —
//        'stoff' | 'leder' | 'kette' | 'platte' | 'helm' | 'schiene' | 'schild'
// material: nur für Schienen nötig, weil Heiler ausschließlich Lederschienen tragen dürfen
// laufenMod in Metern (negativ), initMod für Initiative, auraMod für Aura (Runenrobe).
const DS4_ARMOR = [
    { name: 'Robe', pa: 0, slot: 'koerper', typ: 'stoff', besonderes: '—', price: '1 GM' },
    { name: 'Robe (runenbestickt)', pa: 0, slot: 'koerper', typ: 'stoff', auraMod: 1, besonderes: 'Aura +1', price: '8 GM' },
    { name: 'Lederpanzer', pa: 1, slot: 'koerper', typ: 'leder', besonderes: '—', price: '4 GM' },
    { name: 'Lederschienen', pa: 1, slot: 'schienen', typ: 'schiene', material: 'leder', besonderes: '—', price: '4 GM' },
    { name: 'Kettenpanzer', pa: 2, slot: 'koerper', typ: 'kette', laufenMod: -0.5, besonderes: 'Laufen −0,5m', price: '10 GM' },
    { name: 'Plattenarmschienen', pa: 1, slot: 'schienen', typ: 'schiene', material: 'metall', laufenMod: -0.5, besonderes: 'Laufen −0,5m', price: '7 GM' },
    { name: 'Plattenbeinschienen', pa: 1, slot: 'schienen', typ: 'schiene', material: 'metall', laufenMod: -0.5, besonderes: 'Laufen −0,5m', price: '8 GM' },
    { name: 'Plattenpanzer', pa: 3, slot: 'koerper', typ: 'platte', laufenMod: -1, besonderes: 'Laufen −1m', price: '50 GM' },
    { name: 'Metallhelm', pa: 1, slot: 'helm', typ: 'helm', initMod: -1, besonderes: 'Initiative −1', price: '6 GM' },
    { name: 'Schild, Holz-', pa: 1, slot: 'schild', typ: 'schild', besonderes: 'zerbricht bei Abwehr-Patzer', price: '1 GM' },
    { name: 'Schild, Metall-', pa: 1, slot: 'schild', typ: 'schild', laufenMod: -0.5, besonderes: 'Laufen −0,5m', price: '8 GM' },
    { name: 'Schild, Turm-', pa: 2, slot: 'schild', typ: 'schild', laufenMod: -1, besonderes: 'Laufen −1m', price: '15 GM' }
];

// Slayerpunkte (optionale Regel, Regelwerk S.45).
// Je Kampfrunde, in der man Schaden verursacht (oder als Heiler einen im Kampf
// verletzten Kameraden heilt), gibt es 1 SP. Mehr als 3 gleichzeitig gehen nicht,
// und sie verfallen am Kampfende oder bei Bewusstlosigkeit.
const DS4_SLAYERPUNKTE_MAX = 3;

const DS4_SLAYERPUNKTE = [
    { kosten: 1, name: '2 Schadenspunkte ignorieren' },
    { kosten: 1, name: 'Abklingzeit −1 Runde' },
    { kosten: 1, name: 'Abwehr +3' },
    { kosten: 1, name: 'Gegnerabwehr −1' },
    { kosten: 1, name: 'Im Nahkampf aufstehen' },
    { kosten: 1, name: 'Laufen +1m' },
    { kosten: 1, name: 'Waffe aufheben/wechseln/ziehen' },
    { kosten: 2, name: '1× Ausweichen', hinweis: 'wie mit dem gleichnamigen Talent' },
    { kosten: 2, name: '6 Schadenspunkte ignorieren' },
    { kosten: 2, name: 'Abklingzeit −3 Runden' },
    { kosten: 2, name: 'Abwehr +8' },
    { kosten: 2, name: 'Angriffsprobe +2' },
    { kosten: 2, name: 'Gegnerabwehr −2' },
    { kosten: 2, name: 'Laufen +2m' },
    { kosten: 2, name: 'Misslungenen Angriff wiederholen', hinweis: 'gilt nicht bei Patzern' },
    { kosten: 2, name: 'Zauber wechseln (Probe)' },
    { kosten: 3, name: '2. Angriff in einer Runde' },
    { kosten: 3, name: '9 Schadenspunkte ignorieren' },
    { kosten: 3, name: 'Abklingzeit −10 Runden' },
    { kosten: 3, name: 'Abwehr +12' },
    { kosten: 3, name: 'Gegner bei Schaden zu Fall bringen', hinweis: 'nicht bei Gegnern, die 2+ Größenkategorien größer sind' },
    { kosten: 3, name: 'Gegnerabwehr −4' },
    { kosten: 3, name: 'Laufen +3m' }
];

// Heroische und epische Gegner (Regelwerk S.105): Aus einem gewöhnlichen
// Bestiariumseintrag wird ein Boss. Erhöht wird nur EIN Angriffswert.
// Die EP werden vorher um (4 + zusätzliche Lebenskraft) erhöht und dann verdoppelt.
const DS4_GEGNER_RAENGE = {
    normal:   { name: 'normal',   lkFaktor: 1,  abwehr: 0, angriff: 0, epFaktor: 1 },
    heroisch: { name: 'heroisch', lkFaktor: 5,  abwehr: 2, angriff: 2, epFaktor: 2 },
    episch:   { name: 'episch',   lkFaktor: 10, abwehr: 4, angriff: 4, epFaktor: 2 }
};

const DS4_TYPISCHE_PROBEN = [
    { name: 'Bemerken', formula: 'GEI+VE (mind. 8)' },
    { name: 'Erwachen', formula: 'GEI+VE' },
    { name: 'Fallen entschärfen', formula: 'GEI+GE' },
    { name: 'Feilschen', formula: 'GEI+VE oder AU' },
    { name: 'Feuer machen', formula: 'GEI+GE' },
    { name: 'Flirten', formula: 'GEI+AU' },
    { name: 'Gift trotzen', formula: 'KÖR+HÄ' },
    { name: 'Inschrift entziffern', formula: 'GEI+VE' },
    { name: 'Klettern', formula: 'AGI+ST' },
    { name: 'Kraftakt', formula: 'KÖR+ST' },
    { name: 'Krankheit trotzen', formula: 'KÖR+HÄ' },
    // Magie analysieren (S.46): erst mit GEI+AU erspüren, dann mit GEI+VE
    // (und Berührung) erkennen, was sie bewirkt. Je Magie nur einmal pro Stufe.
    { name: 'Magie erspüren', formula: 'GEI+AU' },
    { name: 'Magie identifizieren', formula: 'GEI+VE' },
    { name: 'Mechanismus öffnen', formula: 'GEI+GE oder VE' },
    { name: 'Reiten', formula: 'AGI+BE oder AU' },
    { name: 'Schätzen', formula: 'GEI+VE' },
    { name: 'Schleichen', formula: 'AGI+BE' },
    { name: 'Schlösser öffnen', formula: 'GEI+GE' },
    { name: 'Schwimmen', formula: 'AGI+ST' },
    { name: 'Springen', formula: 'AGI+BE' },
    { name: 'Spuren lesen', formula: 'GEI+VE' },
    { name: 'Suchen', formula: 'GEI+VE (mind. 8)' },
    { name: 'Taschendiebstahl', formula: 'AGI+GE' },
    { name: 'Verbergen', formula: 'AGI+BE' },
    { name: 'Verständigen', formula: 'GEI+GE' },
    { name: 'Wissen', formula: 'GEI+VE' },
    // Den aktiven Zauber austauschen kostet eine ganze Aktion (S.46);
    // bei einem Immersieg ist der Wechsel aktionsfrei.
    { name: 'Zauber wechseln', formula: 'GEI+VE' }
];
