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

// Darf diese Klasse dieses Rüstungsteil tragen? (Regelwerk S.41, Rüstungstabelle)
// `rules` ist der armor-Block der Klasse bzw. des Zauberwirker-Untertyps aus data.js.
// Das Talent "Gerüstet" hebt die Grenze je Rang um eine Rüstungsklasse an
// (Stoff -> Leder -> Kette -> Platte).
const DS4_RUESTUNGSKLASSEN = ['stoff', 'leder', 'kette', 'platte'];

function ruestungErlaubt(armor, rules, geruestetRang = 0) {
    if (!armor || !rules) return true;

    const stufe = DS4_RUESTUNGSKLASSEN.indexOf(armor.typ);
    if (stufe >= 0) {
        // Höchste von der Klasse erlaubte Rüstungsklasse ermitteln
        let hoechste = -1;
        DS4_RUESTUNGSKLASSEN.forEach((k, i) => { if (rules[k]) hoechste = i; });
        return stufe <= hoechste + (geruestetRang || 0);
    }

    if (armor.typ === 'helm') return rules.helme !== false;
    if (armor.typ === 'schild') return rules.schilde !== false;
    if (armor.typ === 'schiene') {
        if (rules.schienen === 'nur Leder') return armor.material === 'leder';
        return rules.schienen !== false;
    }
    return true;
}

// Rüstung schnell anlegen dauert 2 Aktionen je Punkt Panzerung; Helme sind
// eine freie Aktion (Regelwerk S.44). Magische PA-Boni zählen dabei nicht.
function ruestungAnlegenAktionen(equipment) {
    let aktionen = 0;
    let helmFrei = false;
    ['koerper', 'schienen', 'schild'].forEach(slot => {
        const armor = findArmor(equipment && equipment[slot]);
        if (armor) aktionen += 2 * armor.pa;
    });
    if (findArmor(equipment && equipment.helm)) helmFrei = true;
    return { aktionen, helmFrei };
}

// Wer in unbequemer Metallrüstung schläft, riskiert einen kumulativen Malus
// von −1 auf alle Proben für 24 Stunden (Regelwerk S.44).
function schlaeftInMetall(equipment) {
    return ['koerper', 'helm', 'schienen'].some(slot => {
        const armor = findArmor(equipment && equipment[slot]);
        return !!armor && (armor.typ === 'kette' || armor.typ === 'platte' ||
            (armor.typ === 'schiene' && armor.material === 'metall') || armor.typ === 'helm');
    });
}

// Summiert die Modifikatoren aller angelegten Rüstungsteile.
// ruesttraegerRang mindert den Laufen-Malus der Rüstung um 0,5m je Rang (S.40).
// rules/geruestetRang dienen dazu, klassenfremde Rüstung zu erkennen (S.41):
// deren PA-Malus aufs Zaubern wird vervierfacht und senkt zusätzlich die Agilität.
function armorTotals(equipment, ruesttraegerRang = 0, rules = null, geruestetRang = 0) {
    const totals = { pa: 0, laufenMod: 0, initMod: 0, auraMod: 0, nonClothPa: 0, fremdePa: 0, fremdeTeile: [] };
    ['koerper', 'helm', 'schienen', 'schild'].forEach(slot => {
        const armor = findArmor(equipment[slot]);
        if (!armor) return;
        totals.pa += armor.pa;
        totals.laufenMod += armor.laufenMod || 0;
        totals.initMod += armor.initMod || 0;
        totals.auraMod += armor.auraMod || 0;
        // Nur Stoff (Robe) behindert das Zaubern nicht — Regelwerk S.41
        if (armor.typ !== 'stoff') totals.nonClothPa += armor.pa;
        if (rules && !ruestungErlaubt(armor, rules, geruestetRang)) {
            totals.fremdePa += armor.pa;
            totals.fremdeTeile.push(armor.name);
        }
    });

    // Der Malus wird gemindert, kann aber nicht zum Bonus werden
    if (ruesttraegerRang && totals.laufenMod < 0) {
        totals.laufenMod = Math.min(0, totals.laufenMod + 0.5 * ruesttraegerRang);
    }
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

// --- Talentboni -------------------------------------------------------------

// Talente, die einen Kampfwert DAUERHAFT und bedingungslos verändern.
// Der Wert gilt jeweils pro Talentrang (Regelwerk S.17-37).
const DS4_TALENT_BONI = {
    // "Er erhält pro Talentrang auf Schlagen einen Bonus von +1." (S.36)
    'Kämpfer': { schlagen: 1 },
    // "Er erhält auf Schießen und Zielzauber einen Bonus von +1 pro Talentrang." (S.41)
    'Schütze': { schiessen: 1, zielzauber: 1 },
    // "Der Charakter versteht es, ordentlich Schaden einzustecken." (S.32)
    'Einstecker': { lebenskraft: 3 },
    // "Der Wert für Laufen wird pro Erwerb des Talents um 1m erhöht." (S.33)
    'Flink': { laufen: 1 },
    // "Der Charakter kann schnell reagieren." (S.41)
    'Schnelle Reflexe': { initiative: 2 },
    // Heldenklasse Blutmagier: dauerhafter Abwehrbonus gegen Lebenskraft
    'Ritual der Narben': { abwehr: 2, lebenskraft: -1 }
};

// Talente, die nur unter bestimmten Umständen greifen. Sie werden NICHT
// automatisch eingerechnet, sondern dem Spieler als Hinweis angezeigt.
const DS4_TALENT_SITUATIV = {
    'Parade': { wert: 'Abwehr', proRang: 1, bedingung: 'mit gezogener Nahkampfwaffe, gegen bewusste Nahkampfangriffe nicht von hinten' },
    'Blocker': { wert: 'Abwehr', proRang: 2, bedingung: 'mit Schild, ohne Bewegung und ohne offensive Handlung' },
    'Diener des Lichts': { wert: 'Abwehr', proRang: 1, bedingung: 'gegen Wesen der Dunkelheit und Schattenzauber' },
    'Diener der Dunkelheit': { wert: 'Angriffe', proRang: 1, bedingung: 'gegen Wesen des Lichts; Abwehr gegen Lichtzauber' },
    'Brutaler Hieb': { wert: 'Schlagen', proRang: 'KÖR', bedingung: 'einmal pro Kampf je Rang, für einen einzelnen Angriff' },
    'Fieser Schuß': { wert: 'Schießen', proRang: 'AGI', bedingung: 'einmal pro Kampf je Rang, für einen einzelnen Schuss' },
    'Raserei': { wert: 'Schlagen', proRang: 2, bedingung: 'je Rang −1 Abwehr für +2 Schlagen, rundenweise umschichtbar' },
    // Waffenartgebunden — welche Art gemeint ist, steht in der Notiz am Talent
    'Waffenkenner': { wert: 'Schlagen', proRang: 1, bedingung: 'nur mit der je Rang gewählten Waffenart (dazu Gegnerabwehr −1)' },
    'Perfektion': { wert: 'Schlagen', proRang: 1, bedingung: 'einmal pro Kampf je Rang, nur mit einer per Waffenkenner beherrschten Waffenart' }
};

// Talente, die einen festen Bonus auf bestimmte typische Proben geben.
// Zuordnung anhand der Effekttexte im Regelwerk (S.17-37); mehrfach erlernbare
// Talente wie Handwerk, Instrument oder Wissensgebiet sind bewusst nicht dabei,
// da sie sich je Erwerb auf ein eigenes Gebiet beziehen.
const DS4_TALENT_PROBEN = {
    'Wahrnehmung': { proRang: 2, proben: ['Bemerken'] },
    'Akrobat': { proRang: 2, proben: ['Klettern', 'Springen'] },
    'Kletterass': { proRang: 2, proben: ['Klettern'] },
    'Heimlichkeit': { proRang: 2, proben: ['Schleichen', 'Verbergen', 'Taschendiebstahl'] },
    'Diebeskunst': { proRang: 2, proben: ['Fallen entschärfen', 'Taschendiebstahl', 'Schlösser öffnen'] },
    'Schlossknacker': { proRang: 2, proben: ['Schlösser öffnen'] },
    'Jäger': { proRang: 2, proben: ['Spuren lesen'] },
    'Schwimmen': { proRang: 3, proben: ['Schwimmen'] },
    'Bildung': { proRang: 2, proben: ['Wissen'] },
    'Schlitzohr': { proRang: 3, proben: ['Feilschen'] },
    'Charmant': { proRang: 2, proben: ['Flirten'] },
    'Beute schätzen': { proRang: 3, proben: ['Schätzen'] }
};

// Summiert die Talentboni für eine bestimmte typische Probe.
function talentProbenBonus(talents, probenName) {
    let summe = 0;
    const quellen = [];
    (talents || []).forEach(t => {
        const d = DS4_TALENT_PROBEN[t.name];
        const rang = t.rang || 0;
        if (!d || !rang || !d.proben.includes(probenName)) return;
        const bonus = d.proRang * rang;
        summe += bonus;
        quellen.push(`${t.name} ${rang}: +${bonus}`);
    });
    return { summe, quellen, text: quellen.join(', ') };
}

function talentRang(talents, name) {
    const t = (talents || []).find(x => x.name === name);
    return t ? (t.rang || 0) : 0;
}

// Summiert alle dauerhaften Talentboni und listet auf, woher sie stammen.
function talentBoni(talents) {
    const boni = { schlagen: 0, schiessen: 0, zielzauber: 0, lebenskraft: 0, laufen: 0, initiative: 0, abwehr: 0, zaubern: 0 };
    const herkunft = {};

    Object.keys(DS4_TALENT_BONI).forEach(name => {
        const rang = talentRang(talents, name);
        if (!rang) return;
        Object.entries(DS4_TALENT_BONI[name]).forEach(([wert, proRang]) => {
            const summe = proRang * rang;
            boni[wert] += summe;
            (herkunft[wert] = herkunft[wert] || []).push(`${name} ${rang}: ${summe > 0 ? '+' : ''}${summe}`);
        });
    });

    return { boni, herkunft };
}

// Situative Talente, die der Charakter besitzt — für die Anzeige am Bogen.
function situativeTalente(talents) {
    return (talents || [])
        .filter(t => DS4_TALENT_SITUATIV[t.name] && (t.rang || 0) > 0)
        .map(t => {
            const d = DS4_TALENT_SITUATIV[t.name];
            const bonus = typeof d.proRang === 'number' ? `+${d.proRang * (t.rang || 1)}` : `+${d.proRang}`;
            return { name: t.name, rang: t.rang || 1, wert: d.wert, bonus, bedingung: d.bedingung };
        });
}

// Standhaft senkt die Grenze, ab der ein Charakter bewusstlos wird, um 3 je Rang.
function bewusstlosGrenze(talents) {
    return -3 * talentRang(talents, 'Standhaft');
}

// Tod tritt ein, sobald der Schaden unterhalb von 0 den Körperwert übersteigt
// (Regelwerk S.42): Bei KÖR 8 ist bei −9 LK Schluss. Standhaft verschiebt nur
// die Bewusstlosigkeit, nicht diese Grenze.
function todesGrenze(koerper) {
    return -(koerper || 0) - 1;
}

// --- Abgeleitete Werte (Kampfwerte) ----------------------------------------

// char: { attribute: {koerper, agilitaet, geist},
//         eigenschaften: {staerke, haerte, bewegung, geschick, verstand, aura},
//         equipment: {melee, ranged, koerper, helm, schienen, schild},
//         zauberZb, zauberTyp: 'normal' | 'ziel', armorRules }
function computeDerived(char) {
    const attr = char.attribute;
    const eig = char.eigenschaften;
    const talents = char.talents || [];
    const { boni, herkunft } = talentBoni(talents);

    const geruestet = talentRang(talents, 'Gerüstet');
    const armor = armorTotals(char.equipment || {}, talentRang(talents, 'Rüstträger'),
                              char.armorRules || null, geruestet);
    const melee = findWeapon(char.equipment && char.equipment.melee);
    const ranged = findWeapon(char.equipment && char.equipment.ranged);

    const aura = eig.aura + armor.auraMod;
    const zb = char.zauberZb || 0;
    // Der Zauberbonus gehört nur auf den Kampfwert, mit dem der vorbereitete
    // Zauber auch gewirkt wird (Regelwerk S.2) — ohne Angabe gilt er für beide.
    const zbZaubern = char.zauberTyp === 'ziel' ? 0 : zb;
    const zbZielzauber = char.zauberTyp === 'normal' ? 0 : zb;

    // Klassenfremde Rüstung (S.41): PA-Malus auf Zaubern/Zielzauber vervierfacht
    // (also 3x PA zusätzlich zum normalen Abzug) und Agilität um den PA-Wert gesenkt.
    const fremdZauberMalus = armor.fremdePa * 3;
    const agilitaet = attr.agilitaet - armor.fremdePa;

    // Zwerge: Volksfähigkeit "Zäh" gibt +1 Abwehr
    const zaehBonus = char.volk === 'zwerg' ? 1 : 0;
    const weaponInit = (melee ? melee.initMod || 0 : 0) + (ranged ? ranged.initMod || 0 : 0);

    return {
        // bonusLk: über Lernpunkte dauerhaft gesteigerte Lebenskraft
        lebenskraft: attr.koerper + eig.haerte + 10 + (char.bonusLk || 0) + boni.lebenskraft,
        abwehr: attr.koerper + eig.haerte + armor.pa + zaehBonus + boni.abwehr,
        initiative: agilitaet + eig.bewegung + armor.initMod + weaponInit + boni.initiative,
        laufen: agilitaet / 2 + 1 + armor.laufenMod + boni.laufen,
        schlagen: attr.koerper + eig.staerke + weaponBonus(melee) + boni.schlagen,
        schiessen: agilitaet + eig.geschick + weaponBonus(ranged) + boni.schiessen,
        zaubern: attr.geist + aura + zbZaubern - armor.nonClothPa - fremdZauberMalus + boni.zaubern,
        zielzauber: attr.geist + eig.geschick + zbZielzauber - armor.nonClothPa - fremdZauberMalus + boni.zielzauber,
        panzerung: armor.pa,
        // Klassenfremd getragene Teile — für die Warnung am Bogen
        fremdePa: armor.fremdePa,
        fremdeTeile: armor.fremdeTeile,
        // Für die Anzeige: welcher Talentbonus steckt in welchem Wert?
        talentHerkunft: herkunft,
        bewusstlosAb: bewusstlosGrenze(talents)
    };
}

// --- Probenauflösung --------------------------------------------------------

// Kernmechanik (Regelwerk S.38-40):
//   1W20 unterwürfeln. Wurf <= PW = Erfolg.
//   Natürliche 1 = Immersieg: immer Erfolg, zählt als bestmögliches Ergebnis (= PW).
//   Natürliche 20 = Patzer: immer Fehlschlag.
//   PW > 20 wird in Teilwürfe zerlegt (20, Rest, ...); nur der ERSTE Würfel kann patzen.
//   "Ergebnisse über 20 ermitteln" (S.40): Es werden ERST alle Würfel geworfen, DANN
//   sucht sich der Spieler aus, welcher Würfel auf welchen Teil-Probenwert gelegt wird.
//   Ein Immersieg ist dabei nur für seinen eigenen Teilwurf das Höchstergebnis.
//   Die Ergebnisse aller erfolgreichen Teilwürfe werden summiert (relevant für Schaden).
// Ein einzelner Durchgang einer Probe. `patzerMoeglich` ist nur bei den
// Zusatzwürfen der optionalen Slayenden Würfel false ("Patzer ausgeschlossen").
function einzelProbe(effectivePw, patzerMoeglich = true) {
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

    // Was ein Würfel auf einem bestimmten Teil-Probenwert einbringt.
    const teilErgebnis = (die, chunkPw) =>
        die === 1 ? Math.max(chunkPw, 1) : (die <= chunkPw ? die : 0);

    // Nur der ZUERST geworfene Würfel kann patzen — dann ist die Probe sofort vorbei.
    const dice = [d20()];
    const patzer = patzerMoeglich && dice[0] === 20;
    if (!patzer) {
        for (let i = 1; i < chunks.length; i++) dice.push(d20());
    }

    // Beste Zuordnung der Würfel: Alle vollen Zwanziger-Teilwerte sind gleichwertig,
    // es zählt also nur, welcher Würfel auf den kleineren Rest-Probenwert wandert.
    // Gesucht ist der Würfel, der dabei am wenigsten Ergebnis verliert.
    const restPw = chunks[chunks.length - 1];
    let restIndex = 0;
    if (!patzer && chunks.length > 1) {
        let kleinsterVerlust = Infinity;
        dice.forEach((die, i) => {
            const verlust = teilErgebnis(die, 20) - teilErgebnis(die, restPw);
            if (verlust < kleinsterVerlust) { kleinsterVerlust = verlust; restIndex = i; }
        });
    }

    const rolls = [];
    let total = 0;
    let anyImmersieg = false;

    dice.forEach((die, i) => {
        const isPatzer = patzer && i === 0;
        const chunkPw = isPatzer ? chunks[0] : (i === restIndex ? restPw : 20);
        const immersieg = !isPatzer && die === 1;
        const value = isPatzer ? 0 : teilErgebnis(die, chunkPw);
        const success = !isPatzer && (immersieg || die <= chunkPw);

        rolls.push({ die, chunkPw, success, immersieg, patzer: isPatzer, value });
        if (immersieg) anyImmersieg = true;
        if (success) total += value;
    });

    return {
        rolls,
        total,
        success: !patzer && rolls.some(r => r.success),
        immersieg: anyImmersieg,
        // Slayende Würfel hängen ausdrücklich am ERSTEN Würfel (S.45)
        ersterImmersieg: rolls.length > 0 && rolls[0].immersieg,
        patzer
    };
}

// Vollständige Probe inklusive der optionalen Slayenden Würfel.
// options: { label, modifier, slayend }
function rollProbe(pw, options = {}) {
    const label = options.label || 'Probe';
    const modifier = options.modifier || 0;
    const effectivePw = pw + modifier;

    const haupt = einzelProbe(effectivePw, true);
    let total = haupt.total;
    let anyImmersieg = haupt.immersieg;

    // Slayende Würfel (optionale Regel, S.45): Nach einem Immersieg auf dem
    // ersten Würfel folgt sofort ein weiterer Angriff (ohne Patzer-Risiko).
    // Ist er erfolgreich, kommt sein Schaden dazu; bei erneutem Immersieg
    // wiederholt sich das Ganze.
    const slayendeWuerfe = [];
    if (options.slayend && !haupt.patzer && haupt.ersterImmersieg) {
        let weiter = true;
        // Sicherung gegen eine (theoretisch mögliche) endlose Kette
        while (weiter && slayendeWuerfe.length < 20) {
            const extra = einzelProbe(effectivePw, false);
            slayendeWuerfe.push(extra);
            if (extra.success) total += extra.total;
            if (extra.immersieg) anyImmersieg = true;
            weiter = extra.success && extra.ersterImmersieg;
        }
    }
    const slayendZusatz = slayendeWuerfe.reduce((s, w) => s + (w.success ? w.total : 0), 0);

    return {
        label,
        pw: effectivePw,
        basePw: pw,
        modifier,
        rolls: haupt.rolls,
        total,
        success: haupt.success,
        immersieg: anyImmersieg,
        patzer: haupt.patzer,
        // Zusatzwürfe der Slayenden Würfel — für Anzeige und Protokoll
        slayendeWuerfe,
        slayendZusatz,
        status: haupt.patzer ? 'patzer' : (anyImmersieg ? 'immersieg' : (haupt.success ? 'erfolg' : 'fehlschlag'))
    };
}

// Lesbare Zusammenfassung der Slayenden Würfel, z.B. "1→14, 8→8"
function slayendText(result) {
    if (!result.slayendeWuerfe || !result.slayendeWuerfe.length) return '';
    const teile = result.slayendeWuerfe.map(w =>
        `${w.rolls.map(r => r.die).join('+')}${w.success ? ` → +${w.total}` : ' → daneben'}`);
    return `Slayende Würfel: ${teile.join(', ')}`;
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
// Welche greifen, hängt von der Art der Probe ab — deshalb `art`:
//   'schlagen' | 'schiessen' | 'zaubern' | 'zielzauber' | 'abwehr'
// Die Tabelle "Position und Größe" (S.44) listet Position/Größe ausdrücklich als
// ANGRIFFSmodifikatoren; einzig "am Boden liegend" senkt auch die Abwehr.
// Liefert die Summe plus eine lesbare Aufschlüsselung.
function combatModifiers(opts = {}, art = 'schlagen') {
    const teile = [];
    let summe = 0;
    const add = (wert, text) => { if (wert) { summe += wert; teile.push(`${text} ${wert > 0 ? '+' : ''}${wert}`); } };

    const istAbwehr = art === 'abwehr';
    // Distanz, Zielen und "Ziel im Nahkampf" gelten nur für Schießen und Zielzauber (S.43-44)
    const istFernangriff = art === 'schiessen' || art === 'zielzauber';
    // Position und Größe des Ziels gelten für gezielte Angriffe
    const istAngriff = art === 'schlagen' || istFernangriff;

    if (istFernangriff) {
        // Fernkampf: −1 je 10m Entfernung. Schleuder und Wurfmesser: −1 je 2m (S.80)
        const je = opts.distanzJe || 10;
        if (opts.distanz) add(-Math.floor(opts.distanz / je), `${opts.distanz}m (−1 je ${je}m)`);
        // Fernkampf auf ein Ziel, das direkt beim Schützen steht
        if (opts.imNahkampf) add(-2, 'Ziel im Nahkampf');
        // Zielen: +2 je Runde, höchstens +10
        if (opts.zielen) add(Math.min(10, opts.zielen * 2), `${opts.zielen} Runden gezielt`);
        // Schüsse ins Getümmel: +1 je Individuum, höchstens +20 (S.44).
        // Das Ziel bestimmt der Zufall, und der Schaden wird gedeckelt.
        if (opts.getuemmel) add(Math.min(20, opts.getuemmel), `Getümmel aus ${opts.getuemmel}`);
        // Vorbei an Hindernissen schießen: −1 je Hindernis (S.44)
        if (opts.hindernisse) add(-opts.hindernisse, `${opts.hindernisse} Hindernis${opts.hindernisse === 1 ? '' : 'se'} dazwischen`);
    }

    if (istAngriff) {
        // Lage des Ziels
        if (opts.zielLiegend) add(2, 'Ziel liegt');
        if (opts.vonDerSeite) add(1, 'von der Seite/oben');
        if (opts.vonHinten) add(2, 'von hinten');
        // Größenunterschied: je Kategorie ±2
        if (opts.groessenDiff) add(opts.groessenDiff * 2, `Größenunterschied ${opts.groessenDiff > 0 ? '+' : ''}${opts.groessenDiff}`);
    }

    // Eigene Lage senkt Angriff UND Abwehr um je 2
    if (opts.selbstLiegend) add(-2, 'liegend');

    // Kampf mit zwei Waffen senkt Schlagen und Abwehr um 10 (S.43),
    // gemildert durch das Talent "Zwei Waffen" (je Rang 2 Punkte).
    if (opts.zweiWaffen && (istAbwehr || art === 'schlagen')) {
        add(-10 + (opts.zweiWaffenTalent || 0) * 2, 'zwei Waffen');
    }

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
