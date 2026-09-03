// Dungeonslayers 4 — Talent-Auswahl mit Regelprüfung
// Ein Talent ist lernbar, wenn die Klasse (oder die Heldenklasse) es führt und der
// Charakter die dort geforderte Mindeststufe erreicht hat. Jeder Rang kostet 1 TP,
// der Höchstrang steht in der jeweiligen Klassenzeile (Regelwerk S.9, S.18-19).

let talentFilter = '';
let talentShowAll = false;

// Talentliste inklusive eigener Ergänzungen aus den Hausregeln
function talentListe() {
    if (typeof alleTalente === 'function') return alleTalente();
    return typeof DS4_TALENTS !== 'undefined' ? DS4_TALENTS : [];
}

// Führt die Runde einen zweiten Talentpunkt-Topf?
function ntpAktiv() {
    return typeof hausregeln !== 'undefined' && hausregeln.ntpAktiv;
}
function ntpName() {
    return (typeof hausregeln !== 'undefined' && hausregeln.ntpName) || 'NTP';
}

// Aus welchem Topf wird gerade bezahlt? 'tp' oder 'ntp'
let talentTopf = 'tp';

function talentTopfWaehlen(topf) {
    talentTopf = topf;
    renderTalentPicker();
}

function verfuegbarePunkte(topf) {
    return (topf === 'ntp' ? (appData.ntp || 0) : (appData.tp || 0));
}

// Welcher Klassenschlüssel gilt für den Zugang? Zauberwirker zählen über ihren Untertyp.
function talentKlasseKey() {
    if (appData.klasse === 'zauberwirker') return appData.subtype || null;
    return appData.klasse || null;
}

function charStufe() {
    return stufeFuerEp(appData.ep || 0, typeof heldStufenModus === 'function' ? heldStufenModus() : !!appData.heldenklasse);
}

// Fanwerk "Heldenklassen neu": Talente, die dieser Charakter NUR über die
// Heldenklasse hat (nicht schon über die Grundklasse auf seiner Stufe). Unter
// Stufe 5 darf davon genau EINES bis Rang I gelernt werden.
let _heldTalenteCache = null;
function heldNurTalente() {
    const sig = (appData.heldenklasse || '') + '|' + charStufe() + '|' +
        (appData.talents || []).map(t => t.name).join(',');
    if (_heldTalenteCache && _heldTalenteCache.sig === sig) return _heldTalenteCache.val;

    const klasse = talentKlasseKey();
    const stufe = charStufe();
    const val = [];
    (appData.talents || []).forEach(t => {
        const d = talentDaten(t.name);
        if (!d) return;
        const perHeld = (d.heldenZugang || []).some(h => h.heldenklasse === appData.heldenklasse);
        if (!perHeld) return;
        const perGrund = (d.access || []).some(a => a.klasse === klasse && stufe >= a.minStufe);
        if (!perGrund && !val.includes(t.name)) val.push(t.name);
    });
    _heldTalenteCache = { sig, val };
    return val;
}
function heldFruehEinzeltalentFrei(name) {
    const gelernt = heldNurTalente();
    return gelernt.length === 0 || (gelernt.length === 1 && gelernt[0] === name);
}

// Liefert den für diesen Charakter gültigen Zugang zu einem Talent — oder null.
// Basis- und Heldenklasse können dasselbe Talent führen. Heldenklassen erlauben
// oft einen höheren Höchstrang, verlangen dafür aber eine höhere Mindeststufe —
// deshalb zählt zuerst, welcher Zugang überhaupt schon offensteht. Sonst würde
// ein frisch gewählter Paladin auf Stufe 10 sein Krieger-Talent "Kämpfer"
// (ab Stufe 1) verlieren, nur weil der Paladin-Eintrag erst ab Stufe 12 gilt.
function talentZugang(talent) {
    const klasse = talentKlasseKey();
    const stufe = charStufe();
    const kandidaten = [];

    (talent.access || []).forEach(a => {
        if (a.klasse === klasse) kandidaten.push({ quelle: 'klasse', minStufe: a.minStufe, maxRang: a.maxRang });
    });
    if (appData.heldenklasse) {
        const frueh = typeof heldenklassenFruehAktiv === 'function' && heldenklassenFruehAktiv();
        (talent.heldenZugang || []).forEach(h => {
            if (h.heldenklasse !== appData.heldenklasse) return;
            if (frueh) {
                // "Heldenklassen neu": Zugangsstufe = Charakterstufe/2 (Stufe-10-
                // Talent ab Stufe 5, Stufe-12-Talent ab Stufe 6, ...).
                kandidaten.push({ quelle: 'held', minStufe: Math.ceil(h.minStufe / 2), maxRang: h.maxRang });
                // Unter Stufe 5: einmalig Rang I eines Stufe-10-Heldenklassen-Talents
                if (stufe < 5 && h.minStufe <= 10 && heldFruehEinzeltalentFrei(talent.name)) {
                    kandidaten.push({ quelle: 'held', minStufe: 1, maxRang: 1 });
                }
            } else {
                kandidaten.push({ quelle: 'held', minStufe: h.minStufe, maxRang: h.maxRang });
            }
        });
    }
    if (!kandidaten.length) return null;

    const offen = kandidaten.filter(k => stufe >= k.minStufe);
    // Erreichbar: der beste Höchstrang. Noch keiner erreichbar: der, der zuerst kommt.
    const best = offen.length
        ? offen.reduce((a, b) => (b.maxRang > a.maxRang ? b : a))
        : kandidaten.reduce((a, b) => (b.minStufe < a.minStufe ? b : a));

    // Steht später ein höherer Höchstrang in Aussicht, wird das am Talent vermerkt
    const spaeter = kandidaten
        .filter(k => k.minStufe > stufe && k.maxRang > best.maxRang)
        .sort((a, b) => a.minStufe - b.minStufe)[0] || null;

    return Object.assign({ erfuellt: offen.length > 0, stufe, spaeter }, best);
}

// Handwerk, Wissensgebiet, Instrument und Waffenkenner werden laut Regelwerk
// (S.34, S.47) für JEDES Gebiet einzeln erlernt und jeweils bis Höchstrang
// gesteigert. Ein Charakter kann also "Handwerk (Schmied) III" UND
// "Handwerk (Schreiner) I" besitzen — deshalb identifiziert der Bogen solche
// Talente über Name + Gebiet statt nur über den Namen.
function istMehrfachTalent(data) {
    return !!(data && data.mehrfach);
}

function talentDaten(name) {
    return talentListe().find(t => t.name === name) || null;
}

// Alle Einträge eines Talents (bei mehrfach erwerbbaren also mehrere)
function talentEintraege(name) {
    return (appData.talents || []).filter(t => t.name === name);
}

// Die Gebiete, die der Charakter in diesem Talent beherrscht — mit ihrem Rang
function talentGebiete(name) {
    return talentEintraege(name)
        .filter(t => t.gebiet)
        .map(t => ({ gebiet: t.gebiet, rang: t.rang || 1 }));
}

function gelernterRang(name, gebiet) {
    const treffer = (appData.talents || [])
        .find(t => t.name === name && (gebiet === undefined || (t.gebiet || '') === gebiet));
    return treffer ? (treffer.rang || 0) : 0;
}

// Höchster in diesem Talent erreichter Rang — für die Anzeige im Auswahldialog
function hoechsterRang(name) {
    return talentEintraege(name).reduce((max, t) => Math.max(max, t.rang || 1), 0);
}

// Talente mit fester Auswahl: Vertrauter (welchen Kampfwert der Vertraute +1
// gibt), Zauber auslösen (welche Zauberklasse für Schriftrollen freigeschaltet
// ist). Bei proRang gibt es eine Auswahl je Talentrang. Gespeichert wird als
// Array t.wahl, Index = Rang-Slot.
function talentWahlHtml(t, data) {
    if (!data || !data.wahl) return '';
    const w = data.wahl;
    const slots = w.proRang ? (t.rang || 1) : 1;
    const gewaehlt = Array.isArray(t.wahl) ? t.wahl : (t.wahl ? [t.wahl] : []);

    let zeilen = '';
    for (let i = 0; i < slots; i++) {
        const opts = ['<option value="">— wählen —</option>'].concat(
            w.optionen.map(o => `<option value="${escapeHtml(o)}"${o === (gewaehlt[i] || '') ? ' selected' : ''}>${escapeHtml(o)}</option>`)
        ).join('');
        zeilen += `<div style="display:flex;align-items:center;gap:0.4rem;margin-top:0.25rem">
            <label style="font-size:0.72rem;color:var(--text-dim)">${escapeHtml(w.label)}${slots > 1 ? ` ${i + 1}` : ''}:</label>
            <select data-twahl="${t.id}" data-slot="${i}" style="flex:1;max-width:15rem;font-size:0.8rem">${opts}</select>
        </div>`;
    }
    return `<div class="talent-perrank">${zeilen}</div>`;
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
    const TT = window.t || ((s) => s);
    const tp = appData.tp || 0;
    const ausgegeben = ausgegebeneTp();
    const verdient = verdienteTp();
    // Ausgegeben + offen sollte den verdienten Punkten entsprechen
    const summe = ausgegeben + tp;
    const abweichung = summe - verdient;

    const head = `<div class="budget ${abweichung === 0 ? 'done' : (abweichung > 0 ? 'over' : '')}" style="margin-bottom:0.7rem">
        ${TT('Talentpunkte:')} <strong>${ausgegeben}</strong> ${TT('ausgegeben')} · <strong>${tp}</strong> ${TT('offen')}${ntpAktiv() ? ` · <strong>${appData.ntp || 0}</strong> ${escapeHtml(ntpName())}` : ''}
        <span class="hint" style="margin-left:auto">
            ${ntpAktiv()
                ? TT('Hausregeln aktiv — zwei getrennte Töpfe')
                : abweichung === 0
                ? `${TT('passt zu Stufe')} ${charStufe()} (${verdient} TP)`
                : (abweichung > 0
                    ? `${abweichung} ${TT('TP mehr als auf Stufe')} ${charStufe()} ${TT('verdient')} (${verdient})`
                    : `${-abweichung} ${TT('TP fehlen gegenüber Stufe')} ${charStufe()} (${verdient})`)}
        </span>
    </div>`;

    if (!appData.talents.length) {
        container.innerHTML = head + `<div class="empty-hint">${TT('Noch keine Talente gewählt. Bei der Erschaffung gibt es 1 Talentpunkt (Menschen 2).')}</div>`;
        return;
    }

    container.innerHTML = head + appData.talents.map(t => {
        const data = typeof DS4_TALENTS !== 'undefined' ? talentListe().find(x => x.name === t.name) : null;
        const zugang = data ? talentZugang(data) : null;
        const maxRang = zugang ? zugang.maxRang : (t.maxRang || 10);
        const rang = t.rang || 1;

        const warn = data && !zugang
            ? `<span class="tag tag-warn">${TT('für diese Klasse nicht verfügbar')}</span>`
            : (zugang && !zugang.erfuellt
                ? `<span class="tag tag-warn">${TT('erst ab Stufe')} ${zugang.minStufe}</span>` : '');

        const mehrfach = istMehrfachTalent(data);

        return `<div class="talent-entry">
            <div class="talent-entry-head">
                <strong>${escapeHtml(t.name)}${t.gebiet ? ` (${escapeHtml(t.gebiet)})` : ''}</strong>
                ${mehrfach && !t.gebiet ? `<span class="tag tag-warn">${TT('Gebiet fehlt')}</span>` : ''}
                ${zugang && zugang.quelle === 'held' ? `<span class="tag">${TT('Heldenklasse')}</span>` : ''}
                ${data && data.eigen ? `<span class="tag">${TT('Hausregel')}</span>` : ''}
                ${t.topf === 'ntp' ? `<span class="tag">${escapeHtml(ntpName())}</span>` : ''}
                ${warn}
                <span class="talent-rank">
                    <button class="btn btn-sm" data-trank="${t.id}" data-delta="-1" title="${TT('Rang senken (TP zurück)')}">−</button>
                    <span class="rank-value">${TT('Rang')} ${rang}<span class="eig-abbr"> / ${maxRang}</span></span>
                    <button class="btn btn-sm" data-trank="${t.id}" data-delta="1"
                        ${(rang >= maxRang || verfuegbarePunkte(t.topf === 'ntp' ? 'ntp' : 'tp') < 1) ? 'disabled style="opacity:0.35"' : ''}
                        title="${rang >= maxRang ? TT('Höchstrang erreicht') : TT('Rang steigern') + ' (1 ' + (t.topf === 'ntp' ? escapeHtml(ntpName()) : 'TP') + ')'}">+</button>
                </span>
                <button class="icon-btn" data-tremove="${t.id}" title="${TT('Talent entfernen')}">✕</button>
            </div>
            ${data ? `<div class="talent-effect">${escapeHtml(data.effekt)}</div>` : ''}
            ${data && data.proRang ? `<div class="talent-perrank">${TT('Pro Rang:')} ${escapeHtml(data.proRang)}</div>` : ''}
            ${data && data.voraussetzung ? `<div class="talent-perrank" style="color:var(--fail)">${TT('Voraussetzung:')} ${escapeHtml(data.voraussetzung)}</div>` : ''}
            ${mehrfach ? `<div class="talent-perrank" style="display:flex;align-items:center;gap:0.4rem">
                <label style="font-size:0.72rem;color:var(--text-dim)">${escapeHtml(TT(data.mehrfach))}:</label>
                <input type="text" value="${escapeHtml(t.gebiet || '')}" data-tgebiet="${t.id}"
                       placeholder="${TT('z.B. Schmied')}" style="flex:1;max-width:14rem;font-size:0.8rem">
            </div>` : ''}
            ${talentWahlHtml(t, data)}
            ${t.notiz ? `<div class="talent-perrank">${escapeHtml(t.notiz)}</div>` : ''}
        </div>`;
    }).join('');
    if (typeof uebersetzeDOM === 'function') uebersetzeDOM(container);

    container.querySelectorAll('[data-trank]').forEach(btn => {
        btn.addEventListener('click', () => changeTalentRank(btn.dataset.trank, parseInt(btn.dataset.delta, 10)));
    });
    container.querySelectorAll('[data-tremove]').forEach(btn => {
        btn.addEventListener('click', () => removeTalent(btn.dataset.tremove));
    });
    // Gebiet nachtragen oder ändern (Handwerk, Wissensgebiet, Instrument, Waffenkenner)
    container.querySelectorAll('[data-tgebiet]').forEach(input => {
        input.addEventListener('input', () => {
            const eintrag = appData.talents.find(t => t.id === input.dataset.tgebiet);
            if (!eintrag) return;
            eintrag.gebiet = input.value;
            onDataChanged();
        });
    });
    // Feste Auswahl setzen (Vertrauter, Zauber auslösen)
    container.querySelectorAll('[data-twahl]').forEach(sel => {
        sel.addEventListener('change', () => {
            const eintrag = appData.talents.find(t => t.id === sel.dataset.twahl);
            if (!eintrag) return;
            if (!Array.isArray(eintrag.wahl)) eintrag.wahl = eintrag.wahl ? [eintrag.wahl] : [];
            eintrag.wahl[parseInt(sel.dataset.slot, 10)] = sel.value;
            onDataChanged();
        });
    });
}

function changeTalentRank(id, delta) {
    const entry = appData.talents.find(t => t.id === id);
    if (!entry) return;
    const name = entry.name;
    const data = typeof DS4_TALENTS !== 'undefined' ? talentDaten(name) : null;
    const zugang = data ? talentZugang(data) : null;
    const maxRang = zugang ? zugang.maxRang : (entry.maxRang || 10);

    if (delta > 0) {
        // Aus dem Topf zahlen, aus dem das Talent ursprünglich bezahlt wurde
        const topf = entry.topf === 'ntp' ? 'ntp' : 'tp';
        if (verfuegbarePunkte(topf) < 1) return;
        if ((entry.rang || 1) >= maxRang) return;
        entry.rang = (entry.rang || 1) + 1;
        appData[topf] = verfuegbarePunkte(topf) - 1;
        addLog(`<strong>${escapeHtml(name)}</strong> auf Rang ${entry.rang} gesteigert (1 ${topf === 'ntp' ? escapeHtml(ntpName()) : 'TP'})`, 'erfolg');
    } else {
        if ((entry.rang || 1) <= 1) { removeTalent(id); return; }
        entry.rang -= 1;
        // Wegfallende Rang-Slots einer festen Auswahl mit abräumen
        if (Array.isArray(entry.wahl)) entry.wahl = entry.wahl.slice(0, entry.rang);
        const zurueck = entry.topf === 'ntp' ? 'ntp' : 'tp';
        appData[zurueck] = verfuegbarePunkte(zurueck) + 1;
        addLog(`<strong>${escapeHtml(name)}</strong> auf Rang ${entry.rang} gesenkt (1 TP zurück)`, 'neutral');
    }
    renderTalents();
    refreshBoundInputs();
    onDataChanged();
}

function removeTalent(id) {
    const entry = appData.talents.find(t => t.id === id);
    if (!entry) return;
    // Investierte Talentpunkte werden zurückgegeben
    const zurueck = entry.topf === 'ntp' ? 'ntp' : 'tp';
    appData[zurueck] = verfuegbarePunkte(zurueck) + (entry.rang || 1);
    appData.talents = appData.talents.filter(t => t.id !== id);
    const bezeichnung = entry.gebiet ? `${entry.name} (${entry.gebiet})` : entry.name;
    addLog(`Talent <strong>${escapeHtml(bezeichnung)}</strong> entfernt (${entry.rang || 1} TP zurück)`, 'neutral');
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
    const TT = window.t || ((s) => s);

    if (!klasse) {
        body.innerHTML = `<div class="empty-hint">${TT('Bitte zuerst Klasse (und bei Zauberwirkern den Typ) wählen — davon hängt ab, welche Talente zur Verfügung stehen.')}</div>`;
        return;
    }

    const suche = talentFilter.trim().toLowerCase();
    const eintraege = talentListe().map(t => ({ talent: t, zugang: talentZugang(t) }))
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
            <input type="text" id="talent-search" placeholder="${t('Talent suchen...')}" value="${escapeHtml(talentFilter)}" style="flex:1;min-width:160px">
            <label class="radio-pill ${talentShowAll ? 'selected' : ''}" id="talent-showall">
                ${t('auch noch nicht erreichbare')}
            </label>
        </div>
        <div class="budget" style="margin-bottom:0.8rem">
            ${escapeHtml(t(klasseName))}${appData.heldenklasse ? ' / ' + escapeHtml(appData.heldenklasse) : ''} ·
            ${t('Stufe')} <strong>${stufe}</strong> ·
            ${ntpAktiv() ? `${t('Bezahlen aus:')}
                <span class="radio-pill ${talentTopf === 'tp' ? 'selected' : ''}" onclick="talentTopfWaehlen('tp')">TP ${appData.tp || 0}</span>
                <span class="radio-pill ${talentTopf === 'ntp' ? 'selected' : ''}" onclick="talentTopfWaehlen('ntp')" title="${escapeHtml(hausregeln.ntpHinweis)}">${escapeHtml(ntpName())} ${appData.ntp || 0}</span>`
              : `${t('Offene TP:')} <strong>${appData.tp || 0}</strong>`}
            <span class="hint" style="margin-left:auto">${tp('{n} Talente', { n: eintraege.length })}</span>
        </div>`;

    if (!eintraege.length) {
        body.innerHTML = kopf + `<div class="empty-hint">${t('Keine passenden Talente gefunden.')}</div>`;
        wireTalentPickerHead();
        return;
    }

    body.innerHTML = kopf + `<div class="talent-picker-list">` + eintraege.map(e => {
        const t = e.talent;
        const z = e.zugang;
        const mehrfach = istMehrfachTalent(t);
        // Bei mehrfach erwerbbaren Talenten sperrt ein volles Gebiet nicht das Talent:
        // ein weiteres Gebiet lässt sich immer noch lernen.
        const rang = mehrfach ? hoechsterRang(t.name) : gelernterRang(t.name);
        const voll = !mehrfach && rang >= z.maxRang;
        const topf = (ntpAktiv() && talentTopf === 'ntp') ? 'ntp' : 'tp';
        const kannLernen = z.erfuellt && !voll && verfuegbarePunkte(topf) >= 1;

        let knopf;
        if (!z.erfuellt) knopf = `<span class="tag tag-warn">${TT('ab Stufe')} ${z.minStufe}</span>`;
        else if (voll) knopf = `<span class="tag">${TT('Höchstrang')}</span>`;
        else if (!kannLernen) knopf = `<span class="tag tag-warn">${TT('kein TP frei')}</span>`;
        else knopf = `<button class="btn btn-sm btn-primary" data-tlearn="${escapeHtml(t.name)}">${TT(mehrfach ? 'Gebiet wählen' : (rang ? 'Rang +1' : 'Lernen'))} (1 ${topf === 'ntp' ? escapeHtml(ntpName()) : 'TP'})</button>`;

        return `<div class="talent-option ${z.erfuellt ? '' : 'locked'}">
            <div class="talent-entry-head">
                <strong>${escapeHtml(t.name)}</strong>
                ${mehrfach
                    ? `<span class="hint">${TT('je Gebiet max. Rang')} ${z.maxRang}${talentGebiete(t.name).length ? ' · ' + talentGebiete(t.name).map(g => `${escapeHtml(g.gebiet)} ${g.rang}`).join(', ') : ''}</span>`
                    : (rang ? `<span class="tag">${TT('Rang')} ${rang}/${z.maxRang}</span>` : `<span class="hint">${TT('max. Rang')} ${z.maxRang}</span>`)}
                ${z.quelle === 'held' ? `<span class="tag">${TT('Heldenklasse')}</span>` : ''}
                ${z.spaeter ? `<span class="hint" title="${TT('Die Heldenklasse hebt den Höchstrang später an')}">${TT('ab Stufe')} ${z.spaeter.minStufe}: ${TT('bis Rang')} ${z.spaeter.maxRang}</span>` : ''}
                ${t.eigen ? `<span class="tag">${TT('Hausregel')}</span>` : ''}
                <span style="margin-left:auto">${knopf}</span>
            </div>
            <div class="talent-effect">${escapeHtml(t.effekt)}</div>
            ${t.proRang ? `<div class="talent-perrank">${TT('Pro Rang:')} ${escapeHtml(t.proRang)}</div>` : ''}
            ${t.mehrfach ? `<div class="talent-perrank">${TT('Mehrfach wählbar:')} ${escapeHtml(t.mehrfach)}</div>` : ''}
            ${t.voraussetzung ? `<div class="talent-perrank" style="color:var(--fail)">${TT('Voraussetzung:')} ${escapeHtml(t.voraussetzung)}</div>` : ''}
        </div>`;
    }).join('') + '</div>';

    wireTalentPickerHead();

    body.querySelectorAll('[data-tlearn]').forEach(btn => {
        btn.addEventListener('click', () => learnTalent(btn.dataset.tlearn));
    });
    if (typeof uebersetzeDOM === 'function') uebersetzeDOM(body);
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

function learnTalent(name, gebietVorgabe) {
    const data = talentDaten(name);
    if (!data) return;
    const zugang = talentZugang(data);
    if (!zugang || !zugang.erfuellt) return;
    const topf = (ntpAktiv() && talentTopf === 'ntp') ? 'ntp' : 'tp';
    if (verfuegbarePunkte(topf) < 1) return;

    // Mehrfach erwerbbare Talente gelten je Gebiet einzeln (S.34, S.47)
    let gebiet = gebietVorgabe;
    if (istMehrfachTalent(data) && gebiet === undefined) {
        const vorhandene = talentGebiete(name);
        const liste = vorhandene.length
            ? '\n\nBereits beherrscht: ' + vorhandene.map(g => `${g.gebiet} (Rang ${g.rang})`).join(', ') +
              '\nDerselbe Name steigert das vorhandene Gebiet.'
            : '';
        gebiet = prompt(`${name} — ${data.mehrfach}.\nFür welches Gebiet?${liste}`, '');
        if (gebiet === null) return;
        gebiet = gebiet.trim();
        if (!gebiet) return;
    }

    const entry = (appData.talents || []).find(t =>
        t.name === name && (gebiet === undefined || (t.gebiet || '') === gebiet));

    if (entry) {
        if ((entry.rang || 1) >= zugang.maxRang) return;
        entry.rang = (entry.rang || 1) + 1;
        // Der Höchstrang kann sich mit der Stufe heben (Hausregel "Heldenklassen
        // neu": erst Rang I, ab Stufe 5 der volle Höchstrang).
        entry.maxRang = zugang.maxRang;
    } else {
        appData.talents.push({ id: uid(), name, gebiet, rang: 1, maxRang: zugang.maxRang, notiz: '', topf });
    }
    appData[topf] = verfuegbarePunkte(topf) - 1;

    const neu = gelernterRang(name, gebiet);
    const bezeichnung = gebiet ? `${name} (${gebiet})` : name;
    addLog(`Talent <strong>${escapeHtml(bezeichnung)}</strong> auf Rang ${neu} (1 TP)`, 'erfolg');
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

    const TT = window.t || ((s) => s);
    const label = `<strong>${TT('Volksfähigkeiten:')}</strong> `;

    if (!faehigkeiten) {
        const race = DS4_RACES[appData.volk];
        box.innerHTML = race ? label + race.traits.map(tr => escapeHtml(TT(tr))).join(' · ') : '';
        return;
    }

    box.innerHTML = label + faehigkeiten
        .map(f => `<span title="${escapeHtml(TT(f.effekt))}">${escapeHtml(TT(f.name))}</span>`)
        .join(' · ') +
        '<div style="margin-top:0.3rem">' + faehigkeiten
        .map(f => `<div>• <strong>${escapeHtml(TT(f.name))}:</strong> ${escapeHtml(TT(f.effekt))}</div>`)
        .join('') + '</div>';
}
