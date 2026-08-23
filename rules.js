// Dungeonslayers 4 — Regel-Engine: abgeleitete Werte & Probenauflösung
// Regelreferenz: regeln/ds4_rules_summary.md (aus dem offiziellen Regelwerk extrahiert)

function d20() {
    return Math.floor(Math.random() * 20) + 1;
}

// --- Ausrüstungs-Auswertung -------------------------------------------------

function findWeapon(name) {
    return DS4_WEAPONS.find(w => w.name === name) || null;
}

function findArmor(name) {
    return DS4_ARMOR.find(a => a.name === name) || null;
}

// Summiert die Modifikatoren aller angelegten Rüstungsteile.
function armorTotals(equipment) {
    const totals = { pa: 0, laufenMod: 0, initMod: 0, auraMod: 0, nonClothPa: 0 };
    ['koerper', 'helm', 'schienen', 'schild'].forEach(slot => {
        const armor = findArmor(equipment[slot]);
        if (!armor) return;
        totals.pa += armor.pa;
        totals.laufenMod += armor.laufenMod || 0;
        totals.initMod += armor.initMod || 0;
        totals.auraMod += armor.auraMod || 0;
        // Nur Stoff (Robe) behindert das Zaubern nicht — Regelwerk S.41
        if (!armor.name.startsWith('Robe')) totals.nonClothPa += armor.pa;
    });
    return totals;
}

// Waffenbonus als Zahl. Die Lanze hat einen Text-WB ("1 (Trab) / 4 (Galopp)") —
// dort wird der niedrigere Wert genutzt, der Rest steht in "Besonderes".
function weaponBonus(weapon) {
    if (!weapon) return 0;
    return typeof weapon.wb === 'number' ? weapon.wb : parseInt(weapon.wb, 10) || 0;
}

// Gegnerabwehr (GA): manche Waffen senken (oder heben) die Abwehr des Ziels
// gegen diesen Angriff — z.B. Langschwert −2, Bihänder −4, waffenlos +5.
function gegnerabwehr(char, slot) {
    const weapon = findWeapon(char.equipment && char.equipment[slot]);
    return weapon && weapon.gaMod ? weapon.gaMod : 0;
}

// --- Abgeleitete Werte (Kampfwerte) ----------------------------------------

// char: { attribute: {koerper, agilitaet, geist},
//         eigenschaften: {staerke, haerte, bewegung, geschick, verstand, aura},
//         equipment: {melee, ranged, koerper, helm, schienen, schild}, zauberZb }
function computeDerived(char) {
    const attr = char.attribute;
    const eig = char.eigenschaften;
    const armor = armorTotals(char.equipment || {});
    const melee = findWeapon(char.equipment && char.equipment.melee);
    const ranged = findWeapon(char.equipment && char.equipment.ranged);

    const aura = eig.aura + armor.auraMod;
    const zb = char.zauberZb || 0;
    // Zwerge: Volksfähigkeit "Zäh" gibt +1 Abwehr
    const zaehBonus = char.volk === 'zwerg' ? 1 : 0;
    const weaponInit = (melee ? melee.initMod || 0 : 0) + (ranged ? ranged.initMod || 0 : 0);

    return {
        // bonusLk: über Lernpunkte dauerhaft gesteigerte Lebenskraft
        lebenskraft: attr.koerper + eig.haerte + 10 + (char.bonusLk || 0),
        abwehr: attr.koerper + eig.haerte + armor.pa + zaehBonus,
        initiative: attr.agilitaet + eig.bewegung + armor.initMod + weaponInit,
        laufen: attr.agilitaet / 2 + 1 + armor.laufenMod,
        schlagen: attr.koerper + eig.staerke + weaponBonus(melee),
        schiessen: attr.agilitaet + eig.geschick + weaponBonus(ranged),
        zaubern: attr.geist + aura + zb - armor.nonClothPa,
        zielzauber: attr.geist + eig.geschick + zb - armor.nonClothPa,
        panzerung: armor.pa
    };
}

// --- Probenauflösung --------------------------------------------------------

// Kernmechanik (Regelwerk S.38-39):
//   1W20 unterwürfeln. Wurf <= PW = Erfolg.
//   Natürliche 1 = Immersieg: immer Erfolg, zählt als bestmögliches Ergebnis (= PW).
//   Natürliche 20 = Patzer: immer Fehlschlag.
//   PW > 20 wird in Teilwürfe zerlegt (20, Rest, ...); nur der ERSTE Würfel kann patzen.
//   Die Ergebnisse aller erfolgreichen Teilwürfe werden summiert (relevant für Schaden).
function rollProbe(pw, options = {}) {
    const label = options.label || 'Probe';
    const modifier = options.modifier || 0;
    const effectivePw = pw + modifier;

    // Teil-Probenwerte bilden: 20, 20, ..., Rest
    const chunks = [];
    let remaining = effectivePw;
    if (remaining <= 0) {
        chunks.push(remaining); // Wurf ist nur über Immersieg zu schaffen
    } else {
        while (remaining > 20) {
            chunks.push(20);
            remaining -= 20;
        }
        chunks.push(remaining);
    }

    const rolls = [];
    let total = 0;
    let anyImmersieg = false;
    let patzer = false;

    for (let i = 0; i < chunks.length; i++) {
        const chunkPw = chunks[i];
        const die = d20();
        const isFirst = i === 0;
        const immersieg = die === 1;
        // Nur der erste Würfel einer Probe kann patzen
        const isPatzer = die === 20 && isFirst;
        // Immersieg zählt als bestmögliches Ergebnis, also der volle Teil-PW
        const success = immersieg || (!isPatzer && die <= chunkPw);
        const value = immersieg ? Math.max(chunkPw, 1) : (success ? die : 0);

        rolls.push({ die, chunkPw, success, immersieg, patzer: isPatzer, value });
        if (immersieg) anyImmersieg = true;
        if (isPatzer) patzer = true;
        if (success) total += value;
        if (isPatzer) break; // Patzer beendet die Probe sofort
    }

    const success = !patzer && rolls.some(r => r.success);

    return {
        label,
        pw: effectivePw,
        basePw: pw,
        modifier,
        rolls,
        total,
        success,
        immersieg: anyImmersieg,
        patzer,
        status: patzer ? 'patzer' : (anyImmersieg ? 'immersieg' : (success ? 'erfolg' : 'fehlschlag'))
    };
}

// Vergleichende Probe (Regelwerk S.39): Beide Seiten würfeln ihren PW.
// Schafft es nur eine, gewinnt sie. Schaffen es beide, entscheidet das höhere
// Ergebnis (ein Immersieg zählt als bestmögliches Ergebnis). Schaffen es beide
// nicht, gibt es kein Ergebnis.
function rollOpposed(pwA, pwB, labelA = 'Angreifer', labelB = 'Verteidiger', modA = 0, modB = 0) {
    const a = rollProbe(pwA, { label: labelA, modifier: modA });
    const b = rollProbe(pwB, { label: labelB, modifier: modB });

    let sieger = null;
    let begruendung;
    if (a.success && !b.success) {
        sieger = 'a';
        begruendung = `${labelA} gewinnt (nur diese Probe gelingt)`;
    } else if (!a.success && b.success) {
        sieger = 'b';
        begruendung = `${labelB} gewinnt (nur diese Probe gelingt)`;
    } else if (a.success && b.success) {
        if (a.total > b.total) { sieger = 'a'; begruendung = `${labelA} gewinnt (${a.total} gegen ${b.total})`; }
        else if (b.total > a.total) { sieger = 'b'; begruendung = `${labelB} gewinnt (${b.total} gegen ${a.total})`; }
        else { begruendung = `Gleichstand bei ${a.total} — bei Bedarf neu würfeln`; }
    } else {
        begruendung = 'Beide Proben misslingen — kein Ergebnis';
    }

    return { a, b, sieger, begruendung };
}

// Situationsmodifikatoren im Kampf (Regelwerk S.41, S.43-44).
// Liefert die Summe plus eine lesbare Aufschlüsselung.
function combatModifiers(opts = {}) {
    const teile = [];
    let summe = 0;
    const add = (wert, text) => { if (wert) { summe += wert; teile.push(`${text} ${wert > 0 ? '+' : ''}${wert}`); } };

    // Fernkampf: −1 je 10m Entfernung
    if (opts.distanz) add(-Math.floor(opts.distanz / 10), `${opts.distanz}m`);
    // Fernkampf auf ein Ziel im Nahkampf
    if (opts.imNahkampf) add(-2, 'Ziel im Nahkampf');
    // Zielen: +2 je Runde, höchstens +10
    if (opts.zielen) add(Math.min(10, opts.zielen * 2), `${opts.zielen} Runden gezielt`);
    // Eigene Lage
    if (opts.selbstLiegend) add(-2, 'liegend');
    // Lage des Ziels
    if (opts.zielLiegend) add(2, 'Ziel liegt');
    if (opts.vonDerSeite) add(1, 'von der Seite/oben');
    if (opts.vonHinten) add(2, 'von hinten');
    // Größenunterschied: je Kategorie ±2
    if (opts.groessenDiff) add(opts.groessenDiff * 2, `Größenunterschied ${opts.groessenDiff > 0 ? '+' : ''}${opts.groessenDiff}`);
    // Kampf mit zwei Waffen: −10, durch das Talent "Zwei Waffen" gemildert
    if (opts.zweiWaffen) add(-10 + (opts.zweiWaffenTalent || 0) * 2, 'zwei Waffen');

    return { summe, teile, text: teile.join(' · ') };
}

const DS4_STATUS_TEXT = {
    immersieg: '⭐ Immersieg!',
    erfolg: '✅ Erfolg',
    fehlschlag: '❌ Fehlschlag',
    patzer: '💀 Patzer!'
};

// Kampfpatzer-Konsequenzen (Regelwerk S.43)
const DS4_KAMPFPATZER = {
    abwehr: 'Charakter stürzt zu Boden.',
    schlagen: 'Waffe fällt zu Boden (nicht-magische Holzwaffe zerbricht).',
    schiessen: 'Waffe fällt zu Boden (nicht-magische Holz-Fernwaffe/Munition zerbricht).',
    zaubern: 'Der aktive Zauber "springt heraus" und ist nicht mehr aktiv.',
    zielzauber: 'Der aktive Zauber "springt heraus" und ist nicht mehr aktiv.'
};

// --- Erfahrung / Stufen -----------------------------------------------------

function stufeFuerEp(ep, heldenklasse) {
    let stufe = 1;
    for (const row of DS4_XP_TABLE) {
        const needed = (heldenklasse && row.epHeld !== null) ? row.epHeld : row.ep;
        if (ep >= needed) stufe = row.stufe;
    }
    return stufe;
}

function epBisNaechsteStufe(ep, heldenklasse) {
    const current = stufeFuerEp(ep, heldenklasse);
    const next = DS4_XP_TABLE.find(r => r.stufe === current + 1);
    if (!next) return null;
    const needed = (heldenklasse && next.epHeld !== null) ? next.epHeld : next.ep;
    return { stufe: next.stufe, needed, missing: needed - ep };
}

// Höchstwert einer Eigenschaft: Basis 12, +1 je durch Volk/Klasse begünstigter Eigenschaft.
function eigenschaftMax(eigenschaft, volk, klasse, menschCapChoices = []) {
    let max = 12;
    const race = DS4_RACES[volk];
    if (race) {
        if (race.capBonus === 'FREI') {
            max += menschCapChoices.filter(c => c === eigenschaft).length;
        } else if (race.capBonus.includes(eigenschaft)) {
            max += 1;
        }
    }
    const cls = DS4_CLASSES[klasse];
    if (cls && cls.capBonus.includes(eigenschaft)) max += 1;
    return max;
}
