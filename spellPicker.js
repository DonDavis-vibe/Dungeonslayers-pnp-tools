// Dungeonslayers 4 — Zauberauswahl mit Zugangsprüfung
// Jeder Zauber nennt je Zauberwirker-Typ die Stufe, ab der er gelernt werden darf.
// Neue Zauber kosten weder Lern- noch Talentpunkte; pro Stufenaufstieg dürfen Zauber
// gelernt werden, deren Zauberstufen zusammen die neue Charakterstufe ergeben (S.9).

// Zauberliste inklusive eigener Ergänzungen aus den Hausregeln
function zauberListe() {
    if (typeof alleZauber === 'function') return alleZauber();
    return typeof DS4_ZAUBER !== 'undefined' ? DS4_ZAUBER : [];
}

let spellFilter = '';
let spellShowAll = false;

function zauberKlasseKey() {
    return appData.klasse === 'zauberwirker' ? (appData.subtype || null) : null;
}

// Zugangsstufe dieses Zaubers für den aktuellen Charakter — oder null.
function zauberZugang(zauber) {
    const klasse = zauberKlasseKey();
    if (!klasse) return null;
    const eintrag = (zauber.zugang || []).find(z => z.klasse === klasse);
    if (!eintrag) return null;
    const stufe = charStufe();
    return { minStufe: eintrag.stufe, erfuellt: stufe >= eintrag.stufe, stufe };
}

function kenntZauber(name) {
    return (appData.spells || []).some(s => s.name === name);
}

// --- Panel der bekannten Zauber ---------------------------------------------

function renderSpells() {
    const container = document.getElementById('spell-list');
    if (!container) return;

    const kopf = `<div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.7rem;flex-wrap:wrap">
        <span class="budget">Bekannte Zauber: <strong>${appData.spells.length}</strong></span>
        <span class="hint" style="margin-left:auto">Nur ein Zauber kann vorbereitet sein</span>
    </div>`;

    if (!appData.spells.length) {
        container.innerHTML = kopf + '<div class="empty-hint">Noch keine Zauber. Zauberwirker starten mit einem Zauber der Stufe 1.</div>';
        return;
    }

    container.innerHTML = kopf + appData.spells.map(s => {
        const data = typeof DS4_ZAUBER !== 'undefined' ? zauberListe().find(z => z.name === s.name) : null;
        const onCooldown = s.cooldownUntil && typeof currentRound === 'number' && currentRound > 0 && currentRound < s.cooldownUntil;
        const typ = data ? data.typ : (s.typ || 'normal');
        const probe = typ === 'ziel' ? 'Zielzauber' : 'Zaubern';

        return `<div class="talent-entry" ${onCooldown ? 'style="opacity:0.62"' : ''}>
            <div class="talent-entry-head">
                <button class="btn btn-sm ${s.prepared ? 'btn-primary' : 'btn-ghost'}" data-prepare="${escapeHtml(s.name)}"
                        title="Vorbereiteten Zauber setzen — Wechseln kostet im Kampf eine Aktion und eine GEI+VE-Probe">
                    ${s.prepared ? '★ vorbereitet' : '☆ vorbereiten'}
                </button>
                <strong>${escapeHtml(s.name)}</strong>
                <span class="tag">${probe}</span>
                ${data && data.geistesbeeinflussend ? '<span class="tag">geistesbeeinflussend</span>' : ''}
                ${onCooldown ? `<span class="tag tag-warn">abklingend bis Runde ${s.cooldownUntil}</span>` : ''}
                <span style="margin-left:auto;display:flex;gap:0.3rem;align-items:center">
                    <span class="hint">ZB ${escapeHtml(String(s.zb ?? (data ? data.zb : 0)))}</span>
                    <button class="icon-btn" data-sremove="${escapeHtml(s.name)}" title="Zauber entfernen">✕</button>
                </span>
            </div>
            <div class="talent-effect">${escapeHtml(data ? data.effekt : (s.effekt || ''))}</div>
            <div class="talent-perrank">
                ${data ? `Dauer: ${escapeHtml(data.dauer)} · Distanz: ${escapeHtml(data.distanz)} · Abklingzeit: ${escapeHtml(data.abklingzeit)}`
                       : `Abklingzeit: ${escapeHtml(s.abklingzeit || '—')}`}
            </div>
        </div>`;
    }).join('');

    container.querySelectorAll('[data-prepare]').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.prepare;
            const target = appData.spells.find(s => s.name === name);
            const war = target.prepared;
            appData.spells.forEach(s => { s.prepared = false; });
            target.prepared = !war;
            renderSpells();
            onDataChanged();
        });
    });
    container.querySelectorAll('[data-sremove]').forEach(btn => {
        btn.addEventListener('click', () => {
            appData.spells = appData.spells.filter(s => s.name !== btn.dataset.sremove);
            renderSpells();
            onDataChanged();
        });
    });
}

// --- Auswahl-Dialog ---------------------------------------------------------

function addSpell() {
    if (typeof DS4_ZAUBER === 'undefined') {
        appData.spells.push({ id: uid(), name: 'Neuer Zauber', zb: 0, abklingzeit: '', effekt: '', prepared: false });
        renderSpells();
        onDataChanged();
        return;
    }
    spellFilter = '';
    spellShowAll = false;
    renderSpellPicker();
    openModal('spell-modal');
}

function renderSpellPicker() {
    const body = document.getElementById('spell-picker-body');
    const klasse = zauberKlasseKey();

    if (!klasse) {
        body.innerHTML = '<div class="empty-hint">Nur Zauberwirker können Zauber lernen — bitte Klasse und Typ (Heiler / Zauberer / Schwarzmagier) wählen.</div>';
        return;
    }

    const suche = spellFilter.trim().toLowerCase();
    const eintraege = zauberListe().map(z => ({ zauber: z, zugang: zauberZugang(z) }))
        .filter(e => e.zugang !== null)
        .filter(e => !suche || e.zauber.name.toLowerCase().includes(suche) || (e.zauber.effekt || '').toLowerCase().includes(suche))
        .filter(e => spellShowAll || e.zugang.erfuellt)
        .sort((a, b) => (a.zugang.minStufe - b.zugang.minStufe) || a.zauber.name.localeCompare(b.zauber.name, 'de'));

    const typName = DS4_CLASSES.zauberwirker.subtypes[klasse].name;

    const kopf = `
        <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:0.8rem">
            <input type="text" id="spell-search" placeholder="Zauber suchen..." value="${escapeHtml(spellFilter)}" style="flex:1;min-width:160px">
            <label class="radio-pill ${spellShowAll ? 'selected' : ''}" id="spell-showall">auch höherstufige</label>
        </div>
        <div class="budget" style="margin-bottom:0.8rem">
            ${escapeHtml(typName)} · Stufe <strong>${charStufe()}</strong>
            <span class="hint" style="margin-left:auto">${eintraege.length} Zauber</span>
        </div>
        <p class="hint-rule" style="margin-bottom:0.8rem">
            Zauber kosten keine Lern- oder Talentpunkte. Pro Stufenaufstieg dürfen Zauber gelernt werden,
            deren Zauberstufen zusammen die neue Charakterstufe ergeben — der Spielleiter entscheidet,
            ob der Spruch überhaupt aufzutreiben ist.
        </p>`;

    if (!eintraege.length) {
        body.innerHTML = kopf + '<div class="empty-hint">Keine passenden Zauber gefunden.</div>';
        wireSpellPickerHead();
        return;
    }

    body.innerHTML = kopf + '<div class="talent-picker-list">' + eintraege.map(e => {
        const z = e.zauber;
        const zg = e.zugang;
        const bekannt = kenntZauber(z.name);

        let knopf;
        if (!zg.erfuellt) knopf = `<span class="tag tag-warn">ab Stufe ${zg.minStufe}</span>`;
        else if (bekannt) knopf = '<span class="tag">bekannt</span>';
        else knopf = `<button class="btn btn-sm btn-primary" data-slearn="${escapeHtml(z.name)}">Lernen</button>`;

        return `<div class="talent-option ${zg.erfuellt ? '' : 'locked'}">
            <div class="talent-entry-head">
                <strong>${escapeHtml(z.name)}</strong>
                <span class="tag">Stufe ${zg.minStufe}</span>
                <span class="tag">${z.typ === 'ziel' ? 'Zielzauber' : 'Zaubern'}</span>
                ${z.geistesbeeinflussend ? '<span class="tag">geistesbeeinflussend</span>' : ''}
                ${z.eigen ? '<span class="tag">Hausregel</span>' : ''}
                <span style="margin-left:auto">${knopf}</span>
            </div>
            <div class="talent-effect">${escapeHtml(z.effekt)}</div>
            <div class="talent-perrank">
                ZB ${escapeHtml(String(z.zb))} · Dauer: ${escapeHtml(z.dauer)} · Distanz: ${escapeHtml(z.distanz)} ·
                Abklingzeit: ${escapeHtml(z.abklingzeit)} · Preis: ${escapeHtml(String(z.preis))} GM
            </div>
        </div>`;
    }).join('') + '</div>';

    wireSpellPickerHead();
    body.querySelectorAll('[data-slearn]').forEach(btn => {
        btn.addEventListener('click', () => learnSpell(btn.dataset.slearn));
    });
}

function wireSpellPickerHead() {
    const search = document.getElementById('spell-search');
    if (search) {
        search.addEventListener('input', () => {
            spellFilter = search.value;
            const pos = search.selectionStart;
            renderSpellPicker();
            const again = document.getElementById('spell-search');
            if (again) { again.focus(); again.setSelectionRange(pos, pos); }
        });
    }
    const toggle = document.getElementById('spell-showall');
    if (toggle) toggle.addEventListener('click', () => { spellShowAll = !spellShowAll; renderSpellPicker(); });
}

function learnSpell(name) {
    const data = zauberListe().find(z => z.name === name);
    if (!data || kenntZauber(name)) return;
    const zugang = zauberZugang(data);
    if (!zugang || !zugang.erfuellt) return;

    appData.spells.push({
        id: uid(),
        name: data.name,
        typ: data.typ,
        zb: data.zb,
        dauer: data.dauer,
        distanz: data.distanz,
        abklingzeit: data.abklingzeit,
        effekt: data.effekt,
        prepared: appData.spells.length === 0, // der erste Zauber ist gleich vorbereitet
        cooldownUntil: 0
    });

    addLog(`Zauber <strong>${escapeHtml(name)}</strong> gelernt.`, 'erfolg');
    renderSpellPicker();
    renderSpells();
    onDataChanged();
}
