// Dungeonslayers 4 — Hausregeln
//
// Dungeonslayers lebt von Fanwerken und Hausregeln. Dieses Modul macht die
// Stellschrauben einstellbar, ohne die Regeldateien anzufassen: Steigerungskosten,
// Talentpunkte je Stufe und eigene Talente, Zauber und Heldenklassen.
//
// Der Spielleiter stellt sie ein und schickt sie an seine Runde — so spielen alle
// nach denselben Regeln, ohne dass jeder etwas von Hand eintragen muss.

const HAUSREGELN_KEY = 'ds4_hausregeln';

const HAUSREGELN_STANDARD = {
    // 'klasse'      = nach Regelwerk, günstige Eigenschaften 2 LP, übrige 3 LP
    // 'einheitlich' = jede Eigenschaft kostet gleich viel (häufigste Hausregel)
    // 'eigen'       = jeder Posten frei einstellbar
    lpModell: 'klasse',
    lpEinheitlich: 2,
    lpEigen: { staerke: 2, haerte: 2, bewegung: 2, geschick: 2, verstand: 2, aura: 2, lk: 1, tp: 3 },

    // Talentpunkte je Stufenaufstieg
    tpProStufe: 1,
    // Zweiter, getrennt geführter Topf (z.B. für Talente außerhalb des Kampfes)
    ntpAktiv: false,
    ntpProStufe: 1,
    ntpName: 'NTP',
    ntpHinweis: 'Nicht-Kampf-Talentpunkt — nur für Talente außerhalb des Kampfes',

    // Eigene Ergänzungen, die in den Auswahllisten mit auftauchen
    eigeneTalente: [],
    eigeneZauber: [],
    eigeneHeldenklassen: []
};

let hausregeln = Object.assign({}, HAUSREGELN_STANDARD);

function hausregelnLaden() {
    try {
        const roh = localStorage.getItem(HAUSREGELN_KEY);
        if (roh) hausregeln = Object.assign({}, HAUSREGELN_STANDARD, JSON.parse(roh));
    } catch (e) {
        hausregeln = Object.assign({}, HAUSREGELN_STANDARD);
    }
    return hausregeln;
}

function hausregelnSichern() {
    try { localStorage.setItem(HAUSREGELN_KEY, JSON.stringify(hausregeln)); } catch (e) { /* Speicher evtl. voll */ }
}

function hausregelnAktiv() {
    const h = hausregeln;
    return h.lpModell !== 'klasse' || h.tpProStufe !== 1 || h.ntpAktiv ||
        h.eigeneTalente.length || h.eigeneZauber.length || h.eigeneHeldenklassen.length;
}

// --- Auswirkungen auf die Regeln --------------------------------------------

// Steigerungskosten: entweder nach Klasse (Regelwerk) oder nach Hausregel
function aktuelleLpKosten() {
    const cls = typeof activeClass === 'function' ? activeClass() : null;
    const nachRegelwerk = cls ? cls.lpCosts : null;

    if (hausregeln.lpModell === 'einheitlich') {
        const wert = hausregeln.lpEinheitlich;
        return { staerke: wert, haerte: wert, bewegung: wert, geschick: wert, verstand: wert, aura: wert,
                 lk: nachRegelwerk ? nachRegelwerk.lk : 1, tp: nachRegelwerk ? nachRegelwerk.tp : 3 };
    }
    if (hausregeln.lpModell === 'eigen') {
        return Object.assign({}, hausregeln.lpEigen);
    }
    return nachRegelwerk;
}

// Talent- und Zauberlisten inklusive eigener Ergänzungen
function alleTalente() {
    const grund = typeof DS4_TALENTS !== 'undefined' ? DS4_TALENTS : [];
    return hausregeln.eigeneTalente.length ? grund.concat(hausregeln.eigeneTalente) : grund;
}

function alleZauber() {
    const grund = typeof DS4_ZAUBER !== 'undefined' ? DS4_ZAUBER : [];
    return hausregeln.eigeneZauber.length ? grund.concat(hausregeln.eigeneZauber) : grund;
}

function alleHeldenklassen() {
    const grund = typeof DS4_HELDENKLASSEN !== 'undefined' ? DS4_HELDENKLASSEN : {};
    if (!hausregeln.eigeneHeldenklassen.length) return grund;
    const zusammen = Object.assign({}, grund);
    hausregeln.eigeneHeldenklassen.forEach(h => { zusammen[h.name] = h; });
    return zusammen;
}

// --- Einstellungen ----------------------------------------------------------

function openHausregeln() {
    hausregelnLaden();
    renderHausregeln();
    openModal('hausregeln-modal');
}

function renderHausregeln() {
    const body = document.getElementById('hausregeln-body');
    const h = hausregeln;
    const cls = typeof activeClass === 'function' ? activeClass() : null;

    const eigenschaftZeilen = Object.entries(DS4_EIGENSCHAFT_NAMES).map(([k, name]) => `
        <div class="list-row">
            <span style="flex:1">${name}</span>
            <input type="number" min="1" max="9" value="${h.lpEigen[k]}" data-lpeigen="${k}" style="width:3.5rem">
            <span class="row-sub">LP</span>
        </div>`).join('');

    body.innerHTML = `
        <p class="hint-rule" style="margin-bottom:1rem">
            Diese Einstellungen gelten nur für diesen Browser. Als Spielleiter kannst du sie unten
            an alle verbundenen Spieler schicken, damit die ganze Runde gleich rechnet.
        </p>

        <h4 style="color:var(--accent-bright)">Steigerungskosten (Lernpunkte)</h4>
        <div class="radio-row" style="margin:0.5rem 0">
            ${[['klasse', 'Nach Regelwerk'], ['einheitlich', 'Einheitlich'], ['eigen', 'Frei einstellbar']]
                .map(([wert, text]) => `<span class="radio-pill ${h.lpModell === wert ? 'selected' : ''}" data-lpmodell="${wert}">${text}</span>`).join('')}
        </div>
        ${h.lpModell === 'klasse' ? `<p class="hint">
            Günstige Eigenschaften der Klasse kosten 2 LP, die übrigen 3 LP.
            ${cls ? `Für ${escapeHtml(cls.name)}: ${Object.entries(cls.lpCosts).filter(([k]) => DS4_EIGENSCHAFT_NAMES[k]).map(([k, v]) => DS4_EIGENSCHAFT_ABBR[k] + ' ' + v).join(' · ')}` : ''}
        </p>` : ''}
        ${h.lpModell === 'einheitlich' ? `
            <div class="list-row">
                <span style="flex:1">Jede Eigenschaft kostet</span>
                <input type="number" id="hr-lp-einheitlich" min="1" max="9" value="${h.lpEinheitlich}" style="width:3.5rem">
                <span class="row-sub">LP</span>
            </div>
            <p class="hint" style="margin-top:0.4rem">Die häufigste Hausregel: alle Eigenschaften gleich teuer.</p>` : ''}
        ${h.lpModell === 'eigen' ? eigenschaftZeilen + `
            <div class="list-row"><span style="flex:1">Lebenskraft</span>
                <input type="number" min="1" max="9" value="${h.lpEigen.lk}" data-lpeigen="lk" style="width:3.5rem"><span class="row-sub">LP</span></div>
            <div class="list-row"><span style="flex:1">zusätzlicher Talentpunkt</span>
                <input type="number" min="1" max="9" value="${h.lpEigen.tp}" data-lpeigen="tp" style="width:3.5rem"><span class="row-sub">LP</span></div>` : ''}

        <h4 style="color:var(--accent-bright);margin-top:1.2rem">Talentpunkte je Stufe</h4>
        <div class="list-row">
            <span style="flex:1">Talentpunkte (TP)</span>
            <input type="number" id="hr-tp" min="0" max="5" value="${h.tpProStufe}" style="width:3.5rem">
        </div>
        <div class="list-row">
            <label style="flex:1;display:flex;align-items:center;gap:0.5rem;cursor:pointer">
                <input type="checkbox" id="hr-ntp-aktiv" ${h.ntpAktiv ? 'checked' : ''} style="width:auto">
                Zweiten Talentpunkt-Topf führen
            </label>
        </div>
        ${h.ntpAktiv ? `
            <div class="grid-2" style="margin-top:0.4rem">
                <div class="field"><label>Kurzname</label><input type="text" id="hr-ntp-name" value="${escapeHtml(h.ntpName)}" maxlength="6"></div>
                <div class="field"><label>Anzahl je Stufe</label><input type="number" id="hr-ntp-zahl" min="0" max="5" value="${h.ntpProStufe}"></div>
            </div>
            <div class="field" style="margin-top:0.4rem">
                <label>Wofür ist er gedacht?</label>
                <input type="text" id="hr-ntp-hinweis" value="${escapeHtml(h.ntpHinweis)}" maxlength="120">
            </div>
            <p class="hint" style="margin-top:0.4rem">
                Beide Töpfe werden getrennt gezählt. Beim Lernen eines Talents wählst du, aus welchem
                du bezahlst — welche Talente aus welchem Topf erlaubt sind, entscheidet eure Runde.
            </p>` : ''}

        <h4 style="color:var(--accent-bright);margin-top:1.2rem">Eigene Ergänzungen</h4>
        <div class="grid-3" style="margin-top:0.4rem">
            <div class="budget"><span>Talente</span> <strong>${h.eigeneTalente.length}</strong></div>
            <div class="budget"><span>Zauber</span> <strong>${h.eigeneZauber.length}</strong></div>
            <div class="budget"><span>Heldenklassen</span> <strong>${h.eigeneHeldenklassen.length}</strong></div>
        </div>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.6rem">
            <button class="btn btn-sm" onclick="eigenesTalentAnlegen()">+ Talent</button>
            <button class="btn btn-sm" onclick="eigenenZauberAnlegen()">+ Zauber</button>
            <button class="btn btn-sm" onclick="eigeneHeldenklasseAnlegen()">+ Heldenklasse</button>
            ${(h.eigeneTalente.length || h.eigeneZauber.length || h.eigeneHeldenklassen.length)
                ? '<button class="btn btn-sm btn-danger" onclick="eigeneEintraegeLeeren()">Eigene löschen</button>' : ''}
        </div>
        <div id="hr-eigene-liste" style="margin-top:0.6rem">${eigeneListeHtml()}</div>

        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1.2rem;padding-top:0.9rem;border-top:1px solid var(--panel-border)">
            <button class="btn btn-primary" onclick="hausregelnUebernehmen()">Übernehmen</button>
            ${typeof isGmMode !== 'undefined' && isGmMode
                ? '<button class="btn" onclick="hausregelnVerteilen()">📤 An Spieler senden</button>' : ''}
            <button class="btn btn-ghost" onclick="hausregelnExportieren()">💾 Als Datei</button>
            <button class="btn btn-ghost" onclick="document.getElementById('hr-datei').click()">📂 Laden</button>
            <input type="file" id="hr-datei" accept=".json" style="display:none" onchange="hausregelnImportieren(event)">
            <button class="btn btn-ghost" style="margin-left:auto" onclick="hausregelnZuruecksetzen()">Auf Regelwerk zurücksetzen</button>
        </div>
        <div id="hr-status" class="hint" style="margin-top:0.6rem;min-height:1.2rem"></div>`;

    // Bedienung verdrahten
    body.querySelectorAll('[data-lpmodell]').forEach(el => el.addEventListener('click', () => {
        hausregeln.lpModell = el.dataset.lpmodell;
        renderHausregeln();
    }));
    const koppeln = (id, feld, zahl) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => {
            hausregeln[feld] = zahl ? (parseInt(el.value, 10) || 0) : el.value;
        });
    };
    koppeln('hr-lp-einheitlich', 'lpEinheitlich', true);
    koppeln('hr-tp', 'tpProStufe', true);
    koppeln('hr-ntp-zahl', 'ntpProStufe', true);
    koppeln('hr-ntp-name', 'ntpName', false);
    koppeln('hr-ntp-hinweis', 'ntpHinweis', false);
    const ntpSchalter = document.getElementById('hr-ntp-aktiv');
    if (ntpSchalter) ntpSchalter.addEventListener('change', () => {
        hausregeln.ntpAktiv = ntpSchalter.checked;
        renderHausregeln();
    });
    body.querySelectorAll('[data-lpeigen]').forEach(el => el.addEventListener('input', () => {
        hausregeln.lpEigen[el.dataset.lpeigen] = parseInt(el.value, 10) || 1;
    }));
}

function eigeneListeHtml() {
    const h = hausregeln;
    const zeilen = [];
    h.eigeneTalente.forEach((t, i) => zeilen.push(`<div class="list-row"><span style="flex:1">⭐ ${escapeHtml(t.name)}</span>
        <button class="icon-btn" data-hrdel="talent" data-i="${i}">✕</button></div>`));
    h.eigeneZauber.forEach((z, i) => zeilen.push(`<div class="list-row"><span style="flex:1">✨ ${escapeHtml(z.name)}</span>
        <button class="icon-btn" data-hrdel="zauber" data-i="${i}">✕</button></div>`));
    h.eigeneHeldenklassen.forEach((k, i) => zeilen.push(`<div class="list-row"><span style="flex:1">👑 ${escapeHtml(k.name)}</span>
        <button class="icon-btn" data-hrdel="held" data-i="${i}">✕</button></div>`));
    if (!zeilen.length) return '';

    setTimeout(() => {
        document.querySelectorAll('[data-hrdel]').forEach(b => b.addEventListener('click', () => {
            const i = parseInt(b.dataset.i, 10);
            if (b.dataset.hrdel === 'talent') hausregeln.eigeneTalente.splice(i, 1);
            else if (b.dataset.hrdel === 'zauber') hausregeln.eigeneZauber.splice(i, 1);
            else hausregeln.eigeneHeldenklassen.splice(i, 1);
            renderHausregeln();
        }));
    }, 0);
    return zeilen.join('');
}

// --- Eigene Einträge anlegen ------------------------------------------------

function eigenesTalentAnlegen() {
    const name = prompt('Name des Talents:');
    if (!name) return;
    const effekt = prompt('Wirkung (kurz):', '') || '';
    const proRang = prompt('Was bringt jeder Rang?', '+2') || '';
    const maxRang = parseInt(prompt('Höchstrang (1-10):', '3'), 10) || 3;
    const stufe = parseInt(prompt('Ab welcher Stufe lernbar?', '1'), 10) || 1;

    const klassen = ['krieger', 'spaeher', 'heiler', 'zauberer', 'schwarzmagier'];
    const auswahl = prompt('Für welche Klassen? Nummern mit Komma trennen, leer = alle:\n' +
        klassen.map((k, i) => `${i + 1}) ${k}`).join('\n'), '');
    const gewaehlt = (auswahl || '').trim()
        ? auswahl.split(',').map(s => klassen[parseInt(s.trim(), 10) - 1]).filter(Boolean)
        : klassen;

    hausregeln.eigeneTalente.push({
        name, effekt, proRang, eigen: true,
        access: gewaehlt.map(k => ({ klasse: k, minStufe: stufe, maxRang })),
        heldenZugang: []
    });
    renderHausregeln();
}

function eigenenZauberAnlegen() {
    const name = prompt('Name des Zaubers:');
    if (!name) return;
    const effekt = prompt('Wirkung (kurz):', '') || '';
    const typ = (prompt('Zaubern (n) oder Zielzauber (z)?', 'n') || 'n').toLowerCase().startsWith('z') ? 'ziel' : 'normal';
    const zb = prompt('Zauberbonus (ZB):', '+0') || '+0';
    const abklingzeit = prompt('Abklingzeit:', '1 Kampfrunde') || '';
    const stufe = parseInt(prompt('Ab welcher Zauberwirker-Stufe?', '1'), 10) || 1;

    const typen = ['heiler', 'zauberer', 'schwarzmagier'];
    const auswahl = prompt('Für welche Zauberwirker? Nummern mit Komma, leer = alle:\n' +
        typen.map((k, i) => `${i + 1}) ${k}`).join('\n'), '');
    const gewaehlt = (auswahl || '').trim()
        ? auswahl.split(',').map(s => typen[parseInt(s.trim(), 10) - 1]).filter(Boolean)
        : typen;

    hausregeln.eigeneZauber.push({
        name, typ, effekt, zb, abklingzeit, eigen: true,
        dauer: '—', distanz: '—', preis: 0,
        zugang: gewaehlt.map(k => ({ klasse: k, stufe }))
    });
    renderHausregeln();
}

function eigeneHeldenklasseAnlegen() {
    const name = prompt('Name der Heldenklasse:');
    if (!name) return;
    const basis = prompt('Basisklasse (krieger, spaeher, heiler, zauberer, schwarzmagier):', 'krieger') || 'krieger';
    const minStufe = parseInt(prompt('Ab welcher Stufe?', '10'), 10) || 10;
    const voraussetzung = prompt('Voraussetzung (Freitext):', `${basis} der Stufe ${minStufe}+`) || '';

    hausregeln.eigeneHeldenklassen.push({
        name, basisklasse: basis, minStufe, voraussetzung, talente: [], eigen: true
    });
    renderHausregeln();
}

function eigeneEintraegeLeeren() {
    if (!confirm('Alle eigenen Talente, Zauber und Heldenklassen löschen?')) return;
    hausregeln.eigeneTalente = [];
    hausregeln.eigeneZauber = [];
    hausregeln.eigeneHeldenklassen = [];
    renderHausregeln();
}

// --- Übernehmen, teilen, sichern -------------------------------------------

function hausregelnUebernehmen() {
    hausregelnSichern();
    if (typeof renderAll === 'function') renderAll();
    const status = document.getElementById('hr-status');
    if (status) {
        status.innerHTML = '✓ Übernommen.' + (hausregelnAktiv() ? ' Der Bogen rechnet jetzt nach euren Hausregeln.' : '');
        status.style.color = 'var(--success)';
    }
    if (typeof addLog === 'function' && !isGmMode) addLog('Hausregeln übernommen.', 'neutral');
}

function hausregelnVerteilen() {
    hausregelnSichern();
    if (typeof broadcastToPlayers !== 'function') return;
    broadcastToPlayers({ type: 'hausregeln', regeln: hausregeln });
    const status = document.getElementById('hr-status');
    const anzahl = typeof clientConnections !== 'undefined' ? Object.keys(clientConnections).length : 0;
    if (status) {
        status.innerHTML = anzahl
            ? `✓ An ${anzahl} Spieler geschickt.`
            : 'Noch kein Spieler verbunden — sie bekommen die Regeln automatisch beim Beitreten.';
        status.style.color = anzahl ? 'var(--success)' : 'var(--text-dim)';
    }
    if (typeof addGmLog === 'function') addGmLog('Spielleiter', 'hat die Hausregeln an die Runde verteilt.', 'erfolg');
}

// Beim Spieler eintreffende Hausregeln
function hausregelnEmpfangen(regeln) {
    hausregeln = Object.assign({}, HAUSREGELN_STANDARD, regeln || {});
    hausregelnSichern();
    if (typeof renderAll === 'function') renderAll();
    if (typeof showGmMessage === 'function') {
        showGmMessage('Der Spielleiter hat die <strong>Hausregeln</strong> eurer Runde übertragen.');
    }
    if (typeof addLog === 'function') addLog('Hausregeln vom Spielleiter übernommen.', 'neutral');
    const offen = document.getElementById('hausregeln-modal');
    if (offen && offen.classList.contains('active')) renderHausregeln();
}

function hausregelnExportieren() {
    const text = JSON.stringify(Object.assign({ art: 'dungeonslayers-hausregeln' }, hausregeln), null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dungeonslayers-hausregeln.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
}

function hausregelnImportieren(ereignis) {
    const datei = ereignis.target.files[0];
    ereignis.target.value = '';
    if (!datei) return;
    const leser = new FileReader();
    leser.onload = e => {
        try {
            const daten = JSON.parse(e.target.result);
            if (daten.art !== 'dungeonslayers-hausregeln') {
                alert('Das ist keine Hausregel-Datei.');
                return;
            }
            delete daten.art;
            hausregeln = Object.assign({}, HAUSREGELN_STANDARD, daten);
            hausregelnSichern();
            renderHausregeln();
            if (typeof renderAll === 'function') renderAll();
        } catch (fehler) {
            alert('Die Datei konnte nicht gelesen werden.');
        }
    };
    leser.readAsText(datei);
}

function hausregelnZuruecksetzen() {
    if (!confirm('Alle Hausregeln verwerfen und wieder nach Regelwerk spielen?')) return;
    hausregeln = Object.assign({}, HAUSREGELN_STANDARD, { lpEigen: Object.assign({}, HAUSREGELN_STANDARD.lpEigen) });
    hausregelnSichern();
    renderHausregeln();
    if (typeof renderAll === 'function') renderAll();
}

hausregelnLaden();
