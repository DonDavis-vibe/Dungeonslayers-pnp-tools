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

// type: 'melee' | 'ranged' | 'both' | twoHanded: bool | dwarfBanned: bool
// initMod/gaMod are explicit numeric modifiers (Initiative / Gegnerabwehr) parsed from "Besonderes" for live calc.
const DS4_WEAPONS = [
    { name: 'Waffenlos', wb: 0, type: 'melee', gaMod: 5, besonderes: 'Gegnerabwehr +5', price: '—' },
    { name: 'Dolch', wb: 0, type: 'melee', initMod: 1, besonderes: 'Initiative +1', price: '2 GM' },
    { name: 'Schlagring', wb: 0, type: 'melee', besonderes: 'wie waffenlos, aber ohne Abwehr-Bonus für Gegner', price: '1 GM' },
    { name: 'Schleuder', wb: 0, type: 'ranged', besonderes: '−1 pro 2m Distanz', price: '1 SM' },
    { name: 'Wurfmesser', wb: 0, type: 'both', besonderes: '−1 pro 2m Distanz; auch im Nahkampf nutzbar', price: '2 GM' },
    { name: 'Axt', wb: 1, type: 'melee', besonderes: '—', price: '6 GM' },
    { name: 'Hammer', wb: 1, type: 'melee', gaMod: -1, besonderes: 'Gegnerabwehr −1', price: '7 GM' },
    { name: 'Kampfstab', wb: 1, type: 'melee', twoHanded: true, besonderes: 'Zielzauber +1', price: '5 SM' },
    { name: 'Keule', wb: 1, type: 'melee', twoHanded: true, besonderes: '—', price: '2 SM' },
    { name: 'Speer', wb: 1, type: 'both', besonderes: 'im Nahkampf oder als Wurfwaffe nutzbar', price: '1 GM' },
    { name: 'Schwert, Breit-', wb: 1, type: 'melee', gaMod: -2, besonderes: 'Gegnerabwehr −2', price: '8 GM' },
    { name: 'Schwert, Kurz-', wb: 1, type: 'melee', besonderes: 'gilt auch für Krummsäbel', price: '6 GM' },
    { name: 'Bogen, Kurz-', wb: 1, type: 'ranged', twoHanded: true, initMod: 1, besonderes: 'Initiative +1', price: '6 GM' },
    { name: 'Streitkolben/Morgenstern', wb: 1, type: 'melee', gaMod: -1, besonderes: 'Gegnerabwehr −1', price: '7 GM' },
    { name: 'Lanze', wb: '1 (Trab) / 4 (Galopp)', type: 'melee', besonderes: 'nur beritten', price: '2 GM' },
    { name: 'Schwert, Lang-', wb: 2, type: 'melee', gaMod: -2, besonderes: 'Gegnerabwehr −2', price: '7 GM' },
    { name: 'Bogen, Lang-', wb: 2, type: 'ranged', twoHanded: true, dwarfBanned: true, initMod: 1, besonderes: 'Initiative +1', price: '10 GM' },
    { name: 'Armbrust, leicht', wb: 2, type: 'ranged', twoHanded: true, initMod: -2, besonderes: 'Initiative −2', price: '8 GM' },
    { name: 'Flegel', wb: 2, type: 'melee', twoHanded: true, initMod: -2, besonderes: 'Initiative −2', price: '8 GM' },
    { name: 'Hellebarde', wb: 2, type: 'melee', twoHanded: true, initMod: -2, besonderes: 'Initiative −2', price: '4 GM' },
    { name: 'Streitaxt', wb: 3, type: 'melee', twoHanded: true, initMod: -2, besonderes: 'Initiative −2', price: '7 GM' },
    { name: 'Streithammer', wb: 3, type: 'melee', twoHanded: true, initMod: -4, besonderes: 'Initiative −4', price: '6 GM' },
    { name: 'Bihänder', wb: 3, type: 'melee', twoHanded: true, dwarfBanned: true, initMod: -2, gaMod: -4, besonderes: 'Initiative −2, Gegnerabwehr −4', price: '10 GM' },
    { name: 'Armbrust, schwer', wb: 3, type: 'ranged', twoHanded: true, initMod: -4, gaMod: -2, besonderes: 'Initiative −4, Gegnerabwehr −2', price: '15 GM' },
    { name: 'Bogen, Elfen-', wb: 3, type: 'ranged', twoHanded: true, dwarfBanned: true, initMod: 1, besonderes: 'Initiative +1', price: '75 GM' },
    { name: 'Zwergenaxt', wb: 3, type: 'melee', twoHanded: true, initMod: -1, gaMod: -2, besonderes: 'Initiative −1, Gegnerabwehr −2', price: '60 GM' },
    { name: 'Schlachtgeißel', wb: 3, type: 'melee', initMod: -4, gaMod: -4, besonderes: 'Initiative −4, Gegnerabwehr −4; Patzer beim Schlagen trifft einen selbst', price: '16 GM' },
    { name: 'Schlachtbeil', wb: 4, type: 'melee', twoHanded: true, dwarfBanned: true, initMod: -6, gaMod: -4, besonderes: 'Initiative −6, Gegnerabwehr −4', price: '20 GM' }
];

// slot: 'koerper' | 'helm' | 'schienen' | 'schild'
// laufenMod in Metern (negativ), initMod für Initiative, auraMod für Aura (Runenrobe).
const DS4_ARMOR = [
    { name: 'Robe', pa: 0, slot: 'koerper', besonderes: '—', price: '1 GM' },
    { name: 'Robe (runenbestickt)', pa: 0, slot: 'koerper', auraMod: 1, besonderes: 'Aura +1', price: '8 GM' },
    { name: 'Lederpanzer', pa: 1, slot: 'koerper', besonderes: '—', price: '4 GM' },
    { name: 'Lederschienen', pa: 1, slot: 'schienen', besonderes: '—', price: '4 GM' },
    { name: 'Kettenpanzer', pa: 2, slot: 'koerper', laufenMod: -0.5, besonderes: 'Laufen −0,5m', price: '10 GM' },
    { name: 'Plattenarmschienen', pa: 1, slot: 'schienen', laufenMod: -0.5, besonderes: 'Laufen −0,5m', price: '7 GM' },
    { name: 'Plattenbeinschienen', pa: 1, slot: 'schienen', laufenMod: -0.5, besonderes: 'Laufen −0,5m', price: '8 GM' },
    { name: 'Plattenpanzer', pa: 3, slot: 'koerper', laufenMod: -1, besonderes: 'Laufen −1m', price: '50 GM' },
    { name: 'Metallhelm', pa: 1, slot: 'helm', initMod: -1, besonderes: 'Initiative −1', price: '6 GM' },
    { name: 'Schild, Holz-', pa: 1, slot: 'schild', besonderes: 'zerbricht bei Abwehr-Patzer', price: '1 GM' },
    { name: 'Schild, Metall-', pa: 1, slot: 'schild', laufenMod: -0.5, besonderes: 'Laufen −0,5m', price: '8 GM' },
    { name: 'Schild, Turm-', pa: 2, slot: 'schild', laufenMod: -1, besonderes: 'Laufen −1m', price: '15 GM' }
];

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
    { name: 'Wissen', formula: 'GEI+VE' }
];
