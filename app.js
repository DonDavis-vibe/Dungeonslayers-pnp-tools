// Dungeonslayers 4 — Charakterbogen: State, Rendering, Proben

const STORAGE_KEY = 'ds4_character';

function blankCharacter() {
    return {
        name: '', spieler: '', volk: '', klasse: '', subtype: '', heldenklasse: '',
        ep: 0, lp: 0, tp: 0,
        attribute: { koerper: 0, agilitaet: 0, geist: 0 },
        // Basiswerte aus der Punkteverteilung; Volks-/Klassenbonus kommen separat obendrauf
        eigenschaften: { staerke: 0, haerte: 0, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        volksbonus: '', klassenbonus: '', menschCapChoices: [],
        equipment: { melee: '', ranged: '', koerper: '', helm: '', schienen: '', schild: '' },
        lkCurrent: 0,
        gold: 10, silber: 0, kupfer: 0, bonusLk: 0, extraTp: 0,
        ntp: 0,          // zweiter Talentpunkt-Topf, falls die Runde ihn führt
        portrait: '',
        talents: [], spells: [], inventory: [],
        notes: '', log: []
    };
}

let appData = blankCharacter();
let lastDerived = null;

// --- Hilfsfunktionen --------------------------------------------------------

function uid() { return Math.random().toString(36).slice(2, 9); }

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Effektive Eigenschaft = Basiswert + Volksbonus + Klassenbonus
function effectiveEigenschaft(key) {
    let v = appData.eigenschaften[key] || 0;
    if (appData.volksbonus === key) v += 1;
    if (appData.klassenbonus === key) v += 1;
    return v;
}

function effectiveEigenschaften() {
    const out = {};
    Object.keys(DS4_EIGENSCHAFT_NAMES).forEach(k => { out[k] = effectiveEigenschaft(k); });
    return out;
}

// Charakter-Objekt in der Form, die die Regel-Engine erwartet
function charForRules() {
    return {
        volk: appData.volk,
        klasse: appData.klasse,
        attribute: appData.attribute,
        eigenschaften: effectiveEigenschaften(),
        equipment: appData.equipment,
        zauberZb: preparedSpellZb(),
        bonusLk: appData.bonusLk || 0,
        // Talente wirken auf die Kampfwerte (z.B. Kämpfer: Schlagen +1 je Rang)
        talents: appData.talents || []
    };
}

function preparedSpellZb() {
    const spell = (appData.spells || []).find(s => s.prepared);
    return spell ? (parseInt(spell.zb, 10) || 0) : 0;
}

function activeClass() {
    return DS4_CLASSES[appData.klasse] || null;
}

// Für Zauberwirker liegen die Rüstungsregeln beim Untertyp
function armorRules() {
    const cls = activeClass();
    if (!cls) return null;
    if (cls.isCaster) {
        const sub = cls.subtypes[appData.subtype];
        return sub ? sub.armor : null;
    }
    return cls.armor;
}

function characterName() {
    return appData.name || 'Namenloser Held';
}

// --- Persistenz -------------------------------------------------------------

let saveTimer = null;
function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); } catch (e) { /* Speicher evtl. voll/blockiert */ }
    }, 300);
}

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        appData = Object.assign(blankCharacter(), parsed);
        appData.attribute = Object.assign(blankCharacter().attribute, parsed.attribute || {});
        appData.eigenschaften = Object.assign(blankCharacter().eigenschaften, parsed.eigenschaften || {});
        appData.equipment = Object.assign(blankCharacter().equipment, parsed.equipment || {});
        return true;
    } catch (e) {
        return false;
    }
}

function exportCharacter() {
    const data = JSON.stringify(appData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (appData.name || 'dungeonslayers-held').replace(/[^\wäöüÄÖÜß-]+/g, '_') + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
}

// Übernimmt einen eingelesenen Charakter in den Bogen. Fehlende Felder bekommen
// ihren Standardwert, damit auch ältere oder unvollständige Dateien laden.
function applyCharacterData(parsed) {
    const base = blankCharacter();
    appData = Object.assign(base, parsed);
    appData.attribute = Object.assign(base.attribute, parsed.attribute || {});
    appData.eigenschaften = Object.assign(base.eigenschaften, parsed.eigenschaften || {});
    appData.equipment = Object.assign(base.equipment, parsed.equipment || {});
    renderAll();
    scheduleSave();
    syncMultiplayerState();
    addLog('Charakter geladen: ' + characterName(), 'neutral');
}

function importCharacter(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            applyCharacterData(JSON.parse(e.target.result));
        } catch (err) {
            alert('Die Datei konnte nicht gelesen werden.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// --- Beispielcharaktere -----------------------------------------------------

const DS4_BEISPIELE = [
    {
        datei: 'thorin_steinfaust.json',
        name: 'Thorin Steinfaust',
        untertitel: 'Zwerg Krieger · Stufe 3',
        beschreibung: 'Nahkampf-Brocken mit Streitaxt und Kettenpanzer. Viel Lebenskraft und eine sehr hohe Abwehr — dafür träge in der Initiative.',
        werte: 'LK 23 · Abwehr 18 · Schlagen 16 · Initiative 3'
    },
    {
        datei: 'elaria_mondweberin.json',
        name: 'Elaria Mondweberin',
        untertitel: 'Elfin Zauberin · Stufe 3',
        beschreibung: 'Zerbrechlich im Nahkampf, aber stark in der Magie. Ihre runenbestickte Robe gibt zusätzlich +1 auf Aura.',
        werte: 'LK 17 · Abwehr 7 · Zaubern 12 · Zielzauber 9'
    }
];

function openBeispiele() {
    const body = document.getElementById('beispiele-body');
    body.innerHTML = `
        <p class="hint" style="margin-bottom:0.8rem">
            Fertige Charaktere zum Ausprobieren. Achtung: Der aktuelle Bogen wird dabei überschrieben.
        </p>
        <div class="choice-grid">
            ${DS4_BEISPIELE.map((b, i) => `
                <div class="choice-card" data-beispiel="${i}">
                    <h4>${escapeHtml(b.name)}</h4>
                    <p style="color:var(--accent)">${escapeHtml(b.untertitel)}</p>
                    <p style="margin-top:0.4rem">${escapeHtml(b.beschreibung)}</p>
                    <p class="talent-perrank" style="margin-top:0.5rem">${escapeHtml(b.werte)}</p>
                </div>`).join('')}
        </div>
        <div id="beispiel-status" class="hint" style="margin-top:0.8rem"></div>`;

    body.querySelectorAll('[data-beispiel]').forEach(karte => {
        karte.addEventListener('click', () => ladeBeispiel(DS4_BEISPIELE[parseInt(karte.dataset.beispiel, 10)]));
    });

    openModal('beispiele-modal');
}

function ladeBeispiel(beispiel) {
    const status = document.getElementById('beispiel-status');
    status.textContent = 'Lade ' + beispiel.name + '...';

    fetch('beispiele/' + beispiel.datei)
        .then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(daten => {
            applyCharacterData(daten);
            closeModal('beispiele-modal');
        })
        .catch(err => {
            // Beim Öffnen per file:// blockieren Browser den Abruf lokaler Dateien
            status.innerHTML = location.protocol === 'file:'
                ? 'Beim direkten Öffnen der Datei blockiert der Browser das Nachladen. ' +
                  'Nutze stattdessen die Online-Version oder lade die JSON-Datei aus dem Ordner ' +
                  '<code>beispiele/</code> über „Laden".'
                : 'Konnte nicht geladen werden (' + escapeHtml(err.message) + ').';
            status.style.color = 'var(--fail)';
        });
}

// --- Input-Bindung ----------------------------------------------------------

function setByPath(obj, path, value) {
    const parts = path.split('.');
    let target = obj;
    for (let i = 0; i < parts.length - 1; i++) target = target[parts[i]];
    target[parts[parts.length - 1]] = value;
}

function getByPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function bindInputs() {
    document.querySelectorAll('[data-bind]').forEach(el => {
        const path = el.dataset.bind;
        el.addEventListener('input', () => {
            const value = el.type === 'number' ? (parseFloat(el.value) || 0) : el.value;
            setByPath(appData, path, value);
            onDataChanged();
        });
    });
}

function refreshBoundInputs() {
    document.querySelectorAll('[data-bind]').forEach(el => {
        if (document.activeElement === el) return; // laufende Eingabe nicht überschreiben
        const value = getByPath(appData, el.dataset.bind);
        el.value = value == null ? '' : value;
    });
}

function onDataChanged() {
    renderDerived();
    renderMeta();
    scheduleSave();
    syncMultiplayerState();
}

// --- Rendering: Attribute & Eigenschaften -----------------------------------

function renderAttributes() {
    const container = document.getElementById('attribute-container');
    container.innerHTML = '';

    Object.keys(DS4_ATTRIBUT_NAMES).forEach(attrKey => {
        const block = document.createElement('div');
        block.className = 'attr-block';

        const attrVal = appData.attribute[attrKey] || 0;
        let html = `
            <div class="attr-head">
                <span class="attr-name">${DS4_ATTRIBUT_NAMES[attrKey]}</span>
                <span class="attr-value-wrap">
                    <span class="stepper">
                        <button data-step="attr" data-key="${attrKey}" data-delta="-1" ${attrVal <= 0 ? 'disabled' : ''}>−</button>
                    </span>
                    <span class="attr-value">${attrVal}</span>
                    <span class="stepper">
                        <button data-step="attr" data-key="${attrKey}" data-delta="1">+</button>
                    </span>
                </span>
            </div>`;

        DS4_EIGENSCHAFTEN_BY_ATTRIBUT[attrKey].forEach(eigKey => {
            const base = appData.eigenschaften[eigKey] || 0;
            const eff = effectiveEigenschaft(eigKey);
            const max = eigenschaftMax(eigKey, appData.volk, appData.klasse, appData.menschCapChoices);
            // Der große Wert ist der, mit dem gerechnet wird. Die Herkunft steht
            // klein darunter als "4+1" — ein "5 +1" daneben liest sich sonst
            // fälschlich als 5+1=6.
            const herkunft = eff > base
                ? `<span class="eig-herkunft" title="Basiswert ${base} plus ${eff - base} aus Volks-/Klassenbonus">${base}+${eff - base}</span>`
                : '';
            html += `
                <div class="eig-row">
                    <span class="eig-name">${DS4_EIGENSCHAFT_NAMES[eigKey]}<span class="eig-abbr">${DS4_EIGENSCHAFT_ABBR[eigKey]}</span></span>
                    <span class="stepper">
                        <button data-step="eig" data-key="${eigKey}" data-delta="-1" ${base <= 0 ? 'disabled' : ''}>−</button>
                    </span>
                    <span class="eig-value">${eff}${herkunft}</span>
                    <span class="stepper">
                        <button data-step="eig" data-key="${eigKey}" data-delta="1" ${eff >= max ? 'disabled' : ''}>+</button>
                    </span>
                    <span class="eig-cap">/ ${max}</span>
                </div>`;
        });

        block.innerHTML = html;
        container.appendChild(block);
    });

    container.querySelectorAll('button[data-step]').forEach(btn => {
        btn.addEventListener('click', () => {
            const delta = parseInt(btn.dataset.delta, 10);
            const key = btn.dataset.key;
            if (btn.dataset.step === 'attr') {
                appData.attribute[key] = Math.max(0, (appData.attribute[key] || 0) + delta);
            } else {
                const max = eigenschaftMax(key, appData.volk, appData.klasse, appData.menschCapChoices);
                const next = (appData.eigenschaften[key] || 0) + delta;
                const bonusOffset = effectiveEigenschaft(key) - (appData.eigenschaften[key] || 0);
                if (next + bonusOffset > max) return;
                appData.eigenschaften[key] = Math.max(0, next);
            }
            renderAttributes();
            renderBudgets();
            onDataChanged();
        });
    });
}

function renderBudgets() {
    const attrSum = Object.values(appData.attribute).reduce((a, b) => a + (b || 0), 0);
    const eigSum = Object.values(appData.eigenschaften).reduce((a, b) => a + (b || 0), 0);

    const attrEl = document.getElementById('budget-attr');
    attrEl.innerHTML = `Attribute: <strong>${attrSum}</strong>/20`;
    attrEl.className = 'budget' + (attrSum > 20 ? ' over' : (attrSum === 20 ? ' done' : ''));

    const eigEl = document.getElementById('budget-eig');
    // Nach der Erschaffung wachsen die Eigenschaften über Lernpunkte weiter über 8 hinaus
    eigEl.innerHTML = `Eigenschaften: <strong>${eigSum}</strong>${eigSum > 8 ? '' : '/8'}`;
    eigEl.className = 'budget' + (eigSum === 8 ? ' done' : '');
}

// --- Rendering: Kampfwerte --------------------------------------------------

const KAMPFWERT_DEFS = [
    { key: 'abwehr', label: 'Abwehr', formula: 'KÖR+HÄ+PA', rollable: true },
    { key: 'initiative', label: 'Initiative', formula: 'AGI+BE', rollable: false },
    { key: 'laufen', label: 'Laufen', formula: 'AGI/2+1', rollable: false, unit: 'm' },
    { key: 'schlagen', label: 'Schlagen', formula: 'KÖR+ST+WB', rollable: true },
    { key: 'schiessen', label: 'Schießen', formula: 'AGI+GE+WB', rollable: true },
    { key: 'zaubern', label: 'Zaubern', formula: 'GEI+AU+ZB−PA', rollable: true, casterOnly: true },
    { key: 'zielzauber', label: 'Zielzauber', formula: 'GEI+GE+ZB−PA', rollable: true, casterOnly: true }
];

function renderDerived() {
    const derived = computeDerived(charForRules());
    lastDerived = derived;

    // Lebenskraft
    const lkMax = derived.lebenskraft;
    document.getElementById('lk-max').textContent = lkMax;
    const cur = appData.lkCurrent || 0;
    const pct = lkMax > 0 ? Math.max(0, Math.min(100, (cur / lkMax) * 100)) : 0;
    const bar = document.getElementById('lk-bar');
    bar.style.width = pct + '%';
    bar.style.background = pct > 50
        ? 'linear-gradient(90deg,#5e8f3c,#7fb356)'
        : (pct > 25 ? 'linear-gradient(90deg,#a8842c,#d4a24c)' : 'linear-gradient(90deg,#8e2b22,#c0392b)');

    const lkPanel = document.getElementById('lk-panel');
    // Standhaft senkt die Grenze, ab der man bewusstlos wird (Regelwerk S.43)
    const grenze = derived.bewusstlosAb || 0;
    const bewusstlos = cur <= grenze;
    lkPanel.classList.toggle('lk-danger', bewusstlos || (lkMax > 0 && cur / lkMax <= 0.25));

    const hint = document.getElementById('lk-hint');
    const koerper = appData.attribute.koerper || 0;
    const todAb = todesGrenze(koerper);

    if (cur <= todAb) {
        hint.innerHTML = `<span style="color:var(--patzer);font-weight:bold">☠ Tot.</span>
            <span style="color:var(--fail)">Der Schaden unter 0 übersteigt den Körperwert (${koerper}) — Tod ab ${todAb} LK.
            Eine Wiederbelebung kostet dauerhaft 1 Punkt Körper.</span>`;
    } else if (bewusstlos) {
        hint.innerHTML = `<span style="color:var(--fail)"><strong>Bewusstlos.</strong> Erwacht nach 1W20 Stunden mit 1 LK. Tod ab ${todAb} LK (unter −KÖR ${koerper}).</span>`;
    } else if (cur <= 0) {
        hint.innerHTML = `<span style="color:var(--accent-bright)"><strong>Noch bei Bewusstsein</strong> dank Standhaft — bewusstlos erst ab ${grenze} LK, Tod ab ${todAb} LK.</span>`;
    } else {
        hint.textContent = `Bewusstlos bei ${grenze} LK · Tod ab ${todAb} LK (unter −KÖR ${koerper})`;
    }

    // Kampfwert-Karten
    const container = document.getElementById('kampfwerte-container');
    const isCaster = !!(activeClass() && activeClass().isCaster);
    container.innerHTML = '';

    KAMPFWERT_DEFS.forEach(def => {
        if (def.casterOnly && !isCaster) return;
        const raw = derived[def.key];
        const value = def.unit === 'm' ? raw.toFixed(1).replace('.', ',').replace(',0', '') : raw;
        const talentQuellen = (derived.talentHerkunft || {})[def.key] || [];

        const card = document.createElement('div');
        card.className = 'kw-card' + (def.rollable ? ' rollable' : '');
        card.innerHTML = `
            <div class="kw-label">${def.label}</div>
            <div class="kw-value">${value}${def.unit || ''}</div>
            <div class="kw-formula">${def.formula}${talentQuellen.length ? ' <span class="kw-talent">+ Talent</span>' : ''}</div>`;

        const talentText = talentQuellen.length ? `\nTalente: ${talentQuellen.join(', ')}` : '';
        if (def.rollable) {
            card.title = `${def.label}-Probe würfeln (PW ${raw})${talentText}`;
            card.addEventListener('click', () => rollKampfwert(def.key, def.label, raw));
        } else if (talentText) {
            card.title = talentText.trim();
        }
        container.appendChild(card);
    });

    renderSituativeTalente();

    document.getElementById('tag-pa').textContent = 'PA ' + derived.panzerung;
    renderEquipmentInfo(derived);
}

// Talente, die nur unter bestimmten Umständen wirken, werden nicht automatisch
// eingerechnet — der Spieler bekommt sie als Erinnerung unter den Kampfwerten.
function renderSituativeTalente() {
    const box = document.getElementById('situative-talente');
    if (!box) return;
    const liste = situativeTalente(appData.talents);
    if (!liste.length) { box.innerHTML = ''; return; }

    box.innerHTML = '<strong>Situative Talente</strong> (nicht automatisch eingerechnet):<br>' +
        liste.map(t =>
            `• <strong>${escapeHtml(t.name)} ${t.rang}</strong>: ${escapeHtml(t.bonus)} auf ${escapeHtml(t.wert)} — ${escapeHtml(t.bedingung)}`
        ).join('<br>');
}

function adjustLk(delta) {
    const max = lastDerived ? lastDerived.lebenskraft : 0;
    const before = appData.lkCurrent || 0;
    appData.lkCurrent = Math.min(max, before + delta);
    refreshBoundInputs();
    renderDerived();
    scheduleSave();
    const diff = appData.lkCurrent - before;
    if (diff !== 0) {
        const text = `${diff > 0 ? 'Heilung' : 'Schaden'}: <strong>${Math.abs(diff)} LK</strong> — jetzt ${appData.lkCurrent}/${max}`;
        const status = diff > 0 ? 'erfolg' : 'fehlschlag';
        addLog(text, status);
        // Auch Spielleiter und Discord sollen von Lebenskraft-Änderungen erfahren
        sendMultiplayerLog(text, status);
        meldeLkSchwelle(before);
    }
    syncMultiplayerState();
}

// Meldet das Überschreiten der Bewusstlosigkeits- und der Todesgrenze.
// Wird von allen Wegen aufgerufen, über die Lebenskraft verloren geht.
function meldeLkSchwelle(vorher) {
    const jetzt = appData.lkCurrent || 0;
    const grenze = lastDerived ? (lastDerived.bewusstlosAb || 0) : 0;
    const todAb = todesGrenze(appData.attribute.koerper || 0);

    if (jetzt <= todAb && vorher > todAb) {
        const tod = `<strong>☠ ${escapeHtml(characterName())} ist gestorben.</strong> ` +
            `Der Schaden unter 0 übersteigt den Körperwert.`;
        addLog(tod, 'patzer');
        sendMultiplayerLog(tod, 'patzer');
        return;
    }
    if (jetzt <= grenze && vorher > grenze) {
        const ohnmacht = '<strong>ist bewusstlos!</strong> Erwacht nach 1W20 Stunden mit 1 LK.';
        addLog(ohnmacht, 'patzer');
        sendMultiplayerLog(ohnmacht, 'patzer');
    }
}

function fullHeal() {
    const max = lastDerived ? lastDerived.lebenskraft : 0;
    appData.lkCurrent = max;
    refreshBoundInputs();
    renderDerived();
    scheduleSave();
    addLog(`Vollständig geheilt (${max} LK)`, 'erfolg');
    sendMultiplayerLog(`ist wieder bei voller Lebenskraft (${max} LK).`, 'erfolg');
    syncMultiplayerState();
}

// Verschnaufen nach dem Kampf: die Hälfte der verlorenen LK zurück (Regelwerk S.42).
// Funktioniert nur bei mindestens 1 LK — wer bewusstlos ist, muss erst geweckt werden.
function verschnaufen() {
    const max = lastDerived ? lastDerived.lebenskraft : 0;
    const cur = appData.lkCurrent || 0;
    if (cur <= 0) {
        addLog('Verschnaufen nicht möglich — der Charakter ist bewusstlos.', 'fehlschlag');
        return;
    }
    const verloren = max - cur;
    if (verloren <= 0) { addLog('Bereits bei voller Lebenskraft.', 'neutral'); return; }
    const geheilt = Math.floor(verloren / 2);
    appData.lkCurrent = cur + geheilt;
    refreshBoundInputs();
    renderDerived();
    scheduleSave();
    addLog(`Verschnaufen: +${geheilt} LK (Hälfte der ${verloren} verlorenen) — jetzt ${appData.lkCurrent}/${max}`, 'erfolg');
    sendMultiplayerLog(`verschnauft: +${geheilt} LK — jetzt ${appData.lkCurrent}/${max}`, 'erfolg');
    syncMultiplayerState();
}

// Natürliche Heilung je 24 Stunden: 1W20/2 LK, +1 je 4 Stunden Bettruhe (Regelwerk S.42)
function nachtruhe() {
    const max = lastDerived ? lastDerived.lebenskraft : 0;
    const cur = appData.lkCurrent || 0;
    if (cur <= 0) {
        addLog('Bewusstlos — erwacht nach 1W20 Stunden mit 1 LK, statt zu heilen.', 'fehlschlag');
        return;
    }
    const bett = parseInt(prompt('Wie viele Stunden Bettruhe? (je 4 volle Stunden +1 auf den Wurf)', '8'), 10);
    if (isNaN(bett)) return;
    const bonus = Math.floor(Math.max(0, bett) / 4);
    const wurf = d20();
    const geheilt = Math.max(0, Math.floor(wurf / 2) + bonus);
    appData.lkCurrent = Math.min(max, cur + geheilt);
    refreshBoundInputs();
    renderDerived();
    scheduleSave();
    addLog(`Nachtruhe: 1W20 = ${wurf} → ${Math.floor(wurf / 2)}${bonus ? ` +${bonus} Bettruhe` : ''} = <strong>+${geheilt} LK</strong> — jetzt ${appData.lkCurrent}/${max}`, 'erfolg');
    sendMultiplayerLog(`ruht: +${geheilt} LK — jetzt ${appData.lkCurrent}/${max}`, 'erfolg');
    syncMultiplayerState();
}

// --- Rendering: Ausrüstung --------------------------------------------------

function populateEquipmentSelects() {
    const fill = (id, options, emptyLabel) => {
        const sel = document.getElementById(id);
        sel.innerHTML = `<option value="">${emptyLabel}</option>` +
            options.map(o => `<option value="${escapeHtml(o.name)}">${escapeHtml(o.name)} (${o.label})</option>`).join('');
    };

    const weaponLabel = w => `WB ${w.wb}${w.twoHanded ? ', 2H' : ''}`;
    fill('f-eq-melee', DS4_WEAPONS.filter(w => w.type === 'melee' || w.type === 'both').map(w => ({ name: w.name, label: weaponLabel(w) })), 'keine');
    fill('f-eq-ranged', DS4_WEAPONS.filter(w => w.type === 'ranged' || w.type === 'both').map(w => ({ name: w.name, label: weaponLabel(w) })), 'keine');

    ['koerper', 'helm', 'schienen', 'schild'].forEach(slot => {
        const opts = DS4_ARMOR.filter(a => a.slot === slot).map(a => ({ name: a.name, label: `PA ${a.pa}` }));
        fill('f-eq-' + slot, opts, 'keine');
    });
}

function renderEquipmentInfo(derived) {
    const warnings = [];
    const rules = armorRules();
    const race = DS4_RACES[appData.volk];

    // Rüstungsbeschränkungen der Klasse
    const slotToType = {
        'Robe': 'stoff', 'Robe (runenbestickt)': 'stoff',
        'Lederpanzer': 'leder', 'Lederschienen': 'schienen',
        'Kettenpanzer': 'kette', 'Plattenpanzer': 'platte',
        'Plattenarmschienen': 'schienen', 'Plattenbeinschienen': 'schienen',
        'Metallhelm': 'helme',
        'Schild, Holz-': 'schilde', 'Schild, Metall-': 'schilde', 'Schild, Turm-': 'schilde'
    };

    if (rules) {
        ['koerper', 'helm', 'schienen', 'schild'].forEach(slot => {
            const name = appData.equipment[slot];
            if (!name) return;
            const type = slotToType[name];
            if (!type) return;
            let allowed = rules[type];
            if (type === 'schienen' && allowed === 'nur Leder') allowed = (name === 'Lederschienen');
            if (allowed === false) {
                warnings.push(`<span class="tag tag-warn">${escapeHtml(name)}: für ${escapeHtml(activeClass().isCaster ? DS4_CLASSES.zauberwirker.subtypes[appData.subtype].name : activeClass().name)} nicht erlaubt (Zauber-Malus ×4, Agilität −PA)</span>`);
            }
        });
    }

    // Zwergen-Waffenverbote
    if (race && race.weaponBans.length) {
        ['melee', 'ranged'].forEach(slot => {
            const name = appData.equipment[slot];
            if (name && race.weaponBans.includes(name)) {
                warnings.push(`<span class="tag tag-warn">${escapeHtml(name)}: für Zwerge zu unhandlich</span>`);
            }
        });
    }

    // Zweihandwaffe + Schild
    const melee = findWeapon(appData.equipment.melee);
    const ranged = findWeapon(appData.equipment.ranged);
    if (appData.equipment.schild && ((melee && melee.twoHanded) || (ranged && ranged.twoHanded))) {
        warnings.push('<span class="tag tag-warn">Schild ist mit einer Zweihandwaffe nicht nutzbar</span>');
    }

    document.getElementById('equipment-warnings').innerHTML = warnings.join(' ');

    // Besonderheiten der angelegten Ausrüstung
    const details = [];
    [melee, ranged].forEach(w => {
        if (!w) return;
        const teile = [];
        if (w.besonderes && w.besonderes !== '—') teile.push(escapeHtml(w.besonderes));
        // Anhang B (S.153): ein Feld = 1m; diese Waffen reichen 2 Felder weit
        if (w.reichweite && w.reichweite > 1) {
            teile.push(`Reichweite ${w.reichweite} Felder (${w.reichweite}m)` +
                (w.stosswaffe ? ', Stoßwaffe — trifft auch Ziele hinter einem Gegner' : ''));
        }
        // Fußnoten der Waffentabelle: zerbricht bei einem Patzer
        if (w.zerbricht) {
            teile.push(`zerbricht bei einem ${w.zerbricht === 'schiessen' ? 'Schießen' : 'Schlagen'}-Patzer`);
        }
        if (teile.length) details.push(`<strong>${escapeHtml(w.name)}:</strong> ${teile.join(' · ')}`);
    });
    ['koerper', 'helm', 'schienen', 'schild'].forEach(slot => {
        const a = findArmor(appData.equipment[slot]);
        if (a && a.besonderes && a.besonderes !== '—') details.push(`<strong>${escapeHtml(a.name)}:</strong> ${escapeHtml(a.besonderes)}`);
    });
    document.getElementById('equipment-details').innerHTML = details.join(' · ');
}

// --- Porträt ----------------------------------------------------------------

// Das Bild wandert über die Leitung zum Spielleiter und auf die Karte — deshalb
// wird es klein gerechnet, statt die Originaldatei zu verschicken.
function portraitLaden(ereignis) {
    const datei = ereignis.target.files[0];
    ereignis.target.value = '';
    if (!datei) return;

    if (typeof BattleMap === 'undefined') return;
    BattleMap.bildVerkleinern(datei, 256, 0.75).then(ergebnis => {
        appData.portrait = ergebnis.dataUrl;
        renderPortrait();
        scheduleSave();
        syncMultiplayerState();
        addLog('Charakterbild gesetzt.', 'neutral');
    }).catch(() => alert('Das Bild konnte nicht gelesen werden.'));
}

function portraitEntfernen() {
    appData.portrait = '';
    renderPortrait();
    scheduleSave();
    syncMultiplayerState();
}

function renderPortrait() {
    const bild = document.getElementById('portrait-img');
    const platzhalter = document.getElementById('portrait-placeholder');
    if (!bild) return;
    if (appData.portrait) {
        bild.src = appData.portrait;
        bild.style.display = '';
        platzhalter.style.display = 'none';
    } else {
        bild.removeAttribute('src');
        bild.style.display = 'none';
        platzhalter.style.display = '';
    }
}

// --- Rendering: Meta (Stufe, EP, Volk) --------------------------------------

function renderMeta() {
    const hasHeld = !!appData.heldenklasse;
    const stufe = stufeFuerEp(appData.ep || 0, hasHeld);
    document.getElementById('tag-stufe').textContent = 'Stufe ' + stufe;

    const next = epBisNaechsteStufe(appData.ep || 0, hasHeld);
    document.getElementById('ep-progress').textContent = next
        ? `Noch ${next.missing} EP bis Stufe ${next.stufe} (${next.needed} EP)${hasHeld ? ' — Heldenklassen-Tabelle' : ''}`
        : 'Höchststufe 20 erreicht.';

    // Zauberwirker-Untertyp nur für Zauberwirker
    const cls = activeClass();
    document.getElementById('field-subtype').style.display = (cls && cls.isCaster) ? '' : 'none';
    document.getElementById('panel-zauber').style.display = (cls && cls.isCaster) ? '' : 'none';

    // Heldenklassen ab Stufe 10
    const heldField = document.getElementById('field-held');
    heldField.style.display = stufe >= 10 ? '' : 'none';
    if (stufe >= 10 && cls) {
        const list = cls.isCaster
            ? ((cls.subtypes[appData.subtype] || {}).heldenklassen || [])
            : cls.heldenklassen;
        const sel = document.getElementById('f-heldenklasse');
        const current = appData.heldenklasse;
        sel.innerHTML = '<option value="">—</option>' + list.map(h => `<option value="${h}">${h}</option>`).join('');
        sel.value = current;
    }

    renderVolksfaehigkeiten();
}

// --- Rendering: Listen ------------------------------------------------------

// renderTalents()/addTalent() liefert talentPicker.js, renderSpells()/addSpell()
// liefert spellPicker.js — beide mit Zugangsprüfung gegen talents.js bzw. zauber.js.

function renderInventory() {
    const container = document.getElementById('inventory-list');
    if (!appData.inventory.length) {
        container.innerHTML = '<div class="empty-hint">Startausrüstung: einfache Kleidung, Feuerstein &amp; Zunder, Wasserschlauch, Decke, Rucksack, 2× Heilkraut, 10 Goldmünzen.</div>';
        return;
    }
    container.innerHTML = appData.inventory.map(i => `
        <div class="list-row">
            <input type="text" value="${escapeHtml(i.name)}" placeholder="Gegenstand" data-list="inventory" data-id="${i.id}" data-field="name">
            <span class="row-sub">×</span>
            <input type="number" value="${i.menge || 1}" min="0" style="width:3.5rem" data-list="inventory" data-id="${i.id}" data-field="menge">
            <input type="text" value="${escapeHtml(i.notiz || '')}" placeholder="Notiz" style="flex:2" data-list="inventory" data-id="${i.id}" data-field="notiz">
            <button class="icon-btn" data-remove="inventory" data-id="${i.id}" title="Entfernen">✕</button>
        </div>`).join('');
    wireListInputs(container);
}

function wireListInputs(container) {
    container.querySelectorAll('[data-list]').forEach(input => {
        input.addEventListener('input', () => {
            const list = appData[input.dataset.list];
            const entry = list.find(e => e.id === input.dataset.id);
            if (!entry) return;
            entry[input.dataset.field] = input.type === 'number' ? (parseFloat(input.value) || 0) : input.value;
            onDataChanged();
        });
    });
    container.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.remove;
            appData[key] = appData[key].filter(e => e.id !== btn.dataset.id);
            if (key === 'talents') renderTalents();
            else if (key === 'spells') renderSpells();
            else renderInventory();
            onDataChanged();
        });
    });
}

function addSpell() { appData.spells.push({ id: uid(), name: '', zb: 0, abklingzeit: '', effekt: '', prepared: false }); renderSpells(); onDataChanged(); }
function addItem() { appData.inventory.push({ id: uid(), name: '', menge: 1, notiz: '' }); renderInventory(); onDataChanged(); }

// --- Würfeln ----------------------------------------------------------------

function currentModifier() {
    return parseInt(document.getElementById('f-difficulty').value, 10) || 0;
}

// --- Kampfmodifikatoren -----------------------------------------------------

const aktiveKampfMods = {};

// Sammelt die eingestellten Situationsmodifikatoren. Sie gelten nur für
// Angriffs- und Abwehrproben, nicht für gewöhnliche Fertigkeitsproben.
function currentCombatModifier() {
    const num = id => parseInt(document.getElementById(id).value, 10) || 0;
    const zweiWaffenTalent = (appData.talents || []).find(t => t.name === 'Zwei Waffen');

    return combatModifiers({
        distanz: num('mod-distanz'),
        zielen: num('mod-zielen'),
        groessenDiff: num('mod-groesse'),
        imNahkampf: !!aktiveKampfMods.imNahkampf,
        selbstLiegend: !!aktiveKampfMods.selbstLiegend,
        zielLiegend: !!aktiveKampfMods.zielLiegend,
        vonDerSeite: !!aktiveKampfMods.vonDerSeite,
        vonHinten: !!aktiveKampfMods.vonHinten,
        zweiWaffen: !!aktiveKampfMods.zweiWaffen,
        zweiWaffenTalent: zweiWaffenTalent ? (zweiWaffenTalent.rang || 0) : 0
    });
}

function renderCombatModifiers() {
    const mod = currentCombatModifier();
    const box = document.getElementById('mod-summary');
    if (!box) return;
    box.innerHTML = mod.summe === 0 && !mod.teile.length
        ? 'Kein Modifikator aktiv.'
        : `Gesamt: <strong style="color:${mod.summe >= 0 ? 'var(--success)' : 'var(--fail)'}">${mod.summe > 0 ? '+' : ''}${mod.summe}</strong> — ${escapeHtml(mod.text)}`;
}

function resetCombatModifiers() {
    Object.keys(aktiveKampfMods).forEach(k => delete aktiveKampfMods[k]);
    ['mod-distanz', 'mod-zielen'].forEach(id => { document.getElementById(id).value = 0; });
    document.getElementById('mod-groesse').value = '0';
    document.querySelectorAll('#mod-toggles .radio-pill').forEach(p => p.classList.remove('selected'));
    renderCombatModifiers();
}

function wireCombatModifiers() {
    document.querySelectorAll('#mod-toggles .radio-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const key = pill.dataset.mod;
            aktiveKampfMods[key] = !aktiveKampfMods[key];
            pill.classList.toggle('selected', !!aktiveKampfMods[key]);
            renderCombatModifiers();
        });
    });
    ['mod-distanz', 'mod-zielen', 'mod-groesse'].forEach(id => {
        document.getElementById(id).addEventListener('input', renderCombatModifiers);
    });
}

function showProbeResult(result, targetPrefix = '', modDetail = '') {
    const display = document.getElementById(targetPrefix + 'dice-display');
    const primary = result.rolls.length ? result.rolls[0].die : '—';

    document.getElementById(targetPrefix + 'dice-number').textContent = primary;
    document.getElementById(targetPrefix + 'dice-label').textContent =
        `${result.label} — PW ${result.pw}${result.modifier ? ` (${result.modifier > 0 ? '+' : ''}${result.modifier})` : ''}`;

    const statusEl = document.getElementById(targetPrefix + 'dice-status');
    statusEl.textContent = DS4_STATUS_TEXT[result.status];
    statusEl.className = 'dice-result-status status-' + result.status;

    const detail = [];
    if (result.rolls.length > 1) {
        detail.push('Würfe: ' + result.rolls.map(r => `${r.die}/${r.chunkPw}`).join(' + '));
    }
    if (result.success) detail.push(`Ergebnis: <strong>${result.total}</strong>`);
    if (modDetail) detail.push(escapeHtml(modDetail));
    document.getElementById(targetPrefix + 'dice-detail').innerHTML = detail.join(' · ');

    display.className = 'dice-display ' + result.status;
    display.style.transform = 'scale(0.96)';
    setTimeout(() => { display.style.transform = 'scale(1)'; }, 120);
}

function logProbe(result, extra = '') {
    let msg = `<strong>${escapeHtml(result.label)}</strong> (PW ${result.pw}) — ${DS4_STATUS_TEXT[result.status]}`;
    msg += ` · Wurf ${result.rolls.map(r => r.die).join('+')}`;
    if (result.success) msg += ` · Ergebnis <strong>${result.total}</strong>`;
    if (extra) msg += ` · ${extra}`;
    addLog(msg, result.status);
    sendMultiplayerRoll(result, extra);
    if (typeof discordPostProbe === 'function') discordPostProbe(result, extra);
}

function rollKampfwert(key, label, pw) {
    // Situationsmodifikatoren gelten nur für Angriffe und die Abwehr
    const kampf = ['schlagen', 'schiessen', 'zaubern', 'zielzauber', 'abwehr'].includes(key)
        ? currentCombatModifier() : { summe: 0, text: '' };
    const result = rollProbe(pw, { label, modifier: currentModifier() + kampf.summe });
    showProbeResult(result, '', kampf.text);

    let extra = '';
    if (result.patzer && DS4_KAMPFPATZER[key]) {
        extra = 'Kampfpatzer: ' + DS4_KAMPFPATZER[key];
    } else if (result.success && ['schlagen', 'schiessen', 'zielzauber'].includes(key)) {
        extra = `Schaden: <strong>${result.total}</strong> (Gegner würfelt Abwehr`;
        // Gegnerabwehr der geführten Waffe fließt in die Abwehr des Ziels ein
        const ga = key === 'schlagen' ? gegnerabwehr(charForRules(), 'melee')
                 : (key === 'schiessen' ? gegnerabwehr(charForRules(), 'ranged') : 0);
        extra += ga ? ` mit ${ga > 0 ? '+' : ''}${ga} Gegnerabwehr)` : ')';
    } else if (result.success && key === 'abwehr') {
        extra = `Schaden um <strong>${result.total}</strong> reduziert`;
    }

    // Ein erfolgreich gewirkter Zauber geht in die Abklingzeit
    if (['zaubern', 'zielzauber'].includes(key)) {
        const cooldownNote = startSpellCooldown(result);
        if (cooldownNote) extra += (extra ? ' · ' : '') + cooldownNote;
    }

    logProbe(result, extra);
}

// Abklingzeit des vorbereiteten Zaubers starten. Ohne laufenden Kampf gibt es
// keine Rundenzählung — dann wird die Abklingzeit nur als Hinweis vermerkt.
function startSpellCooldown(result) {
    const spell = (appData.spells || []).find(s => s.prepared);
    if (!spell) return '';

    if (result.patzer) {
        spell.prepared = false;
        renderSpells();
        scheduleSave();
        return 'Der Zauber ist herausgesprungen und nicht mehr aktiv';
    }
    if (!result.success) return '';

    const rounds = parseInt(spell.abklingzeit, 10);
    if (!rounds) return '';

    if (typeof currentRound === 'number' && currentRound > 0) {
        spell.cooldownUntil = currentRound + rounds;
        renderSpells();
        scheduleSave();
        return `${escapeHtml(spell.name)} abklingend bis Runde ${spell.cooldownUntil}`;
    }
    return `${escapeHtml(spell.name)}: ${rounds} Runden Abklingzeit`;
}

function rollTypischeProbe() {
    const sel = document.getElementById('f-typische-probe');
    const probe = DS4_TYPISCHE_PROBEN[parseInt(sel.value, 10)];
    if (!probe) return;

    const pw = probeWertFor(probe);
    let modifier = currentModifier();
    const quellen = [];

    // Elfen sind leichtfüßig: +2 auf Schleichen
    if (probe.name === 'Schleichen' && appData.volk === 'elf') {
        modifier += 2;
        quellen.push('Leichtfüßig (Elf): +2');
    }
    // Talente, die genau auf diese Probe wirken (z.B. Wahrnehmung auf Bemerken)
    const talentBonus = talentProbenBonus(appData.talents, probe.name);
    if (talentBonus.summe) {
        modifier += talentBonus.summe;
        quellen.push(talentBonus.text);
    }

    const result = rollProbe(pw, { label: probe.name, modifier });
    showProbeResult(result, '', quellen.join(' · '));
    logProbe(result, quellen.length ? 'inkl. ' + quellen.join(', ') : '');
}

// Wertet die Formel einer typischen Probe gegen den Charakter aus.
// "oder"-Formeln nehmen den höheren Wert, "(mind. 8)" setzt eine Untergrenze.
function probeWertFor(probe) {
    const attrMap = { 'KÖR': 'koerper', 'AGI': 'agilitaet', 'GEI': 'geist' };
    const eigMap = { ST: 'staerke', 'HÄ': 'haerte', BE: 'bewegung', GE: 'geschick', VE: 'verstand', AU: 'aura' };

    const attrCode = probe.formula.slice(0, 3);
    const attrValue = appData.attribute[attrMap[attrCode]] || 0;

    const eigCodes = probe.formula.match(/\b(ST|HÄ|BE|GE|VE|AU)\b/g) || [];
    const eigValues = eigCodes.map(code => effectiveEigenschaft(eigMap[code]));
    const best = eigValues.length ? Math.max(...eigValues) : 0;

    let pw = attrValue + best;
    const floor = probe.formula.match(/mind\. (\d+)/);
    if (floor) pw = Math.max(pw, parseInt(floor[1], 10));
    return pw;
}

function rollFreeProbe() {
    const pw = parseInt(document.getElementById('f-free-pw').value, 10) || 0;
    const result = rollProbe(pw, { label: 'Freie Probe', modifier: currentModifier() });
    showProbeResult(result);
    logProbe(result);
}

// Vergleichende Probe: der eigene Wert gegen den des Gegenübers.
// Als eigener Wert dient die gewählte typische Probe.
function rollOpposedProbe() {
    const sel = document.getElementById('f-typische-probe');
    const probe = DS4_TYPISCHE_PROBEN[parseInt(sel.value, 10)];
    if (!probe) return;

    const eigenerPw = probeWertFor(probe);
    const gegnerPw = parseInt(document.getElementById('f-opposed-pw').value, 10) || 0;

    // Dieselben Boni wie bei der einfachen Probe gelten auch hier
    let eigenerMod = currentModifier() + talentProbenBonus(appData.talents, probe.name).summe;
    if (probe.name === 'Schleichen' && appData.volk === 'elf') eigenerMod += 2;

    const ergebnis = rollOpposed(
        eigenerPw, gegnerPw,
        characterName(), 'Gegenüber',
        eigenerMod, 0
    );

    // Die eigene Probe steht in der großen Anzeige
    showProbeResult(ergebnis.a);

    const gewonnen = ergebnis.sieger === 'a';
    const status = gewonnen ? 'erfolg' : (ergebnis.sieger === 'b' ? 'fehlschlag' : 'neutral');
    const msg = `<strong>${escapeHtml(probe.name)}</strong> vergleichend (PW ${ergebnis.a.pw} gegen ${ergebnis.b.pw}) — ` +
        `eigener Wurf ${ergebnis.a.rolls.map(r => r.die).join('+')} ${DS4_STATUS_TEXT[ergebnis.a.status]}` +
        `${ergebnis.a.success ? ' (' + ergebnis.a.total + ')' : ''}, ` +
        `Gegenüber ${ergebnis.b.rolls.map(r => r.die).join('+')} ${DS4_STATUS_TEXT[ergebnis.b.status]}` +
        `${ergebnis.b.success ? ' (' + ergebnis.b.total + ')' : ''} → <strong>${escapeHtml(ergebnis.begruendung)}</strong>`;

    addLog(msg, status);
    sendMultiplayerLog(msg, status);
}

function rollPlainD20() {
    const die = d20();
    document.getElementById('dice-number').textContent = die;
    document.getElementById('dice-label').textContent = 'Blanker 1W20';
    document.getElementById('dice-status').textContent = '';
    document.getElementById('dice-detail').textContent = '';
    document.getElementById('dice-display').className = 'dice-display';
    addLog(`Blanker 1W20: <strong>${die}</strong>`, 'neutral');
    sendMultiplayerLog(`Blanker 1W20: ${die}`, 'neutral');
}

// --- Logbuch ----------------------------------------------------------------

function addLog(message, status = 'neutral') {
    const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    appData.log.unshift({ time, message, status });
    if (appData.log.length > 60) appData.log.length = 60;
    renderLog();
    scheduleSave();
}

function renderLog() {
    const list = document.getElementById('log-list');
    if (!appData.log.length) {
        list.innerHTML = '<div class="empty-hint">Noch keine Würfe.</div>';
        return;
    }
    list.innerHTML = appData.log.map(e =>
        `<li class="${e.status}"><span class="log-time">${e.time}</span> ${e.message}</li>`
    ).join('');
}

function clearLog() {
    appData.log = [];
    renderLog();
    scheduleSave();
}

// --- Stufenaufstieg ---------------------------------------------------------

// Lernpunkte kaufen +1 auf eine Eigenschaft, Lebenskraft oder einen Talentpunkt.
// Die Kosten hängen von der Klasse ab (Regelwerk S.8).
function openLevelUp() {
    renderLevelUp();
    openModal('levelup-modal');
}

// Steigerungskosten — Hausregeln haben Vorrang vor der Klassentabelle
function lpCosts() {
    if (typeof aktuelleLpKosten === 'function') return aktuelleLpKosten();
    const cls = activeClass();
    return cls ? cls.lpCosts : null;
}

function renderLevelUp() {
    const body = document.getElementById('levelup-body');
    const cls = activeClass();
    if (!cls) {
        body.innerHTML = '<div class="empty-hint">Bitte zuerst eine Klasse wählen — die Steigerungskosten hängen davon ab.</div>';
        return;
    }

    const costs = lpCosts();
    const lp = appData.lp || 0;
    const stufe = stufeFuerEp(appData.ep || 0, !!appData.heldenklasse);

    const rows = Object.keys(DS4_EIGENSCHAFT_NAMES).map(key => {
        const cost = costs[key];
        const base = appData.eigenschaften[key] || 0;
        const eff = effectiveEigenschaft(key);
        const max = eigenschaftMax(key, appData.volk, appData.klasse, appData.menschCapChoices);
        const blocked = eff >= max;
        const affordable = lp >= cost && !blocked;
        return `<div class="list-row">
            <span style="flex:1">${DS4_EIGENSCHAFT_NAMES[key]}
                <span class="eig-abbr">${eff} → ${eff + 1} (max ${max})</span></span>
            <span class="tag">${cost} LP</span>
            <button class="btn btn-sm ${affordable ? 'btn-primary' : ''}" ${affordable ? '' : 'disabled style="opacity:0.4"'}
                    data-buy="eig" data-key="${key}" data-cost="${cost}">
                ${blocked ? 'Höchstwert' : 'Steigern'}
            </button>
        </div>`;
    }).join('');

    const lkAffordable = lp >= costs.lk;
    const tpAffordable = lp >= costs.tp;

    body.innerHTML = `
        <div class="grid-2" style="margin-bottom:0.9rem">
            <div class="budget"><span>Stufe</span> <strong>${stufe}</strong></div>
            <div class="budget ${lp > 0 ? 'done' : ''}"><span>Lernpunkte</span> <strong>${lp}</strong></div>
            <div class="budget ${(appData.tp || 0) > 0 ? 'done' : ''}"><span>Talentpunkte</span> <strong>${appData.tp || 0}</strong></div>
        </div>
        <p class="hint-rule" style="margin-bottom:0.8rem">
            Pro Stufe gibt es <strong>+2 Lernpunkte</strong> und <strong>+1 Talentpunkt</strong>.
            Klasse ${escapeHtml(cls.name)}: günstige Eigenschaften kosten 2 LP, die übrigen 3 LP.
        </p>

        <h4 style="color:var(--accent);font-size:0.9rem;margin-bottom:0.4rem">Eigenschaften</h4>
        ${rows}

        <h4 style="color:var(--accent);font-size:0.9rem;margin:0.9rem 0 0.4rem">Sonstiges</h4>
        <div class="list-row">
            <span style="flex:1">Lebenskraft <span class="eig-abbr">dauerhaft +1</span></span>
            <span class="tag">${costs.lk} LP</span>
            <button class="btn btn-sm ${lkAffordable ? 'btn-primary' : ''}" ${lkAffordable ? '' : 'disabled style="opacity:0.4"'}
                    data-buy="lk" data-cost="${costs.lk}">Steigern</button>
        </div>
        <div class="list-row">
            <span style="flex:1">Zusätzlicher Talentpunkt</span>
            <span class="tag">${costs.tp} LP</span>
            <button class="btn btn-sm ${tpAffordable ? 'btn-primary' : ''}" ${tpAffordable ? '' : 'disabled style="opacity:0.4"'}
                    data-buy="tp" data-cost="${costs.tp}">Kaufen</button>
        </div>

        <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn btn-sm" onclick="grantLevelUp()">+1 Stufe gutschreiben (+2 LP, +1 TP)</button>
        </div>
        <p class="hint" style="margin-top:0.6rem">
            Ein Lernpunkt kann stattdessen auch eine neue Sprache oder Schrift kaufen.
            Neue Zaubersprüche kosten weder LP noch TP.
        </p>`;

    body.querySelectorAll('[data-buy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const cost = parseInt(btn.dataset.cost, 10);
            if ((appData.lp || 0) < cost) return;
            appData.lp -= cost;

            const kind = btn.dataset.buy;
            if (kind === 'eig') {
                const key = btn.dataset.key;
                appData.eigenschaften[key] = (appData.eigenschaften[key] || 0) + 1;
                addLog(`${DS4_EIGENSCHAFT_NAMES[key]} auf ${effectiveEigenschaft(key)} gesteigert (${cost} LP)`, 'erfolg');
            } else if (kind === 'lk') {
                appData.bonusLk = (appData.bonusLk || 0) + 1;
                appData.lkCurrent = (appData.lkCurrent || 0) + 1;
                addLog(`Lebenskraft dauerhaft um 1 gesteigert (${cost} LP)`, 'erfolg');
            } else if (kind === 'tp') {
                appData.tp = (appData.tp || 0) + 1;
                // Zusätzlich gekaufte TP zählen im Talent-Budget mit
                appData.extraTp = (appData.extraTp || 0) + 1;
                addLog(`Talentpunkt gekauft (${cost} LP)`, 'erfolg');
            }

            renderAll();
            renderLevelUp();
            scheduleSave();
            syncMultiplayerState();
        });
    });
}

function grantLevelUp() {
    const hr = typeof hausregeln !== 'undefined' ? hausregeln : null;
    const tpZuwachs = hr ? hr.tpProStufe : 1;
    const ntpZuwachs = (hr && hr.ntpAktiv) ? hr.ntpProStufe : 0;

    appData.lp = (appData.lp || 0) + 2;
    appData.tp = (appData.tp || 0) + tpZuwachs;
    if (ntpZuwachs) appData.ntp = (appData.ntp || 0) + ntpZuwachs;

    addLog(`Stufenaufstieg: +2 Lernpunkte, +${tpZuwachs} Talentpunkt${tpZuwachs === 1 ? '' : 'e'}` +
        (ntpZuwachs ? `, +${ntpZuwachs} ${escapeHtml(hr.ntpName)}` : ''), 'erfolg');
    renderAll();
    renderLevelUp();
    scheduleSave();
    syncMultiplayerState();
}

// --- Zauber-Abklingzeit -----------------------------------------------------

// Der Spielleiter sendet die aktuelle Kampfrunde; daran hängt die Abklingzeit.
function tickSpellCooldowns(round) {
    let changed = false;
    (appData.spells || []).forEach(spell => {
        if (spell.cooldownUntil && round > 0 && round >= spell.cooldownUntil) {
            spell.cooldownUntil = 0;
            changed = true;
            addLog(`<strong>${escapeHtml(spell.name)}</strong> ist wieder einsatzbereit.`, 'erfolg');
        }
        if (round === 0 && spell.cooldownUntil) { spell.cooldownUntil = 0; changed = true; }
    });
    renderRoundIndicator(round);
    if (changed) { renderSpells(); scheduleSave(); }
}

function renderRoundIndicator(round) {
    let el = document.getElementById('round-indicator');
    if (!el) {
        el = document.createElement('div');
        el.id = 'round-indicator';
        el.className = 'round-indicator';
        document.body.appendChild(el);
    }
    if (round > 0) {
        el.innerHTML = `⚔️ Kampfrunde <strong>${round}</strong>`;
        el.classList.add('visible');
    } else {
        el.classList.remove('visible');
    }
}

// --- Regel-Spickzettel ------------------------------------------------------

function openRulesModal() {
    const body = document.getElementById('rules-body');
    body.innerHTML = `
        <h4 style="color:var(--accent-bright)">Die Probe</h4>
        <p class="hint">1W20 gegen den Probenwert (PW) <strong>unterwürfeln</strong>. Wurf ≤ PW = Erfolg.
        Bei Angriffen ist das Wurfergebnis zugleich der Schaden.</p>
        <ul class="hint" style="margin:0.5rem 0 0 1.2rem">
            <li><strong>Natürliche 1 = Immersieg:</strong> immer Erfolg, zählt als bestmögliches Ergebnis (voller PW).</li>
            <li><strong>Natürliche 20 = Patzer:</strong> immer Fehlschlag.</li>
            <li><strong>PW über 20:</strong> aufgeteilt in mehrere Würfe (20, Rest). Nur der erste Würfel kann patzen, erfolgreiche Teilergebnisse werden addiert.</li>
        </ul>

        <h4 style="color:var(--accent-bright);margin-top:1rem">Schwierigkeiten</h4>
        <div class="hint">${DS4_DIFFICULTY_MODIFIERS.map(d => `${d.label}: ${d.mod > 0 ? '+' : ''}${d.mod}`).join(' · ')}</div>

        <h4 style="color:var(--accent-bright);margin-top:1rem">Kampfwerte</h4>
        <div class="hint">
            Lebenskraft = KÖR+HÄ+10 · Abwehr = KÖR+HÄ+PA · Initiative = AGI+BE · Laufen = AGI/2+1<br>
            Schlagen = KÖR+ST+WB · Schießen = AGI+GE+WB · Zaubern = GEI+AU+ZB−PA · Zielzauber = GEI+GE+ZB−PA
        </div>

        <h4 style="color:var(--accent-bright);margin-top:1rem">Bewegung &amp; Reichweiten</h4>
        <ul class="hint" style="margin:0.3rem 0 0 1.2rem">
            <li>Pro Runde bis zu <em>Laufen</em> Meter bewegen — die Bewegung darf vor und nach der Aktion aufgeteilt werden.</li>
            <li>Bei Bodenplänen und Rastermatten gilt: <strong>ein Feld = 1 Meter</strong> (Anhang B, S.153).</li>
            <li>Im Nahkampf erreicht man normalerweise alle <strong>angrenzenden</strong> Felder.</li>
            <li><strong>2 Felder weit</strong> reichen Bihänder, Hellebarde, Kampfstab, Schlachtbeil und Speer — sofern niemand dazwischen steht.</li>
            <li><strong>Stoßwaffen</strong> (Hellebarde, Kampfstab, Speer) treffen auch Ziele, vor denen jemand steht.</li>
            <li>Fernkampf: <strong>−1 je volle 10m</strong>, zusätzlich <strong>−2</strong> auf Ziele im Nahkampf. Schleuder und Wurfmesser stattdessen −1 je 2m.</li>
        </ul>

        <h4 style="color:var(--accent-bright);margin-top:1rem">Kampf</h4>
        <ul class="hint" style="margin:0.3rem 0 0 1.2rem">
            <li>Kampfrunde = 5 Sekunden. Reihenfolge nach absteigender Initiative.</li>
            <li>Pro Runde: bis zu <em>Laufen</em> Meter bewegen + <strong>eine</strong> Aktion.</li>
            <li>Abwehr ist eine automatische Probe (keine Aktion): Erfolg reduziert den Schaden um das Wurfergebnis.</li>
            <li>Fernkampf: −1 je 10m Distanz, −2 auf Ziele im Nahkampf.</li>
            <li>Bewusstlos bei 0 LK, Tod wenn der Schaden unter 0 den KÖR-Wert übersteigt.</li>
        </ul>

        <h4 style="color:var(--accent-bright);margin-top:1rem">Kampfpatzer</h4>
        <ul class="hint" style="margin:0.3rem 0 0 1.2rem">
            ${Object.entries(DS4_KAMPFPATZER).map(([k, v]) => `<li><strong>${k}:</strong> ${escapeHtml(v)}</li>`).join('')}
        </ul>

        <h4 style="color:var(--accent-bright);margin-top:1rem">Steigern</h4>
        <p class="hint">Pro Stufe: +2 Lernpunkte, +1 Talentpunkt. LP-Kosten für +1 auf eine Eigenschaft je nach Klasse
        (günstige Eigenschaften 2 LP, sonst 3 LP), Lebenskraft 1 LP, ein zusätzlicher Talentpunkt 3 LP.</p>

        <p class="hint-rule" style="margin-top:1rem">
            Vollständige Regeln: <code>regeln/Dungeonslayers4.pdf</code> (kostenlos von dungeonslayers.net).
        </p>`;
    openModal('rules-modal');
}
function closeRulesModal() { closeModal('rules-modal'); }

// --- Modal-Helfer -----------------------------------------------------------

function openModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 250);
}

// --- Initialisierung --------------------------------------------------------

function renderAll() {
    refreshBoundInputs();
    renderPortrait();
    renderAttributes();
    renderBudgets();
    renderMeta();
    renderDerived();
    renderTalents();
    renderSpells();
    renderInventory();
    renderLog();
}

function populateStaticSelects() {
    const diff = document.getElementById('f-difficulty');
    diff.innerHTML = DS4_DIFFICULTY_MODIFIERS.map(d =>
        `<option value="${d.mod}"${d.mod === 0 ? ' selected' : ''}>${d.label} (${d.mod > 0 ? '+' : ''}${d.mod})</option>`
    ).join('');

    const probe = document.getElementById('f-typische-probe');
    probe.innerHTML = DS4_TYPISCHE_PROBEN.map((p, i) =>
        `<option value="${i}">${p.name} — ${p.formula}</option>`
    ).join('');

    populateEquipmentSelects();
}

document.addEventListener('DOMContentLoaded', () => {
    populateStaticSelects();
    bindInputs();
    wireCombatModifiers();
    renderCombatModifiers();

    if (!loadFromStorage()) {
        appData = blankCharacter();
    }
    renderAll();

    // Erstbesuch ohne Charakter: direkt in den Wizard
    if (!appData.volk && !appData.klasse && !appData.name) {
        openWizard();
    }
});
