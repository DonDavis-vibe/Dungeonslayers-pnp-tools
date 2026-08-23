// Dungeonslayers 4 — Talent-Auswahl mit Regelprüfung
// Ein Talent ist lernbar, wenn die Klasse (oder die Heldenklasse) es führt und der
// Charakter die dort geforderte Mindeststufe erreicht hat. Jeder Rang kostet 1 TP,
// der Höchstrang steht in der jeweiligen Klassenzeile (Regelwerk S.9, S.18-19).

let talentFilter = '';
let talentShowAll = false;

// Welcher Klassenschlüssel gilt für den Zugang? Zauberwirker zählen über ihren Untertyp.
function talentKlasseKey() {
    if (appData.klasse === 'zauberwirker') return appData.subtype || null;
    return appData.klasse || null;
}

function charStufe() {
    return stufeFuerEp(appData.ep || 0, !!appData.heldenklasse);
}

// Liefert den für diesen Charakter gültigen Zugang zu einem Talent — oder null.
// Führen Basis- und Heldenklasse dasselbe Talent, gilt der bessere Höchstrang.
function talentZugang(talent) {
    const klasse = talentKlasseKey();
    const stufe = charStufe();
    let best = null;

    (talent.access || []).forEach(a => {
        if (a.klasse !== klasse) return;
        if (!best || a.maxRang > best.maxRang) {
            best = { quelle: 'klasse', minStufe: a.minStufe, maxRang: a.maxRang };
        }
    });

    if (appData.heldenklasse) {
        (talent.heldenZugang || []).forEach(h => {
            if (h.heldenklasse !== appData.heldenklasse) return;
            if (!best || h.maxRang > best.maxRang) {
                best = { quelle: 'held', minStufe: h.minStufe, maxRang: h.maxRang };
            }
        });
    }

    if (!best) return null;
    return Object.assign({ erfuellt: stufe >= best.minStufe, stufe }, best);
}

function gelernterRang(name) {
    const entry = (appData.talents || []).find(t => t.name === name);
    return entry ? (entry.rang || 0) : 0;
}

// --- Panel der gelernten Talente -------------------------------------------

// Insgesamt verdiente Talentpunkte: 1 bei Erschaffung (Menschen 2) + 1 je Stufe.
// Über Lernpunkte zusätzlich gekaufte TP zählt der Bogen über `extraTp` mit.
function verdienteTp() {
    const stufe = charStufe();
    const start = appData.volk === 'mensch' ? 2 : 1;
    return start + (stufe - 1) + (appData.extraTp || 0);
}

function ausgegebeneTp() {
    return (appData.talents || []).reduce((sum, t) => sum + (t.rang || 1), 0);
}

function renderTalents() {
    const container = document.getElementById('talent-list');
    const tp = appData.tp || 0;
    const ausgegeben = ausgegebeneTp();
    const verdient = verdienteTp();
    // Ausgegeben + offen sollte den verdienten Punkten entsprechen
    const summe = ausgegeben + tp;
    const abweichung = summe - verdient;

    const head = `<div class="budget ${abweichung === 0 ? 'done' : (abweichung > 0 ? 'over' : '')}" style="margin-bottom:0.7rem">
        Talentpunkte: <strong>${ausgegeben}</strong> ausgegeben · <strong>${tp}</strong> offen
        <span class="hint" style="margin-left:auto">
            ${abweichung === 0
                ? `passt zu Stufe ${charStufe()} (${verdient} TP)`
                : (abweichung > 0
                    ? `${abweichung} TP mehr als auf Stufe ${charStufe()} verdient (${verdient})`
                    : `${-abweichung} TP fehlen gegenüber Stufe ${charStufe()} (${verdient})`)}
        </span>
    </div>`;

    if (!appData.talents.length) {
        container.innerHTML = head + '<div class="empty-hint">Noch keine Talente gewählt. Bei der Erschaffung gibt es 1 Talentpunkt (Menschen 2).</div>';
        return;
    }

    container.innerHTML = head + appData.talents.map(t => {
        const data = typeof DS4_TALENTS !== 'undefined' ? DS4_TALENTS.find(x => x.name === t.name) : null;
        const zugang = data ? talentZugang(data) : null;
        const maxRang = zugang ? zugang.maxRang : (t.maxRang || 10);
        const rang = t.rang || 1;

        const warn = data && !zugang
            ? '<span class="tag tag-warn">für diese Klasse nicht verfügbar</span>'
            : (zugang && !zugang.erfuellt
                ? `<span class="tag tag-warn">erst ab Stufe ${zugang.minStufe}</span>` : '');

        return `<div class="talent-entry">
            <div class="talent-entry-head">
                <strong>${escapeHtml(t.name)}</strong>
                ${zugang && zugang.quelle === 'held' ? '<span class="tag">Heldenklasse</span>' : ''}
                ${warn}
                <span class="talent-rank">
                    <button class="btn btn-sm" data-trank="${escapeHtml(t.name)}" data-delta="-1" title="Rang senken (TP zurück)">−</button>
                    <span class="rank-value">Rang ${rang}<span class="eig-abbr"> / ${maxRang}</span></span>
                    <button class="btn btn-sm" data-trank="${escapeHtml(t.name)}" data-delta="1"
                        ${(rang >= maxRang || tp < 1) ? 'disabled style="opacity:0.35"' : ''}
                        title="${rang >= maxRang ? 'Höchstrang erreicht' : (tp < 1 ? 'Keine Talentpunkte übrig' : 'Rang steigern (1 TP)')}">+</button>
                </span>
                <button class="icon-btn" data-tremove="${escapeHtml(t.name)}" title="Talent entfernen">✕</button>
            </div>
            ${data ? `<div class="talent-effect">${escapeHtml(data.effekt)}</div>` : ''}
            ${data && data.proRang ? `<div class="talent-perrank">Pro Rang: ${escapeHtml(data.proRang)}</div>` : ''}
            ${data && data.voraussetzung ? `<div class="talent-perrank" style="color:var(--fail)">Voraussetzung: ${escapeHtml(data.voraussetzung)}</div>` : ''}
            ${t.notiz ? `<div class="talent-perrank">${escapeHtml(t.notiz)}</div>` : ''}
        </div>`;
    }).join('');

    container.querySelectorAll('[data-trank]').forEach(btn => {
        btn.addEventListener('click', () => changeTalentRank(btn.dataset.trank, parseInt(btn.dataset.delta, 10)));
    });
    container.querySelectorAll('[data-tremove]').forEach(btn => {
        btn.addEventListener('click', () => removeTalent(btn.dataset.tremove));
    });
}

function changeTalentRank(name, delta) {
    const entry = appData.talents.find(t => t.name === name);
    if (!entry) return;
    const data = typeof DS4_TALENTS !== 'undefined' ? DS4_TALENTS.find(x => x.name === name) : null;
    const zugang = data ? talentZugang(data) : null;
    const maxRang = zugang ? zugang.maxRang : (entry.maxRang || 10);

    if (delta > 0) {
        if ((appData.tp || 0) < 1) return;
        if ((entry.rang || 1) >= maxRang) return;
        entry.rang = (entry.rang || 1) + 1;
        appData.tp -= 1;
        addLog(`<strong>${escapeHtml(name)}</strong> auf Rang ${entry.rang} gesteigert (1 TP)`, 'erfolg');
    } else {
        if ((entry.rang || 1) <= 1) { removeTalent(name); return; }
        entry.rang -= 1;
        appData.tp = (appData.tp || 0) + 1;
        addLog(`<strong>${escapeHtml(name)}</strong> auf Rang ${entry.rang} gesenkt (1 TP zurück)`, 'neutral');
    }
    renderTalents();
    refreshBoundInputs();
    onDataChanged();
}

function removeTalent(name) {
    const entry = appData.talents.find(t => t.name === name);
    if (!entry) return;
    // Investierte Talentpunkte werden zurückgegeben
    appData.tp = (appData.tp || 0) + (entry.rang || 1);
    appData.talents = appData.talents.filter(t => t.name !== name);
    addLog(`Talent <strong>${escapeHtml(name)}</strong> entfernt (${entry.rang || 1} TP zurück)`, 'neutral');
    renderTalents();
    refreshBoundInputs();
    onDataChanged();
}

// --- Auswahl-Dialog ---------------------------------------------------------

function addTalent() {
    if (typeof DS4_TALENTS === 'undefined') {
        // Ohne Talentdaten bleibt der alte Freitext-Weg als Rückfalloption
        appData.talents.push({ id: uid(), name: 'Neues Talent', rang: 1, notiz: '' });
        renderTalents();
        onDataChanged();
        return;
    }
    talentFilter = '';
    talentShowAll = false;
    renderTalentPicker();
    openModal('talent-modal');
}

function renderTalentPicker() {
    const body = document.getElementById('talent-picker-body');
    const klasse = talentKlasseKey();
    const stufe = charStufe();

    if (!klasse) {
        body.innerHTML = '<div class="empty-hint">Bitte zuerst Klasse (und bei Zauberwirkern den Typ) wählen — davon hängt ab, welche Talente zur Verfügung stehen.</div>';
        return;
    }

    const suche = talentFilter.trim().toLowerCase();
    const eintraege = DS4_TALENTS.map(t => ({ talent: t, zugang: talentZugang(t) }))
        .filter(e => e.zugang !== null)
        .filter(e => !suche || e.talent.name.toLowerCase().includes(suche) || (e.talent.effekt || '').toLowerCase().includes(suche))
        .filter(e => talentShowAll || e.zugang.erfuellt)
        .sort((a, b) => {
            if (a.zugang.erfuellt !== b.zugang.erfuellt) return a.zugang.erfuellt ? -1 : 1;
            return a.talent.name.localeCompare(b.talent.name, 'de');
        });

    const klasseName = appData.klasse === 'zauberwirker'
        ? DS4_CLASSES.zauberwirker.subtypes[appData.subtype].name
        : DS4_CLASSES[appData.klasse].name;

    const kopf = `
        <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:0.8rem">
            <input type="text" id="talent-search" placeholder="Talent suchen..." value="${escapeHtml(talentFilter)}" style="flex:1;min-width:160px">
            <label class="radio-pill ${talentShowAll ? 'selected' : ''}" id="talent-showall">
                auch noch nicht erreichbare
            </label>
        </div>
        <div class="budget" style="margin-bottom:0.8rem">
            ${escapeHtml(klasseName)}${appData.heldenklasse ? ' / ' + escapeHtml(appData.heldenklasse) : ''} ·
            Stufe <strong>${stufe}</strong> · Offene TP: <strong>${appData.tp || 0}</strong>
            <span class="hint" style="margin-left:auto">${eintraege.length} Talente</span>
        </div>`;

    if (!eintraege.length) {
        body.innerHTML = kopf + '<div class="empty-hint">Keine passenden Talente gefunden.</div>';
        wireTalentPickerHead();
        return;
    }

    body.innerHTML = kopf + `<div class="talent-picker-list">` + eintraege.map(e => {
        const t = e.talent;
        const z = e.zugang;
        const rang = gelernterRang(t.name);
        const voll = rang >= z.maxRang;
        const kannLernen = z.erfuellt && !voll && (appData.tp || 0) >= 1;

        let knopf;
        if (!z.erfuellt) knopf = `<span class="tag tag-warn">ab Stufe ${z.minStufe}</span>`;
        else if (voll) knopf = '<span class="tag">Höchstrang</span>';
        else if (!kannLernen) knopf = '<span class="tag tag-warn">kein TP frei</span>';
        else knopf = `<button class="btn btn-sm btn-primary" data-tlearn="${escapeHtml(t.name)}">${rang ? 'Rang +1' : 'Lernen'} (1 TP)</button>`;

        return `<div class="talent-option ${z.erfuellt ? '' : 'locked'}">
            <div class="talent-entry-head">
                <strong>${escapeHtml(t.name)}</strong>
                ${rang ? `<span class="tag">Rang ${rang}/${z.maxRang}</span>` : `<span class="hint">max. Rang ${z.maxRang}</span>`}
                ${z.quelle === 'held' ? '<span class="tag">Heldenklasse</span>' : ''}
                <span style="margin-left:auto">${knopf}</span>
            </div>
            <div class="talent-effect">${escapeHtml(t.effekt)}</div>
            ${t.proRang ? `<div class="talent-perrank">Pro Rang: ${escapeHtml(t.proRang)}</div>` : ''}
            ${t.mehrfach ? `<div class="talent-perrank">Mehrfach wählbar: ${escapeHtml(t.mehrfach)}</div>` : ''}
            ${t.voraussetzung ? `<div class="talent-perrank" style="color:var(--fail)">Voraussetzung: ${escapeHtml(t.voraussetzung)}</div>` : ''}
        </div>`;
    }).join('') + '</div>';

    wireTalentPickerHead();

    body.querySelectorAll('[data-tlearn]').forEach(btn => {
        btn.addEventListener('click', () => learnTalent(btn.dataset.tlearn));
    });
}

function wireTalentPickerHead() {
    const search = document.getElementById('talent-search');
    if (search) {
        search.addEventListener('input', () => {
            talentFilter = search.value;
            const pos = search.selectionStart;
            renderTalentPicker();
            const again = document.getElementById('talent-search');
            if (again) { again.focus(); again.setSelectionRange(pos, pos); }
        });
    }
    const toggle = document.getElementById('talent-showall');
    if (toggle) {
        toggle.addEventListener('click', () => { talentShowAll = !talentShowAll; renderTalentPicker(); });
    }
}

function learnTalent(name) {
    const data = DS4_TALENTS.find(t => t.name === name);
    if (!data) return;
    const zugang = talentZugang(data);
    if (!zugang || !zugang.erfuellt) return;
    if ((appData.tp || 0) < 1) return;

    const entry = appData.talents.find(t => t.name === name);
    if (entry) {
        if ((entry.rang || 1) >= zugang.maxRang) return;
        entry.rang = (entry.rang || 1) + 1;
    } else {
        appData.talents.push({ id: uid(), name, rang: 1, maxRang: zugang.maxRang, notiz: '' });
    }
    appData.tp -= 1;

    const neu = gelernterRang(name);
    addLog(`Talent <strong>${escapeHtml(name)}</strong> auf Rang ${neu} (1 TP)`, 'erfolg');
    renderTalentPicker();
    renderTalents();
    refreshBoundInputs();
    onDataChanged();
}

// --- Volksfähigkeiten -------------------------------------------------------

// Ersetzt die einfache Auflistung durch die ausführlichen Daten aus talents.js
function renderVolksfaehigkeiten() {
    const box = document.getElementById('volk-traits');
    if (!box) return;
    if (!appData.volk) { box.innerHTML = ''; return; }

    const faehigkeiten = (typeof DS4_VOLKSFAEHIGKEITEN !== 'undefined' && DS4_VOLKSFAEHIGKEITEN[appData.volk])
        ? DS4_VOLKSFAEHIGKEITEN[appData.volk]
        : null;

    if (!faehigkeiten) {
        const race = DS4_RACES[appData.volk];
        box.innerHTML = race ? '<strong>Volksfähigkeiten:</strong> ' + race.traits.map(escapeHtml).join(' · ') : '';
        return;
    }

    box.innerHTML = '<strong>Volksfähigkeiten:</strong> ' + faehigkeiten
        .map(f => `<span title="${escapeHtml(f.effekt)}">${escapeHtml(f.name)}</span>`)
        .join(' · ') +
        '<div style="margin-top:0.3rem">' + faehigkeiten
        .map(f => `<div>• <strong>${escapeHtml(f.name)}:</strong> ${escapeHtml(f.effekt)}</div>`)
        .join('') + '</div>';
}
