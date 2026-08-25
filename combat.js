// Dungeonslayers 4 — Kampf-Tracker für den Spielleiter
// Initiative ist in DS4 ein fester Wert (AGI+BE, modifiziert durch Ausrüstung),
// kein Wurf — die Reihenfolge ergibt sich absteigend. Gleichstand wird einmalig
// pro Kampf per W20 ausgewürfelt ("Stechen", Regelwerk S.40).

let combatActive = false;
let currentRound = 0;
let combatants = [];
let turnIndex = 0;
let npcCounter = 0;

function makeNpc(preset = {}) {
    npcCounter++;
    return {
        id: 'npc-' + npcCounter,
        type: 'npc',
        name: preset.name || 'Gegner ' + npcCounter,
        initiative: preset.initiative != null ? preset.initiative : 8,
        lkMax: preset.lkMax != null ? preset.lkMax : 15,
        lkCurrent: preset.lkCurrent != null ? preset.lkCurrent : (preset.lkMax != null ? preset.lkMax : 15),
        abwehr: preset.abwehr != null ? preset.abwehr : 10,
        schlagen: preset.schlagen != null ? preset.schlagen : 12,
        // Gegnerabwehr der Bewaffnung — senkt die Abwehr des Ziels
        gaMod: preset.gaMod != null ? preset.gaMod : 0,
        // Größenkategorie (S.104) — steuert den Größenmodifikator im Angriff
        gk: preset.gk || 'normal',
        ep: preset.ep != null ? preset.ep : null,
        // normal | heroisch | episch (S.105)
        rang: 'normal',
        notiz: preset.notiz || '',
        // Abwartehandlung: +2 Initiative je abgewartete Runde, höchstens +10 (S.43)
        abwarten: 0,
        // Wird beim Kampfstart einmalig für Gleichstände ausgewürfelt (S.40).
        // Später hinzugestoßene Gegner bekommen ihn sofort.
        stechen: combatActive ? d20() : 0
    };
}

// --- Abwartehandlung (Regelwerk S.43) ---------------------------------------

// Ein abwartender Charakter steigt je Runde ohne Aktion um +2 Initiative,
// höchstens bis +10. Sobald er handelt, verfällt der Bonus.
const ABWARTEN_MAX = 10;

function effektiveInitiative(c) {
    return (c.initiative || 0) + Math.min(ABWARTEN_MAX, (c.abwarten || 0) * 2);
}

function abwartenUmschalten(id) {
    const c = combatants.find(x => x.id === id);
    if (!c) return;
    if (c.abwarten) {
        // Handelt jetzt doch — der angesammelte Bonus verfällt
        addGmLog('Spielleiter', `<strong>${escapeHtml(c.name)}</strong> handelt — der Abwarte-Bonus von +${Math.min(ABWARTEN_MAX, c.abwarten * 2)} Initiative verfällt.`, 'neutral');
        c.abwarten = 0;
    } else {
        c.abwarten = 1;
        addGmLog('Spielleiter', `<strong>${escapeHtml(c.name)}</strong> wartet ab (+2 Initiative je Runde, höchstens +${ABWARTEN_MAX}).`, 'neutral');
    }
    sortCombatants();
    renderCombat();
}

// Am Rundenwechsel steigt der Bonus aller Abwartenden weiter an
function abwartenHochzaehlen() {
    let geaendert = false;
    combatants.forEach(c => {
        if (c.abwarten && c.abwarten * 2 < ABWARTEN_MAX) { c.abwarten++; geaendert = true; }
    });
    if (geaendert) sortCombatants();
}

// --- Heroische und epische Gegner (Regelwerk S.105) -------------------------

// Macht aus einem gewöhnlichen Gegner einen Boss: Lebenskraft x5 bzw. x10,
// Abwehr +2/+4 und EIN Angriffswert +2/+4. Die EP werden vorher um
// (4 + zusätzliche Lebenskraft) erhöht und dann verdoppelt.
// Die Ausgangswerte bleiben erhalten, damit sich die Stufe zurücknehmen lässt.
function gegnerRangSetzen(id, rang) {
    const c = combatants.find(x => x.id === id);
    if (!c || !DS4_GEGNER_RAENGE[rang]) return;

    if (!c.basiswerte) {
        c.basiswerte = { lkMax: c.lkMax, abwehr: c.abwehr, schlagen: c.schlagen, ep: c.ep };
    }
    const basis = c.basiswerte;
    const stufe = DS4_GEGNER_RAENGE[rang];
    // Verletzungsgrad beibehalten, damit ein angeschlagener Gegner nicht geheilt wird
    const anteil = c.lkMax > 0 ? Math.max(0, c.lkCurrent) / c.lkMax : 1;

    c.lkMax = basis.lkMax * stufe.lkFaktor;
    c.lkCurrent = c.lkCurrent <= 0 ? c.lkCurrent : Math.round(c.lkMax * anteil);
    c.abwehr = basis.abwehr + stufe.abwehr;
    c.schlagen = basis.schlagen + stufe.angriff;

    if (basis.ep != null) {
        const zusatzLk = c.lkMax - basis.lkMax;
        c.ep = rang === 'normal' ? basis.ep : (basis.ep + 4 + zusatzLk) * stufe.epFaktor;
    }
    c.rang = rang;

    const text = rang === 'normal'
        ? `<strong>${escapeHtml(c.name)}</strong> ist wieder ein gewöhnlicher Gegner (LK ${c.lkMax}, Abwehr ${c.abwehr}).`
        : `<strong>${escapeHtml(c.name)}</strong> ist jetzt <strong>${stufe.name}</strong>: ` +
          `LK ${c.lkMax}, Abwehr ${c.abwehr}, Schlagen ${c.schlagen}` +
          (c.ep != null ? `, ${c.ep} EP` : '') +
          '. Auch die Beutewürfe sollten sich verdoppeln bzw. vervierfachen.';
    addGmLog('Spielleiter', text, rang === 'normal' ? 'neutral' : 'erfolg');

    renderCombat();
}

// Liest die Gegnerabwehr aus der Bewaffnungszeile eines Statblocks,
// z.B. "Massive Keule (WB+2; GA-2)" -> -2. Ohne Angabe: 0.
function gaAusBewaffnung(text) {
    const treffer = String(text || '').match(/GA\s*([+-−]?\s*\d+)/);
    if (!treffer) return 0;
    return parseInt(treffer[1].replace(/[\s−]/g, m => (m === '−' ? '-' : '')), 10) || 0;
}

function addNpc() {
    combatants.push(makeNpc());
    sortCombatants();
    renderCombat();
}

// --- Bestiarium -------------------------------------------------------------

let bestiaryFilter = '';

function openBestiary() {
    if (typeof DS4_BESTIARIUM === 'undefined') {
        addNpc();
        return;
    }
    bestiaryFilter = '';
    renderBestiary();
    openModal('bestiary-modal');
}

function renderBestiary() {
    const body = document.getElementById('bestiary-body');
    const suche = bestiaryFilter.trim().toLowerCase();

    const treffer = DS4_BESTIARIUM
        .filter(c => !suche || c.name.toLowerCase().includes(suche) || (c.kategorie || '').toLowerCase().includes(suche))
        .sort((a, b) => (a.gh - b.gh) || a.name.localeCompare(b.name, 'de'));

    const kopf = `
        <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:0.8rem">
            <input type="text" id="bestiary-search" placeholder="Kreatur oder Kategorie suchen..." value="${escapeHtml(bestiaryFilter)}" style="flex:1;min-width:180px">
            <span class="hint">${treffer.length} von ${DS4_BESTIARIUM.length}</span>
        </div>
        <p class="hint-rule" style="margin-bottom:0.8rem">
            <strong>GH</strong> = Gegnerhärte: die zusammengerechnete Heldenstufe einer Gruppe, die gegen
            <em>ein</em> Exemplar gute Chancen haben sollte.
        </p>`;

    if (!treffer.length) {
        body.innerHTML = kopf + '<div class="empty-hint">Keine Kreatur gefunden.</div>';
        wireBestiarySearch();
        return;
    }

    body.innerHTML = kopf + '<div class="talent-picker-list">' + treffer.map((c, i) => {
        const idx = DS4_BESTIARIUM.indexOf(c);
        const werte = [
            c.lk != null ? `LK ${c.lk}` : null,
            c.abwehr != null ? `Abwehr ${c.abwehr}` : null,
            c.initiative != null ? `Ini ${c.initiative}` : null,
            c.laufen != null ? `Laufen ${c.laufen}m` : null,
            c.schlagen != null ? `Schlagen ${c.schlagen}` : null,
            c.schiessen != null ? `Schießen ${c.schiessen}` : null,
            c.zaubern != null ? `Zaubern ${c.zaubern}` : null,
            c.zielzauber != null ? `Zielzauber ${c.zielzauber}` : null
        ].filter(Boolean).join(' · ');

        const faehigkeiten = (c.besonderes || []).map(b => b.name).join(', ');

        return `<div class="talent-option">
            <div class="talent-entry-head">
                <strong>${escapeHtml(c.name)}</strong>
                <span class="tag">GH ${c.gh}</span>
                <span class="tag">${escapeHtml(c.kategorie)}</span>
                <span class="tag" title="Größenkategorie — je Kategorie Unterschied ±2 auf den Angriff (S.44)">${escapeHtml(groessenName(c.gk))}</span>
                ${c.ep != null ? `<span class="hint">${c.ep} EP</span>` : ''}
                <span style="margin-left:auto;display:flex;gap:0.3rem">
                    <button class="btn btn-sm btn-primary" data-badd="${idx}">In den Kampf</button>
                    <button class="btn btn-sm" data-badd-karte="${idx}"
                            title="In den Kampf und zugleich als Figur auf die Karte, in passender Größe">+ Karte</button>
                </span>
            </div>
            <div class="talent-perrank">${escapeHtml(werte)}</div>
            ${c.bewaffnung || c.panzerung ? `<div class="talent-effect">${escapeHtml([c.bewaffnung, c.panzerung].filter(Boolean).join(' · '))}</div>` : ''}
            ${faehigkeiten ? `<div class="talent-effect">Besonderes: ${escapeHtml(faehigkeiten)}</div>` : ''}
        </div>`;
    }).join('') + '</div>';

    wireBestiarySearch();
    body.querySelectorAll('[data-badd]').forEach(btn => {
        btn.addEventListener('click', () => addFromBestiary(parseInt(btn.dataset.badd, 10), false));
    });
    body.querySelectorAll('[data-badd-karte]').forEach(btn => {
        btn.addEventListener('click', () => addFromBestiary(parseInt(btn.dataset.baddKarte, 10), true));
    });
}

function wireBestiarySearch() {
    const search = document.getElementById('bestiary-search');
    if (!search) return;
    search.addEventListener('input', () => {
        bestiaryFilter = search.value;
        const pos = search.selectionStart;
        renderBestiary();
        const again = document.getElementById('bestiary-search');
        if (again) { again.focus(); again.setSelectionRange(pos, pos); }
    });
}

// Einige Statblocks führen Ausdrücke statt Zahlen ("5+1") oder den Schwarmwert "SCW"
// (beim Schwarm sind LK/Abwehr/Schlagen der laufende Schwarmwert, keine feste Zahl).
// Nicht auflösbare Werte landen in `bestiaryUnklar`, damit der Spielleiter sie nachträgt.
let bestiaryUnklar = [];

function bestiaryZahl(wert, ersatz, feld) {
    if (typeof wert === 'number') return wert;
    if (typeof wert === 'string') {
        const summe = wert.split('+').map(t => parseInt(t.trim(), 10));
        if (summe.every(Number.isFinite)) return summe.reduce((a, b) => a + b, 0);
        if (feld) bestiaryUnklar.push(`${feld} = "${wert}"`);
    } else if (feld) {
        // Kreaturen ohne diesen Wert (z.B. Augenball ohne Schlagen) bekämen sonst
        // stillschweigend einen Platzhalter, den der Spielleiter für echt hält.
        bestiaryUnklar.push(`${feld} ist im Statblock nicht angegeben`);
    }
    return ersatz;
}

// auchAufKarte: setzt die Kreatur zusätzlich als Figur auf die Karte — mit der
// Größe, die ihrer Größenkategorie entspricht.
function addFromBestiary(index, auchAufKarte) {
    const c = DS4_BESTIARIUM[index];
    if (!c) return;

    // Mehrere gleiche Gegner bekommen eine laufende Nummer
    const gleiche = combatants.filter(x => x.bestiarium === c.name).length;
    const name = gleiche ? `${c.name} ${gleiche + 1}` : c.name;

    bestiaryUnklar = [];
    const lk = bestiaryZahl(c.lk, 10, 'LK');

    const npc = makeNpc({
        name,
        initiative: bestiaryZahl(c.initiative, 5, 'Initiative'),
        lkMax: lk,
        lkCurrent: lk,
        abwehr: bestiaryZahl(c.abwehr, 10, 'Abwehr'),
        schlagen: bestiaryZahl(c.schlagen, 10, 'Schlagen'),
        gaMod: gaAusBewaffnung(c.bewaffnung),
        gk: c.gk || 'normal',
        ep: c.ep,
        notiz: (c.besonderes || []).map(b => b.name).join(', ')
    });
    npc.bestiarium = c.name;
    npc.schiessen = bestiaryZahl(c.schiessen, null);
    npc.laufen = c.laufen;

    combatants.push(npc);
    sortCombatants();
    renderCombat();
    renderBestiary();

    // Auf Wunsch gleich als Figur auf die Karte, in passender Größe
    let kartenHinweis = '';
    if (auchAufKarte && typeof karte !== 'undefined' && karte && typeof figurSetzen === 'function') {
        const felder = typeof groesseAusKategorie === 'function' ? groesseAusKategorie(c.gk) : 1;
        figurSetzen({
            id: 'kampf:' + npc.id, name, farbe: '#a8342c', besitzer: 'sl', groesse: felder
        });
        const kat = (typeof DS4_GROESSENKATEGORIEN !== 'undefined' && DS4_GROESSENKATEGORIEN[c.gk]) || {};
        kartenHinweis = ` und auf die Karte gesetzt (${kat.name || c.gk}, ${String(felder).replace('.', ',')} Feld${felder === 1 ? '' : 'er'})`;
    }

    addGmLog('System', `<strong>${escapeHtml(name)}</strong> in den Kampf gestellt (GH ${c.gh}, LK ${lk}, Abwehr ${npc.abwehr})${kartenHinweis}`, 'neutral');
    if (bestiaryUnklar.length) {
        addGmLog('System', `<strong>${escapeHtml(name)}</strong>: ${escapeHtml(bestiaryUnklar.join(', '))} steht im Regelwerk nicht als feste Zahl — Platzhalter eingesetzt, bitte in der Zeile anpassen.`, 'fehlschlag');
    }
}

function removeCombatant(id) {
    combatants = combatants.filter(c => c.id !== id);
    if (turnIndex >= combatants.length) turnIndex = 0;
    renderCombat();
}

// Spieler aus dem Dashboard in den Kampf holen (Werte kommen live per Sync)
function syncPlayersIntoCombat() {
    Object.keys(connectedPlayers).forEach(peerId => {
        const p = connectedPlayers[peerId];
        const existing = combatants.find(c => c.peerId === peerId);
        if (existing) {
            existing.name = p.name;
            existing.initiative = p.initiative;
            existing.lkCurrent = p.lkCurrent;
            existing.lkMax = p.lkMax;
            existing.abwehr = p.abwehr;
        } else {
            combatants.push({
                id: 'pl-' + peerId, peerId, type: 'player',
                name: p.name, initiative: p.initiative,
                lkCurrent: p.lkCurrent, lkMax: p.lkMax,
                abwehr: p.abwehr, schlagen: p.schlagen, notiz: '', stechen: 0,
                // Die Spielervölker gelten alle als normal groß (S.104)
                gk: 'normal', abwarten: 0
            });
        }
    });
    // Spieler, die den Raum verlassen haben, fliegen aus der Reihenfolge
    combatants = combatants.filter(c => c.type !== 'player' || connectedPlayers[c.peerId]);
}

function sortCombatants() {
    combatants.sort((a, b) => (effektiveInitiative(b) - effektiveInitiative(a)) || (b.stechen - a.stechen));
}

function startCombat() {
    syncPlayersIntoCombat();
    if (!combatants.length) {
        addGmLog('System', 'Kein Teilnehmer im Kampf — erst Spieler verbinden oder Gegner anlegen.', 'fehlschlag');
        return;
    }
    // Einmaliges Stechen pro Kampf für Gleichstände
    combatants.forEach(c => { c.stechen = d20(); c.abwarten = 0; });
    sortCombatants();
    combatActive = true;
    currentRound = 1;
    turnIndex = 0;
    broadcastToPlayers({ type: 'round', round: currentRound });
    const reihenfolge = combatants.map(c => escapeHtml(c.name)).join(' → ');
    addGmLog('System', `<strong>Kampf beginnt</strong> — Runde 1. Reihenfolge: ${reihenfolge}`, 'erfolg');
    if (typeof discordPostEreignis === 'function') {
        discordPostEreignis(`⚔️ **Kampf beginnt** — Runde 1\nReihenfolge: ${combatants.map(c => c.name).join(' → ')}`, 'neutral');
    }
    renderCombat();
}

function endCombat() {
    combatActive = false;
    currentRound = 0;
    turnIndex = 0;
    broadcastToPlayers({ type: 'round', round: 0 });
    addGmLog('System', 'Kampf beendet. Nicht vergessen: <strong>Verschnaufen</strong> heilt die Hälfte der im Kampf verlorenen LK.', 'erfolg');
    if (typeof discordPostEreignis === 'function') {
        discordPostEreignis('🏁 **Kampf beendet.** Verschnaufen heilt die Hälfte der im Kampf verlorenen LK.', 'erfolg');
    }
    renderCombat();
}

function nextTurn() {
    if (!combatActive) return;
    turnIndex++;
    if (turnIndex >= combatants.length) {
        turnIndex = 0;
        currentRound++;
        abwartenHochzaehlen();
        broadcastToPlayers({ type: 'round', round: currentRound });
        addGmLog('System', `<strong>Runde ${currentRound}</strong>`, 'neutral');
    }
    renderCombat();
}

function prevTurn() {
    if (!combatActive) return;
    turnIndex--;
    if (turnIndex < 0) {
        turnIndex = Math.max(0, combatants.length - 1);
        if (currentRound > 1) currentRound--;
        broadcastToPlayers({ type: 'round', round: currentRound });
    }
    renderCombat();
}

// NSC greift an: Probe auf Schlagen, das Wurfergebnis IST der Schaden.
// Der Spieler würfelt die Abwehr selbst (siehe handleGmCommand).
function npcAttack(npcId, targetId) {
    const npc = combatants.find(c => c.id === npcId);
    const target = combatants.find(c => c.id === targetId);
    if (!npc || !target) return;

    // Slayende Würfel stehen ausdrücklich auch NSC zu (Regelwerk S.45)
    const slayend = typeof slayendeWuerfelAktiv === 'function' && slayendeWuerfelAktiv();
    // Größenunterschied: je Kategorie ±2 auf den Angriff (S.44)
    const groessenDiff = groessenDifferenz(npc.gk, target.gk);
    const groessenMod = groessenDiff * 2;
    const groessenText = groessenMod
        ? ` · ${groessenName(target.gk)} gegen ${groessenName(npc.gk)}: ${groessenMod > 0 ? '+' : ''}${groessenMod}`
        : '';
    const result = rollProbe(npc.schlagen, { label: `${npc.name}: Schlagen`, modifier: groessenMod, slayend });
    showProbeResult(result, 'gm-');

    if (!result.success) {
        const extra = result.patzer ? ` · ${DS4_KAMPFPATZER.schlagen}` : '';
        addGmLog('Spielleiter', `<strong>${escapeHtml(npc.name)}</strong> greift ${escapeHtml(target.name)} an — ${DS4_STATUS_TEXT[result.status]} (Wurf ${result.rolls.map(r => r.die).join('+')})${groessenText}${extra}`, result.status);
        return;
    }

    const damage = result.total;
    const ga = npc.gaMod || 0;
    const gaText = ga ? `, Gegnerabwehr ${ga > 0 ? '+' : ''}${ga}` : '';
    if (target.type === 'player') {
        gmAttackPlayer(target.peerId, damage, npc.name, ga);
        addGmLog('Spielleiter', `<strong>${escapeHtml(npc.name)}</strong> trifft ${escapeHtml(target.name)} für <strong>${damage}</strong> (Wurf ${result.rolls.map(r => r.die).join('+')}${gaText})${groessenText} — Abwehr beim Spieler`, result.status);
    } else {
        // NSC gegen NSC: Abwehr direkt hier auswürfeln
        const def = rollProbe(target.abwehr, { label: `${target.name}: Abwehr`, modifier: ga, slayend });
        const reduced = def.success ? def.total : 0;
        const final = Math.max(0, damage - reduced);
        target.lkCurrent -= final;
        addGmLog('Spielleiter', `<strong>${escapeHtml(npc.name)}</strong> trifft ${escapeHtml(target.name)}${groessenText}: ${damage} − ${reduced} Abwehr = <strong>${final}</strong> (LK ${target.lkCurrent}/${target.lkMax})`, final > 0 ? 'fehlschlag' : 'erfolg');
        renderCombat();
    }
}

// Der Spielleiter würfelt die Abwehr eines NSC gegen einen Spielerangriff.
// gaMod = Gegnerabwehr der angreifenden Waffe (senkt die Abwehr des Ziels).
function npcDefend(npcId, damage, gaMod = 0) {
    const npc = combatants.find(c => c.id === npcId);
    if (!npc) return;
    const slayend = typeof slayendeWuerfelAktiv === 'function' && slayendeWuerfelAktiv();
    const result = rollProbe(npc.abwehr, { label: `${npc.name}: Abwehr`, modifier: gaMod, slayend });
    showProbeResult(result, 'gm-');
    const reduced = result.success ? result.total : 0;
    const final = Math.max(0, damage - reduced);
    npc.lkCurrent -= final;

    const gaText = gaMod ? ` (inkl. ${gaMod > 0 ? '+' : ''}${gaMod} Gegnerabwehr)` : '';
    let msg = `<strong>${escapeHtml(npc.name)}</strong> wehrt ab (PW ${result.pw}${gaText}) — ${DS4_STATUS_TEXT[result.status]}: ${damage} − ${reduced} = <strong>${final}</strong> Schaden · LK ${npc.lkCurrent}/${npc.lkMax}`;
    if (npc.lkCurrent <= 0) msg += ' — <strong>besiegt!</strong>';
    addGmLog('Spielleiter', msg, npc.lkCurrent <= 0 ? 'erfolg' : 'neutral');
    renderCombat();
}

// Nimmt Eingaben wie "16" oder "16 -2" entgegen (Schaden plus Gegnerabwehr).
function parseDamageInput(text) {
    if (!text) return null;
    const teile = String(text).trim().split(/\s+/);
    const schaden = parseInt(teile[0], 10);
    if (isNaN(schaden)) return null;
    const ga = teile.length > 1 ? (parseInt(teile[1], 10) || 0) : 0;
    return { schaden, ga };
}

function damageNpc(npcId, amount) {
    const npc = combatants.find(c => c.id === npcId);
    if (!npc) return;
    npc.lkCurrent -= amount;
    addGmLog('Spielleiter', `<strong>${escapeHtml(npc.name)}</strong>: ${amount > 0 ? amount + ' Schaden' : (-amount) + ' geheilt'} — LK ${npc.lkCurrent}/${npc.lkMax}${npc.lkCurrent <= 0 ? ' — <strong>besiegt!</strong>' : ''}`, amount > 0 ? 'fehlschlag' : 'erfolg');
    renderCombat();
}

// --- Rendering --------------------------------------------------------------

function renderCombat() {
    const box = document.getElementById('combat-tracker');
    if (!box) return;

    if (combatActive) syncPlayersIntoCombat();
    // Kampfstand über einen versehentlichen Reload retten
    if (typeof sitzungSichern === 'function') sitzungSichern();

    const header = `
        <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;margin-bottom:0.8rem">
            ${combatActive
                ? `<span class="tag" style="font-size:0.9rem">Runde <strong>${currentRound}</strong></span>
                   <button class="btn btn-sm" onclick="prevTurn()">← Zurück</button>
                   <button class="btn btn-sm btn-primary" onclick="nextTurn()">Nächster Zug →</button>
                   <button class="btn btn-sm btn-danger" onclick="endCombat()">Kampf beenden</button>`
                : `<button class="btn btn-sm btn-primary" onclick="startCombat()">⚔️ Kampf starten</button>`}
            <button class="btn btn-sm" onclick="openBestiary()">👹 Bestiarium</button>
            <button class="btn btn-sm btn-ghost" onclick="addNpc()">+ Eigener Gegner</button>
            <button class="btn btn-sm btn-ghost" onclick="syncPlayersIntoCombat();sortCombatants();renderCombat()">Spieler übernehmen</button>
        </div>`;

    if (!combatants.length) {
        box.innerHTML = header + '<div class="empty-hint">Noch keine Teilnehmer. Gegner anlegen oder verbundene Spieler übernehmen.</div>';
        return;
    }

    const targetOptions = combatants.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

    const rows = combatants.map((c, i) => {
        const isTurn = combatActive && i === turnIndex;
        const lkPct = c.lkMax > 0 ? Math.max(0, Math.min(100, (c.lkCurrent / c.lkMax) * 100)) : 0;
        const lkColor = lkPct > 50 ? 'var(--success)' : (lkPct > 25 ? 'var(--accent)' : 'var(--fail)');
        const down = c.lkCurrent <= 0;

        return `<div class="combat-row ${isTurn ? 'active-turn' : ''} ${down ? 'defeated' : ''}">
            <div class="combat-init" title="${c.abwarten ? 'Initiative ' + c.initiative + ' + ' + Math.min(ABWARTEN_MAX, c.abwarten * 2) + ' vom Abwarten' : 'Initiative'}">
                ${effektiveInitiative(c)}${c.abwarten ? '<span class="combat-abwarten">⏳</span>' : ''}
            </div>
            <div class="combat-main">
                <div class="combat-name">
                    ${isTurn ? '<span style="color:var(--accent-bright)">▶</span> ' : ''}
                    ${c.type === 'player' ? '🛡️' : '👹'}
                    ${c.type === 'npc'
                        ? `<input type="text" value="${escapeHtml(c.name)}" data-cf="name" data-cid="${c.id}" style="width:9rem">`
                        : `<strong>${escapeHtml(c.name)}</strong>`}
                    ${down ? '<span class="tag tag-warn" title="Der schnelle Tod (S.104): Gegner unter 1 LK sollten zugunsten des Spieltempos als tot gelten — wichtige NSC ausgenommen.">besiegt</span>' : ''}
                    ${c.rang && c.rang !== 'normal' ? `<span class="tag" style="border-color:var(--accent-bright);color:var(--accent-bright)">${escapeHtml(DS4_GEGNER_RAENGE[c.rang].name)}</span>` : ''}
                </div>
                <div class="lk-bar-track" style="margin-top:0.25rem;height:10px">
                    <div class="lk-bar-fill" style="width:${lkPct}%;background:${lkColor}"></div>
                </div>
                <div class="combat-stats">
                    ${c.type === 'npc' ? `
                        LK <input type="number" value="${c.lkCurrent}" data-cf="lkCurrent" data-cid="${c.id}" style="width:3.2rem">
                        / <input type="number" value="${c.lkMax}" data-cf="lkMax" data-cid="${c.id}" style="width:3.2rem">
                        · Ini <input type="number" value="${c.initiative}" data-cf="initiative" data-cid="${c.id}" style="width:3rem">
                        · Abw <input type="number" value="${c.abwehr}" data-cf="abwehr" data-cid="${c.id}" style="width:3rem">
                        · Schl <input type="number" value="${c.schlagen}" data-cf="schlagen" data-cid="${c.id}" style="width:3rem">
                        · <span title="Gegnerabwehr der Bewaffnung — senkt die Abwehr des Ziels">GA</span>
                        <input type="number" value="${c.gaMod || 0}" data-cf="gaMod" data-cid="${c.id}" style="width:3rem">
                        <br>
                        <span title="Größenkategorie (S.104) — je Kategorie Unterschied ±2 auf den Angriff">Größe</span>
                        <select data-cf="gk" data-cid="${c.id}" style="font-size:0.78rem;padding:0.1rem">
                            ${DS4_GROESSEN_REIHE.map(k => `<option value="${k}" ${(c.gk || 'normal') === k ? 'selected' : ''}>${escapeHtml(groessenName(k))}</option>`).join('')}
                        </select>
                        · <span title="Heroische und epische Gegner (S.105): LK x5 bzw. x10, Abwehr +2/+4, ein Angriff +2/+4">Rang</span>
                        <select data-rang="${c.id}" style="font-size:0.78rem;padding:0.1rem">
                            ${Object.entries(DS4_GEGNER_RAENGE).map(([key, r]) => `<option value="${key}" ${(c.rang || 'normal') === key ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('')}
                        </select>
                        ${c.ep != null ? `· <span class="hint">${c.ep} EP</span>` : ''}
                    ` : `
                        LK <strong style="color:${lkColor}">${c.lkCurrent}/${c.lkMax}</strong>
                        · Abwehr <strong>${c.abwehr}</strong> · Schlagen <strong>${c.schlagen}</strong>
                    `}
                </div>
                <div class="combat-actions">
                    ${c.type === 'npc' ? `
                        <select data-attack-from="${c.id}" style="font-size:0.78rem;padding:0.15rem">
                            <option value="">Ziel...</option>${targetOptions}
                        </select>
                        <button class="btn btn-sm" data-do-attack="${c.id}">Angriff</button>
                        <button class="btn btn-sm btn-ghost" data-defend="${c.id}" title="Abwehr gegen Spielerangriff würfeln">Abwehr</button>
                        <button class="btn btn-sm btn-ghost ${c.abwarten ? 'btn-primary' : ''}" data-abwarten="${c.id}"
                                title="Abwartehandlung: +2 Initiative je Runde ohne Aktion, höchstens +10">⏳</button>
                        <button class="btn btn-sm btn-danger" data-dmg="${c.id}">− LK</button>
                    ` : `
                        <button class="btn btn-sm btn-danger" data-pattack="${c.peerId}" title="Angriff — der Spieler würfelt seine Abwehr">Angreifen</button>
                        <button class="btn btn-sm" data-pheal="${c.peerId}">Heilen</button>
                        <button class="btn btn-sm btn-ghost" data-pmsg="${c.peerId}">Flüstern</button>
                        <button class="btn btn-sm btn-ghost ${c.abwarten ? 'btn-primary' : ''}" data-abwarten="${c.id}"
                                title="Abwartehandlung: +2 Initiative je Runde ohne Aktion, höchstens +10">⏳</button>
                    `}
                    <button class="icon-btn" data-crm="${c.id}" title="Entfernen">✕</button>
                </div>
            </div>
        </div>`;
    }).join('');

    box.innerHTML = header + rows;
    wireCombatControls(box);
}

function wireCombatControls(box) {
    box.querySelectorAll('[data-cf]').forEach(input => {
        input.addEventListener('input', () => {
            const c = combatants.find(x => x.id === input.dataset.cid);
            if (!c) return;
            c[input.dataset.cf] = input.type === 'number' ? (parseInt(input.value, 10) || 0) : input.value;
        });
        input.addEventListener('change', () => { sortCombatants(); renderCombat(); });
    });

    box.querySelectorAll('[data-do-attack]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.doAttack;
            const sel = box.querySelector(`[data-attack-from="${id}"]`);
            if (!sel.value) { addGmLog('System', 'Bitte erst ein Ziel wählen.', 'fehlschlag'); return; }
            npcAttack(id, sel.value);
        });
    });

    box.querySelectorAll('[data-defend]').forEach(btn => {
        btn.addEventListener('click', () => {
            const eingabe = parseDamageInput(prompt(
                'Eingehender Schaden (Wurfergebnis des Spielers).\n' +
                'Gegnerabwehr der Waffe optional dahinter, z.B. "16 -2":'));
            if (eingabe) npcDefend(btn.dataset.defend, eingabe.schaden, eingabe.ga);
        });
    });

    box.querySelectorAll('[data-dmg]').forEach(btn => {
        btn.addEventListener('click', () => {
            const dmg = parseInt(prompt('Schaden (negativ = Heilung):'), 10);
            if (!isNaN(dmg)) damageNpc(btn.dataset.dmg, dmg);
        });
    });

    box.querySelectorAll('[data-pattack]').forEach(btn => {
        btn.addEventListener('click', () => {
            const eingabe = parseDamageInput(prompt(
                'Schaden des Angriffs (Wurfergebnis) — der Spieler würfelt selbst die Abwehr.\n' +
                'Gegnerabwehr optional dahinter, z.B. "14 -2":'));
            if (eingabe) gmAttackPlayer(btn.dataset.pattack, eingabe.schaden, 'Spielleiter', eingabe.ga);
        });
    });

    box.querySelectorAll('[data-pheal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(prompt('Wie viele LK heilen?'), 10);
            if (!isNaN(amount)) gmHealPlayer(btn.dataset.pheal, amount);
        });
    });

    box.querySelectorAll('[data-pmsg]').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = prompt('Nachricht an diesen Spieler:');
            if (text) gmSendMessage(btn.dataset.pmsg, text);
        });
    });

    box.querySelectorAll('[data-rang]').forEach(sel => {
        sel.addEventListener('change', () => gegnerRangSetzen(sel.dataset.rang, sel.value));
    });

    box.querySelectorAll('[data-abwarten]').forEach(btn => {
        btn.addEventListener('click', () => abwartenUmschalten(btn.dataset.abwarten));
    });

    box.querySelectorAll('[data-crm]').forEach(btn => {
        btn.addEventListener('click', () => removeCombatant(btn.dataset.crm));
    });
}
