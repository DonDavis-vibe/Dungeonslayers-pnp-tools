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
        slayerpunkte: 0,   // optionale Regel, verfällt am Kampfende
        // Verbesserungen und Verzauberungen je Ausrüstungsplatz
        equipmentBoni: {},
        ntp: 0,          // zweiter Talentpunkt-Topf, falls die Runde ihn führt
        // Merkt sich, was mit Lernpunkten gekauft wurde. Nur so lassen sich
        // Steigerungen zurücknehmen und die Punkte korrekt erstatten.
        gekauft: { staerke: 0, haerte: 0, bewegung: 0, geschick: 0, verstand: 0, aura: 0, lk: 0, tp: 0 },
        // Bereits gutgeschriebene Stufenaufstiege — verhindert doppelte Vergabe
        stufenGutgeschrieben: 1,
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
    const zauber = preparedSpellInfo();
    return {
        volk: appData.volk,
        klasse: appData.klasse,
        attribute: appData.attribute,
        eigenschaften: effectiveEigenschaften(),
        equipment: appData.equipment,
        equipmentBoni: appData.equipmentBoni || {},
        zauberZb: zauber.zb,
        zauberTyp: zauber.typ,
        zauberArt: zauber.art,
        // Damit die Engine klassenfremde Rüstung erkennt (Regelwerk S.41)
        armorRules: armorRules(),
        bonusLk: appData.bonusLk || 0,
        // Talente wirken auf die Kampfwerte (z.B. Kämpfer: Schlagen +1 je Rang)
        talents: appData.talents || []
    };
}

function preparedSpell() {
    return (appData.spells || []).find(s => s.prepared) || null;
}

// Zauberbonus und Art des vorbereiteten Zaubers.
// Viele Zauber haben einen formelhaften ZB ("-(KÖR+VE)/2 des Ziels"); der lässt
// sich nicht vorausberechnen und wird als `unklar` gemeldet, statt still 0 zu sein.
function preparedSpellInfo() {
    const spell = preparedSpell();
    if (!spell) return { zb: 0, typ: null, unklar: false, name: '', art: null };

    const data = (typeof zauberListe === 'function' ? zauberListe() : (typeof DS4_ZAUBER !== 'undefined' ? DS4_ZAUBER : []))
        .find(z => z.name === spell.name);
    const rohZb = spell.zb != null && spell.zb !== '' ? spell.zb : (data ? data.zb : 0);
    const typ = spell.typ || (data ? data.typ : null);

    const text = String(rohZb).trim();
    // Nur reine Zahlenangaben wie "+3", "-2" oder "0" sind verlässlich
    const rein = /^[+−-]?\d+$/.test(text.replace('−', '-'));
    const zb = rein ? parseInt(text.replace('−', '-'), 10) : 0;

    // Art des Spruchs für Talente wie Fürsorger oder Feuermagier
    const art = data
        ? { arten: data.arten || [], geistesbeeinflussend: !!data.geistesbeeinflussend }
        : { arten: spell.arten || [], geistesbeeinflussend: !!spell.geistesbeeinflussend };

    return { zb, typ, unklar: !rein, name: spell.name, rohZb: text, art };
}

// Alte Aufrufer erwarten weiterhin nur die Zahl
function preparedSpellZb() {
    return preparedSpellInfo().zb;
}

// Wie viele Zauber der Erzmagier mit dem Talent Zauberroutine zusätzlich
// abrufbereit halten darf (1 je Talentrang).
function routineKapazitaet() {
    return talentRang(appData.talents, 'Zauberroutine');
}

// Zauberroutine (ERZ 16): pro Talentrang ein gebundener Zauber, zu dem der
// Erzmagier "wie mit einem Zauberstab" ohne Aktion und ohne GEI+VE-Probe
// wechseln kann. Es bleibt trotzdem bei EINEM aktiven Spruch — der ZB gehört
// stets dem Spruch, der gerade gewirkt wird (S.46), also fließt hier nichts
// zusätzlich in die Kampfwerte ein. Die Liste dient nur der Erinnerung, welche
// Sprüche ohne Wechselprobe bereitstehen.
function routineSpellsInfo() {
    const data = typeof zauberListe === 'function' ? zauberListe() : (typeof DS4_ZAUBER !== 'undefined' ? DS4_ZAUBER : []);
    // Kappen, falls mehr Zauber als "Routine" markiert sind, als der aktuelle
    // Talentrang erlaubt (z.B. nach zurückgenommenen Rängen).
    const kapazitaet = routineKapazitaet();
    return (appData.spells || [])
        .filter(s => s.routine && !s.prepared)
        .slice(0, kapazitaet)
        .map(s => {
            const d = data.find(z => z.name === s.name);
            const typ = s.typ || (d ? d.typ : null);
            return { name: s.name, typ };
        });
}

function activeClass() {
    return DS4_CLASSES[appData.klasse] || null;
}

// Manche Heldenklassen bringen Zauberzugang mit, obwohl die Grundklasse nicht
// zaubert — im Regelwerk ist das nur der Paladin (S.16).
function heldenZauberzugang() {
    if (!appData.heldenklasse || typeof DS4_HELDEN_ZAUBERZUGANG === 'undefined') return null;
    return DS4_HELDEN_ZAUBERZUGANG[appData.heldenklasse] || null;
}

// Zaubert dieser Charakter überhaupt? Grundlage für die Kampfwerte Zaubern und
// Zielzauber sowie für das Zauber-Panel.
function istZauberwirker() {
    const cls = activeClass();
    return !!((cls && cls.isCaster) || heldenZauberzugang());
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
        appData.equipmentBoni = parsed.equipmentBoni || {};
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
    appData.equipmentBoni = parsed.equipmentBoni || {};
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

// Setzt den Bogen vollständig zurück. Das Charakterbild bleibt nur, wenn der
// Nutzer es ausdrücklich behalten will.
function charakterLoeschen() {
    if (!confirm('Diesen Charakter wirklich vollständig löschen?\n\n' +
        'Werte, Talente, Zauber, Inventar und Notizen gehen verloren.\n' +
        'Ungespeicherte Änderungen lassen sich nicht wiederherstellen.')) return;

    const altesBild = appData.portrait || '';
    const bildBehalten = altesBild &&
        confirm('Das Charakterbild behalten?\n\nOK = Bild bleibt · Abbrechen = auch das Bild löschen');

    appData = blankCharacter();
    if (bildBehalten) appData.portrait = altesBild;

    renderAll();
    refreshBoundInputs();
    scheduleSave();
    syncMultiplayerState();
    addLog('Charakterbogen geleert.', 'neutral');
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
            // Ändern sich EP oder Heldenklasse, verschiebt sich die Stufe —
            // die Punkte müssen dann in beide Richtungen mitwandern.
            if (path === 'ep' || path === 'heldenklasse') {
                if (stufenAbgleichen()) { refreshBoundInputs(); renderAll(); }
            }
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

    // Nach der Erschaffung wachsen die Eigenschaften über Lernpunkte weiter.
    // Das Soll ist dann 8 plus alles, was nachweislich gekauft wurde — so bleibt
    // die Anzeige grün, statt eine erlaubte Steigerung als Überschreitung zu zeigen.
    const gekaufteEig = Object.keys(DS4_EIGENSCHAFT_NAMES)
        .reduce((summe, key) => summe + gekaufteStufen(key), 0);
    const soll = 8 + gekaufteEig;

    const eigEl = document.getElementById('budget-eig');
    eigEl.innerHTML = `Eigenschaften: <strong>${eigSum}</strong>/${soll}`;
    eigEl.className = 'budget' + (eigSum === soll ? ' done' : (eigSum > soll ? ' over' : ''));
    eigEl.title = gekaufteEig
        ? `8 aus der Erschaffung plus ${gekaufteEig} mit Lernpunkten gekauft`
        : 'Bei der Erschaffung werden 8 Punkte verteilt';
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
    const isCaster = istZauberwirker();
    container.innerHTML = '';

    KAMPFWERT_DEFS.forEach(def => {
        if (def.casterOnly && !isCaster) return;
        const raw = derived[def.key];
        const value = def.unit === 'm' ? raw.toFixed(1).replace('.', ',').replace(',0', '') : raw;
        const talentQuellen = (derived.talentHerkunft || {})[def.key] || [];

        // Bei Zaubern/Zielzauber sichtbar machen, ob der Zauberbonus drinsteckt.
        // Der ZB gehört nur auf den Kampfwert, mit dem der vorbereitete Spruch
        // auch gewirkt wird — ohne Hinweis sieht das nach einem Fehler aus.
        let zbHinweis = '';
        if (def.key === 'zaubern' || def.key === 'zielzauber') {
            const zauber = preparedSpellInfo();
            const passt = zauber.typ === (def.key === 'zielzauber' ? 'ziel' : 'normal');
            if (!zauber.name) zbHinweis = 'kein Zauber vorbereitet — ZB 0';
            else if (!passt) zbHinweis = `ZB 0 — „${zauber.name}" wird über ${def.key === 'zaubern' ? 'Zielzauber' : 'Zaubern'} gewirkt`;
            else if (zauber.unklar) zbHinweis = `„${zauber.name}": ZB ${zauber.rohZb} — formelhaft, selbst einrechnen`;
            else zbHinweis = `inkl. ZB ${zauber.zb > 0 ? '+' : ''}${zauber.zb} von „${zauber.name}"`;

            // Zauberroutine: weitere gebundene Sprüche, zu denen ohne Aktion und
            // ohne Probe gewechselt werden kann. Ihr ZB zählt erst beim Wirken
            // des jeweiligen Spruchs, nicht hier dauerhaft.
            const routine = (typeof routineSpellsInfo === 'function' ? routineSpellsInfo() : [])
                .filter(r => (r.typ === 'ziel') === (def.key === 'zielzauber'));
            if (routine.length) {
                zbHinweis += ' · ohne Wechselprobe bereit: ' + routine.map(r => `„${r.name}"`).join(', ');
            }
        }

        const card = document.createElement('div');
        card.className = 'kw-card' + (def.rollable ? ' rollable' : '');
        card.innerHTML = `
            <div class="kw-label">${def.label}</div>
            <div class="kw-value">${value}${def.unit || ''}</div>
            <div class="kw-formula">${def.formula}${talentQuellen.length ? ' <span class="kw-talent">+ Talent</span>' : ''}</div>
            ${zbHinweis ? `<div class="kw-zb">${escapeHtml(zbHinweis)}</div>` : ''}`;

        const talentText = (talentQuellen.length ? `\nTalente: ${talentQuellen.join(', ')}` : '') +
                           (zbHinweis ? `\n${zbHinweis}` : '');
        if (def.rollable) {
            card.title = `${def.label}-Probe würfeln (PW ${raw})${talentText}`;
            card.addEventListener('click', () => rollKampfwert(def.key, def.label, raw));
        } else if (talentText) {
            card.title = talentText.trim();
        }
        container.appendChild(card);
    });

    renderSituativeTalente();
    renderSlayerpunkte();

    document.getElementById('tag-pa').textContent = 'PA ' + derived.panzerung;
    renderEquipmentInfo(derived);
    renderEquipmentBoni();
}

// Alles, was der Bogen NICHT automatisch einrechnen kann, sammelt sich unter den
// Kampfwerten: situativ wirkende Talente und formelhafte Zauberboni.
function renderSituativeTalente() {
    const box = document.getElementById('situative-talente');
    if (!box) return;

    const bloecke = [];

    const liste = situativeTalente(appData.talents);
    if (liste.length) {
        bloecke.push('<strong>Situative Talente</strong> (nicht automatisch eingerechnet):<br>' +
            liste.map(t =>
                `• <strong>${escapeHtml(t.name)} ${t.rang}</strong>: ${escapeHtml(t.bonus)} auf ${escapeHtml(t.wert)} — ${escapeHtml(t.bedingung)}`
            ).join('<br>'));
    }

    // Formelhafte Zauberboni (z.B. "−(KÖR+VE)/2 des Ziels") hängen vom Ziel ab
    // und können nicht vorausberechnet werden — der Bogen rechnet hier mit 0.
    const zauber = preparedSpellInfo();
    if (zauber.unklar) {
        bloecke.push(`<strong>Zauberbonus formelhaft:</strong> <em>${escapeHtml(zauber.name)}</em> hat ZB ` +
            `<strong>${escapeHtml(zauber.rohZb)}</strong>. Der Bogen rechnet mit <strong>0</strong> — ` +
            `den tatsächlichen Wert am Ziel ausrechnen und als Modifikator eintragen.`);
    }

    box.innerHTML = bloecke.join('<hr style="border:0;border-top:1px solid var(--border);margin:0.5rem 0">');
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
        slayerpunkteVerfallen('bewusstlos');
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

// Lebenskraft bei Kampfbeginn. Verschnaufen heilt die Hälfte der "soeben"
// verlorenen LK (Regelwerk S.42) — also nur der in diesem Kampf verlorenen,
// nicht auch alter Wunden von vorher.
let kampfStartLk = null;
let letzteKampfrunde = 0;

function merkeKampfstand(round) {
    if (round > 0 && letzteKampfrunde === 0) kampfStartLk = appData.lkCurrent || 0;
    // Slayerpunkte verfallen, sobald der Kampf endet (Regelwerk S.45).
    // slayerpunkteVerfallen() meldet nur, wenn tatsächlich Punkte da waren —
    // wiederholte Runde-0-Meldungen fluten das Log also nicht.
    if (round === 0) slayerpunkteVerfallen('Kampf beendet');
    letzteKampfrunde = round;
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
    // Ohne begleiteten Kampf ist der Höchstwert die einzige Bezugsgröße
    const imKampfVerloren = kampfStartLk !== null;
    const basis = imKampfVerloren ? Math.max(cur, kampfStartLk) : max;
    const verloren = basis - cur;
    if (verloren <= 0) {
        addLog(imKampfVerloren ? 'Verschnaufen bringt nichts — in diesem Kampf ging keine Lebenskraft verloren.' : 'Bereits bei voller Lebenskraft.', 'neutral');
        return;
    }
    const geheilt = Math.min(max - cur, Math.floor(verloren / 2));
    appData.lkCurrent = cur + geheilt;
    kampfStartLk = null; // pro Kampf nur einmal
    refreshBoundInputs();
    renderDerived();
    scheduleSave();
    const woher = imKampfVerloren ? 'im Kampf verlorenen' : 'verlorenen';
    addLog(`Verschnaufen: +${geheilt} LK (Hälfte der ${verloren} ${woher}) — jetzt ${appData.lkCurrent}/${max}`, 'erfolg');
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

    // Rüstungsbeschränkungen der Klasse (Regelwerk S.41), gemildert durch "Gerüstet"
    if (rules) {
        const geruestet = talentRang(appData.talents, 'Gerüstet');
        const klasseName = activeClass().isCaster
            ? DS4_CLASSES.zauberwirker.subtypes[appData.subtype].name
            : activeClass().name;

        ['koerper', 'helm', 'schienen', 'schild'].forEach(slot => {
            const armor = findArmor(appData.equipment[slot]);
            if (!armor || ruestungErlaubt(armor, rules, geruestet)) return;
            warnings.push(`<span class="tag tag-warn">${escapeHtml(armor.name)}: für ${escapeHtml(klasseName)} nicht erlaubt — Zauber-Malus ×4, Agilität −${armor.pa} (bereits eingerechnet)</span>`);
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

    // Rüstung an- und ablegen (Regelwerk S.44)
    const anlegen = ruestungAnlegenAktionen(appData.equipment);
    if (anlegen.aktionen || anlegen.helmFrei) {
        details.push(`<strong>Rüstung anlegen:</strong> ${anlegen.aktionen} Aktion${anlegen.aktionen === 1 ? '' : 'en'}` +
            (anlegen.helmFrei ? ' (Helm aufsetzen ist frei)' : ''));
    }
    if (schlaeftInMetall(appData.equipment)) {
        details.push('<strong>Schlafen in Metallrüstung:</strong> am Morgen KÖR+HÄ — misslingt sie, ' +
            '−1 auf alle Proben für 24 Stunden (kumulativ, geht nur ungerüstet schlafend wieder weg)');
    }

    document.getElementById('equipment-details').innerHTML = details.join(' · ');
}

// --- Verbesserungen & Verzauberungen ----------------------------------------

// Je Ausrüstungsplatz ein Bonus plus freie Notiz. Bei Waffen zählt der Bonus auf
// den Waffenbonus (Schlagen bzw. Schießen), bei Rüstung auf die Panzerung.
const DS4_BONUS_SLOTS = [
    { slot: 'melee', label: 'Nahkampfwaffe', feld: 'wb', einheit: 'WB' },
    { slot: 'ranged', label: 'Fernkampfwaffe', feld: 'wb', einheit: 'WB' },
    { slot: 'koerper', label: 'Körperrüstung', feld: 'pa', einheit: 'PA' },
    { slot: 'helm', label: 'Helm', feld: 'pa', einheit: 'PA' },
    { slot: 'schienen', label: 'Schienen', feld: 'pa', einheit: 'PA' },
    { slot: 'schild', label: 'Schild', feld: 'pa', einheit: 'PA' }
];

function equipmentBonus(slot) {
    if (!appData.equipmentBoni) appData.equipmentBoni = {};
    if (!appData.equipmentBoni[slot]) appData.equipmentBoni[slot] = { wb: 0, pa: 0, notiz: '' };
    return appData.equipmentBoni[slot];
}

function renderEquipmentBoni() {
    const box = document.getElementById('equipment-boni');
    if (!box) return;

    box.innerHTML = DS4_BONUS_SLOTS.map(def => {
        const getragen = appData.equipment[def.slot];
        const b = (appData.equipmentBoni || {})[def.slot] || {};
        return `<div class="list-row">
            <span style="flex:1;min-width:7rem">${def.label}
                <span class="eig-abbr">${getragen ? escapeHtml(getragen) : 'nichts angelegt'}</span></span>
            <span class="row-sub">${def.einheit}</span>
            <input type="number" value="${b[def.feld] || 0}" step="1" style="width:3.5rem"
                   data-eqbonus="${def.slot}" data-feld="${def.feld}" ${getragen ? '' : 'disabled'}>
            <input type="text" value="${escapeHtml(b.notiz || '')}" placeholder="z.B. Flammenklinge, 1× Feuerstrahl pro Kampf"
                   style="flex:2;min-width:9rem" data-eqbonus="${def.slot}" data-feld="notiz" ${getragen ? '' : 'disabled'}>
        </div>`;
    }).join('');

    box.querySelectorAll('[data-eqbonus]').forEach(input => {
        input.addEventListener('input', () => {
            const b = equipmentBonus(input.dataset.eqbonus);
            b[input.dataset.feld] = input.type === 'number' ? (parseInt(input.value, 10) || 0) : input.value;
            renderDerived();
            scheduleSave();
            syncMultiplayerState();
        });
    });
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
    document.getElementById('panel-zauber').style.display = istZauberwirker() ? '' : 'none';

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

// addSpell() steht in spellPicker.js — dort mit Zugangsprüfung gegen zauber.js
// und mit Rückfall auf einen Freitext-Eintrag, falls die Zauberdaten fehlen.
function addItem() { appData.inventory.push({ id: uid(), name: '', menge: 1, notiz: '' }); renderInventory(); onDataChanged(); }

// --- Würfeln ----------------------------------------------------------------

function currentModifier() {
    return parseInt(document.getElementById('f-difficulty').value, 10) || 0;
}

// --- Kampfmodifikatoren -----------------------------------------------------

const aktiveKampfMods = {};

// Sammelt die eingestellten Situationsmodifikatoren. Welche davon greifen, hängt
// von der Probenart ab (Regelwerk S.43-44) — Position, Größe, Distanz und Zielen
// sind Angriffsmodifikatoren, die Abwehr trifft nur "liegend" und "zwei Waffen".
function currentCombatModifier(art = 'schlagen') {
    const num = id => parseInt(document.getElementById(id).value, 10) || 0;
    const zweiWaffenTalent = (appData.talents || []).find(t => t.name === 'Zwei Waffen');
    // Schleuder und Wurfmesser haben −1 je 2m statt je 10m
    const fernwaffe = findWeapon(appData.equipment && appData.equipment.ranged);

    return combatModifiers({
        distanz: num('mod-distanz'),
        distanzJe: (art === 'schiessen' && fernwaffe && fernwaffe.distanzJe) || 10,
        zielen: num('mod-zielen'),
        getuemmel: num('mod-getuemmel'),
        hindernisse: num('mod-hindernisse'),
        groessenDiff: num('mod-groesse'),
        imNahkampf: !!aktiveKampfMods.imNahkampf,
        selbstLiegend: !!aktiveKampfMods.selbstLiegend,
        zielLiegend: !!aktiveKampfMods.zielLiegend,
        vonDerSeite: !!aktiveKampfMods.vonDerSeite,
        vonHinten: !!aktiveKampfMods.vonHinten,
        zweiWaffen: !!aktiveKampfMods.zweiWaffen,
        zweiWaffenTalent: zweiWaffenTalent ? (zweiWaffenTalent.rang || 0) : 0
    }, art);
}

function renderCombatModifiers() {
    const box = document.getElementById('mod-summary');
    if (!box) return;

    const nah = currentCombatModifier('schlagen');
    const fern = currentCombatModifier('schiessen');
    const abwehr = currentCombatModifier('abwehr');

    if (!nah.teile.length && !fern.teile.length && !abwehr.teile.length) {
        box.innerHTML = 'Kein Modifikator aktiv.';
        return;
    }

    const zeile = (titel, mod) => {
        if (!mod.teile.length) return `<div><span class="eig-abbr">${titel}</span> ±0</div>`;
        const farbe = mod.summe >= 0 ? 'var(--success)' : 'var(--fail)';
        return `<div><span class="eig-abbr">${titel}</span>
            <strong style="color:${farbe}">${mod.summe > 0 ? '+' : ''}${mod.summe}</strong>
            — ${escapeHtml(mod.text)}</div>`;
    };

    box.innerHTML = zeile('Nahkampf', nah) + zeile('Fernkampf/Zielzauber', fern) + zeile('Abwehr', abwehr);
}

function resetCombatModifiers() {
    Object.keys(aktiveKampfMods).forEach(k => delete aktiveKampfMods[k]);
    ['mod-distanz', 'mod-zielen', 'mod-getuemmel', 'mod-hindernisse'].forEach(id => { document.getElementById(id).value = 0; });
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
    ['mod-distanz', 'mod-zielen', 'mod-groesse', 'mod-getuemmel', 'mod-hindernisse'].forEach(id => {
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
    if (result.slayendZusatz) detail.push(`⚡ ${escapeHtml(slayendText(result))}`);
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

// --- Slayerpunkte (optionale Regel, Regelwerk S.45) -------------------------

// Je Kampfrunde, in der man Schaden verursacht (oder als Heiler einen im Kampf
// verletzten Kameraden heilt), gibt es 1 SP — höchstens 3 gleichzeitig. Sie
// verfallen am Kampfende und bei Bewusstlosigkeit.
let slayerRundeVergeben = 0;

function slayerpunkteAn() {
    return typeof slayerpunkteAktiv === 'function' && slayerpunkteAktiv();
}

function slayerpunktVerdienen(grund = 'Schaden verursacht') {
    if (!slayerpunkteAn()) return;
    // Pro Kampfrunde nur einmal. Ohne laufenden Kampf zählt jede Aktion als Runde.
    const runde = (typeof currentRound === 'number' && currentRound > 0) ? currentRound : -1;
    if (runde > 0 && slayerRundeVergeben === runde) return;
    slayerRundeVergeben = runde;

    const vorher = appData.slayerpunkte || 0;
    if (vorher >= DS4_SLAYERPUNKTE_MAX) return;
    appData.slayerpunkte = vorher + 1;
    renderSlayerpunkte();
    scheduleSave();
    addLog(`⚡ <strong>+1 Slayerpunkt</strong> (${escapeHtml(grund)}) — jetzt ${appData.slayerpunkte}/${DS4_SLAYERPUNKTE_MAX}`, 'erfolg');
}

function slayerpunkteAusgeben(kosten, was) {
    if ((appData.slayerpunkte || 0) < kosten) return;
    appData.slayerpunkte -= kosten;
    renderSlayerpunkte();
    scheduleSave();
    const text = `⚡ <strong>${kosten} SP</strong> ausgegeben: ${escapeHtml(was)} — noch ${appData.slayerpunkte} SP`;
    addLog(text, 'neutral');
    sendMultiplayerLog(text, 'neutral');
}

// Am Kampfende und bei Bewusstlosigkeit verfallen alle Slayerpunkte
function slayerpunkteVerfallen(grund) {
    slayerRundeVergeben = 0;
    if (!(appData.slayerpunkte > 0)) return;
    appData.slayerpunkte = 0;
    renderSlayerpunkte();
    scheduleSave();
    addLog(`⚡ Slayerpunkte verfallen (${escapeHtml(grund)}).`, 'neutral');
}

function renderSlayerpunkte() {
    const box = document.getElementById('slayerpunkte-box');
    if (!box) return;
    if (!slayerpunkteAn()) { box.innerHTML = ''; return; }

    const sp = appData.slayerpunkte || 0;
    const pips = Array.from({ length: DS4_SLAYERPUNKTE_MAX }, (_, i) =>
        `<span class="slayer-pip ${i < sp ? 'full' : ''}">⚡</span>`).join('');

    const optionen = DS4_SLAYERPUNKTE.filter(o => o.kosten <= sp);
    const liste = optionen.length
        ? optionen.map((o, i) => `<option value="${DS4_SLAYERPUNKTE.indexOf(o)}">${o.kosten} SP — ${escapeHtml(o.name)}</option>`).join('')
        : '<option value="">— nicht genug Punkte —</option>';

    box.innerHTML = `
        <div class="hint-rule">
            <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap">
                <strong>Slayerpunkte</strong>
                <button class="help-btn" type="button" data-hilfe="slayerpunkte" aria-label="Hilfe: Slayerpunkte" title="Hilfe: Slayerpunkte">?</button>
                <span class="slayer-pips">${pips}</span>
                <span class="hint">${sp}/${DS4_SLAYERPUNKTE_MAX}</span>
                <span style="margin-left:auto;display:flex;gap:0.3rem">
                    <button class="btn btn-sm btn-ghost" id="slayer-heal" ${sp >= DS4_SLAYERPUNKTE_MAX ? 'disabled style="opacity:0.35"' : ''} title="Punkt für das Heilen eines im Kampf verletzten Kameraden">★ Heilung</button>
                    <button class="btn btn-sm btn-ghost" id="slayer-plus" ${sp >= DS4_SLAYERPUNKTE_MAX ? 'disabled style="opacity:0.35"' : ''} title="Punkt von Hand gutschreiben">+</button>
                    <button class="btn btn-sm btn-ghost" id="slayer-clear" ${sp ? '' : 'disabled style="opacity:0.35"'} title="Alle Punkte verfallen lassen">✕</button>
                </span>
            </div>
            <div style="display:flex;gap:0.4rem;margin-top:0.5rem;align-items:center">
                <select id="slayer-option" style="flex:1;font-size:0.8rem" ${optionen.length ? '' : 'disabled'}>${liste}</select>
                <button class="btn btn-sm btn-primary" id="slayer-spend" ${optionen.length ? '' : 'disabled style="opacity:0.35"'}>Einsetzen</button>
            </div>
            <div class="hint" style="margin-top:0.35rem">
                1 SP je Kampfrunde mit verursachtem Schaden. Auch Heiler, die im Kampf verletzte
                Kameraden heilen, bekommen dafür einen Punkt (S.45) — dafür ist der Knopf
                <strong>&#9733; Heilung</strong>. Boni wirken, bis du in der nächsten
                Runde wieder an der Reihe bist, und ändern nie den PW einer bereits gewürfelten Probe.
            </div>
        </div>`;

    document.getElementById('slayer-plus').addEventListener('click', () => {
        appData.slayerpunkte = Math.min(DS4_SLAYERPUNKTE_MAX, (appData.slayerpunkte || 0) + 1);
        renderSlayerpunkte(); scheduleSave();
    });
    document.getElementById('slayer-heal').addEventListener('click',
        () => slayerpunktVerdienen('Kameraden geheilt'));
    document.getElementById('slayer-clear').addEventListener('click', () => slayerpunkteVerfallen('von Hand geleert'));
    document.getElementById('slayer-spend').addEventListener('click', () => {
        const idx = parseInt(document.getElementById('slayer-option').value, 10);
        const opt = DS4_SLAYERPUNKTE[idx];
        if (opt) slayerpunkteAusgeben(opt.kosten, opt.name + (opt.hinweis ? ` (${opt.hinweis})` : ''));
    });
}

// --- Schlagen auf mehrere Gegner aufteilen (Regelwerk S.43) -----------------

let mehrereGegnerAnzahl = 2;

function openMehrereGegner() {
    mehrereGegnerAnzahl = 2;
    renderMehrereGegner();
    openModal('mehrere-modal');
}

function renderMehrereGegner() {
    const body = document.getElementById('mehrere-body');
    const gesamt = lastDerived ? lastDerived.schlagen : 0;
    const n = mehrereGegnerAnzahl;

    // Vorschlag: möglichst gleichmäßig aufteilen, Rest auf die vorderen Gegner
    const basis = Math.floor(gesamt / n);
    const rest = gesamt - basis * n;
    const vorschlag = Array.from({ length: n }, (_, i) => basis + (i < rest ? 1 : 0));

    body.innerHTML = `
        <p class="hint-rule" style="margin-bottom:0.9rem">
            Der Schlagen-Wert lässt sich auf bis zu <strong>vier angrenzende Gegner</strong> aufteilen.
            Mit den Teilwerten wird je ein eigener Angriff gewürfelt, und die eigene Abwehr sinkt
            um <strong>2 je Gegner</strong>, bis du in der nächsten Runde wieder an der Reihe bist.
        </p>
        <div class="budget" style="margin-bottom:0.8rem">
            Schlagen gesamt: <strong>${gesamt}</strong>
            <span style="margin-left:auto">Abwehr in dieser Runde: <strong style="color:var(--fail)">−${2 * n}</strong></span>
        </div>
        <div class="radio-row" style="margin-bottom:0.8rem">
            ${[2, 3, 4].map(z => `<span class="radio-pill ${n === z ? 'selected' : ''}" data-mgegner="${z}">${z} Gegner</span>`).join('')}
        </div>
        ${vorschlag.map((wert, i) => `
            <div class="list-row">
                <span style="flex:1">Gegner ${i + 1}</span>
                <input type="number" class="mg-wert" value="${wert}" min="0" max="${gesamt}" style="width:4rem">
                <span class="row-sub">Schlagen</span>
            </div>`).join('')}
        <div class="hint" id="mg-summe" style="margin-top:0.5rem"></div>
        <div style="display:flex;gap:0.5rem;margin-top:1rem">
            <button class="btn btn-primary" id="mg-roll">Alle Angriffe würfeln</button>
            <button class="btn btn-ghost" onclick="closeModal('mehrere-modal')">Abbrechen</button>
        </div>`;

    const werte = () => [...body.querySelectorAll('.mg-wert')].map(el => parseInt(el.value, 10) || 0);
    const pruefen = () => {
        const summe = werte().reduce((a, b) => a + b, 0);
        const box = document.getElementById('mg-summe');
        const zuviel = summe > gesamt;
        box.innerHTML = `Verteilt: <strong style="color:${zuviel ? 'var(--fail)' : 'var(--success)'}">${summe}</strong> / ${gesamt}` +
            (zuviel ? ' — mehr als der Schlagen-Wert hergibt' : '');
        document.getElementById('mg-roll').disabled = zuviel;
        document.getElementById('mg-roll').style.opacity = zuviel ? '0.4' : '1';
    };

    body.querySelectorAll('[data-mgegner]').forEach(pill => pill.addEventListener('click', () => {
        mehrereGegnerAnzahl = parseInt(pill.dataset.mgegner, 10);
        renderMehrereGegner();
    }));
    body.querySelectorAll('.mg-wert').forEach(el => el.addEventListener('input', pruefen));
    document.getElementById('mg-roll').addEventListener('click', () => rollMehrereGegner(werte()));
    pruefen();
}

function rollMehrereGegner(teilwerte) {
    const mod = currentCombatModifier('schlagen');
    const slayend = typeof slayendeWuerfelAktiv === 'function' && slayendeWuerfelAktiv();
    const zeilen = [];
    let trefferSchaden = 0;

    teilwerte.forEach((pw, i) => {
        const result = rollProbe(pw, {
            label: `Schlagen — Gegner ${i + 1}`,
            modifier: currentModifier() + mod.summe,
            slayend
        });
        if (i === 0) showProbeResult(result, '', mod.text);

        let zeile = `Gegner ${i + 1} (PW ${result.pw}): ${DS4_STATUS_TEXT[result.status]} · Wurf ${result.rolls.map(r => r.die).join('+')}`;
        if (result.success) {
            zeile += ` · Schaden <strong>${result.total}</strong>`;
            trefferSchaden += result.total;
        }
        if (result.slayendZusatz) zeile += ` · ⚡ ${slayendText(result)}`;
        if (result.patzer) zeile += ` · ${kampfpatzerText('schlagen')}`;
        zeilen.push(zeile);
    });

    const abwehrMalus = 2 * teilwerte.length;
    const msg = `<strong>Angriff auf ${teilwerte.length} Gegner</strong> (Schlagen aufgeteilt)<br>` +
        zeilen.join('<br>') +
        `<br>Eigene Abwehr bis zum nächsten Zug: <strong style="color:var(--fail)">−${abwehrMalus}</strong>`;

    // Erst der Punkt, dann der Angriff — so steht die Angriffszeile im Log oben,
    // genau wie bei einem einzelnen Angriff über rollKampfwert()
    if (trefferSchaden > 0) slayerpunktVerdienen('mehrere Gegner getroffen');
    addLog(msg, trefferSchaden > 0 ? 'erfolg' : 'fehlschlag');
    sendMultiplayerLog(msg, trefferSchaden > 0 ? 'erfolg' : 'fehlschlag');
    closeModal('mehrere-modal');
}

// Kampfpatzer-Folge, bezogen auf die tatsächlich geführte Ausrüstung.
// Grundlage ist die Tabelle S.43, ergänzt um die Fußnoten der Waffentabelle
// (hölzerne Waffen zerbrechen, die Schlachtgeißel trifft den Angreifer selbst).
function kampfpatzerText(key) {
    const basis = DS4_KAMPFPATZER[key];
    if (!basis) return '';

    if (key === 'abwehr') {
        const schild = findArmor(appData.equipment.schild);
        const holz = schild && /Holz/.test(schild.name);
        return 'Kampfpatzer: Charakter stürzt zu Boden' +
            (holz ? `, der <strong>${escapeHtml(schild.name)}</strong> zerbricht dabei (nicht-magisch).` : '.');
    }

    const slot = key === 'schlagen' ? 'melee' : (key === 'schiessen' ? 'ranged' : null);
    if (!slot) return 'Kampfpatzer: ' + basis;

    const waffe = findWeapon(appData.equipment[slot]);
    if (!waffe) return 'Kampfpatzer: ' + basis;

    if (waffe.patzerSelbst) {
        return `Kampfpatzer: <strong>${escapeHtml(waffe.name)}</strong> — der Angreifer trifft sich selbst. ` +
            'Angriff neu würfeln, Patzer dabei ausgeschlossen.';
    }
    let text = `Kampfpatzer: <strong>${escapeHtml(waffe.name)}</strong> fällt zu Boden`;
    if (waffe.zerbricht === key) text += ' und zerbricht dabei (nicht-magisch)';
    return text + '.';
}

function rollKampfwert(key, label, pw) {
    // Situationsmodifikatoren gelten nur für Angriffe und die Abwehr — und je
    // nach Probenart auch nur teilweise (Regelwerk S.43-44)
    const istKampfprobe = ['schlagen', 'schiessen', 'zaubern', 'zielzauber', 'abwehr'].includes(key);
    const kampf = istKampfprobe ? currentCombatModifier(key) : { summe: 0, text: '' };
    // Slayende Würfel gelten für Angriffs- und Abwehrproben (Regelwerk S.45)
    const slayend = istKampfprobe && typeof slayendeWuerfelAktiv === 'function' && slayendeWuerfelAktiv();

    const result = rollProbe(pw, { label, modifier: currentModifier() + kampf.summe, slayend });

    const istAngriff = ['schlagen', 'schiessen', 'zielzauber'].includes(key);
    const hinweise = [];

    // Schaden aus dem Wurfergebnis ableiten — mit den Sonderfällen aus S.44
    let schaden = result.total;
    if (istAngriff && result.success) {
        // Schüsse ins Getümmel: nie mehr als der normale Höchstschaden (= PW ohne den Bonus)
        const getuemmel = parseInt(document.getElementById('mod-getuemmel').value, 10) || 0;
        if (key === 'schiessen' && getuemmel && schaden > pw) {
            hinweise.push(`Getümmel: Schaden von ${schaden} auf den Höchstschaden ${pw} gedeckelt`);
            schaden = pw;
        }
        // Wehrlose Gegner: doppelter Schaden im Nahkampf, Abwehr ohne Rüstung
        if (key === 'schlagen' && aktiveKampfMods.wehrlos) {
            schaden *= 2;
            hinweise.push('Ziel wehrlos: doppelter Schaden, Abwehr ohne Rüstung');
        }
    }

    showProbeResult(result, '', kampf.text);

    let extra = '';
    if (result.patzer && DS4_KAMPFPATZER[key]) {
        extra = kampfpatzerText(key);
    } else if (result.success && istAngriff) {
        extra = `Schaden: <strong>${schaden}</strong> (Gegner würfelt Abwehr`;
        // Gegnerabwehr fließt in die Abwehr des Ziels ein — aus Waffe und
        // Talenten (Verletzen/Scharfschütze/Verheerer, Waffenloser Meister)
        const ga = gegnerabwehr(charForRules(), key);
        extra += ga ? ` mit ${ga > 0 ? '+' : ''}${ga} Gegnerabwehr)` : ')';
        // Zurückdrängen ist bei jedem gelungenen Nahkampftreffer möglich (S.44)
        if (key === 'schlagen') hinweise.push('kann den Gegner 1m zurückdrängen (gleiche oder kleinere Größe)');
    } else if (result.success && key === 'abwehr') {
        extra = `Schaden um <strong>${result.total}</strong> reduziert`;
    }

    if (result.slayendZusatz) hinweise.unshift('⚡ ' + slayendText(result));
    if (hinweise.length) extra += (extra ? ' · ' : '') + hinweise.join(' · ');

    // Ein erfolgreich gewirkter Zauber geht in die Abklingzeit
    if (['zaubern', 'zielzauber'].includes(key)) {
        const cooldownNote = startSpellCooldown(result);
        // Beim Patzer ersetzt der Hinweis mit Zaubernamen den allgemeinen
        // Kampfpatzer-Text, statt dasselbe zweimal in die Zeile zu schreiben.
        if (cooldownNote) extra = result.patzer ? cooldownNote : extra + (extra ? ' · ' : '') + cooldownNote;

        // Ein erfolgreicher Heilzauber fragt gleich, wem die LK gutkommen
        if (result.success) {
            const spell = (appData.spells || []).find(s => s.prepared);
            if (spell && istHeilzauber(spell)) heilzauberAnwenden(result.total, spell.name);
        }
    }

    // Slayerpunkt für eine Runde, in der Schaden verursacht wurde (S.45)
    if (istAngriff && result.success && schaden > 0) slayerpunktVerdienen();

    logProbe(result, extra);
}

// Abklingzeit des vorbereiteten Zaubers starten. Ohne laufenden Kampf gibt es
// keine Rundenzählung — dann wird die Abklingzeit nur als Hinweis vermerkt.
// Erkennt einen Heilzauber an Name und Wirkungstext. Bewusst großzügig — im
// Zweifel gibt es den Punkt lieber einmal zu viel als gar nicht, und der Tisch
// kann ihn über den ✕-Knopf wieder wegnehmen.
function istHeilzauber(spell) {
    const daten = typeof alleZauber === 'function'
        ? alleZauber().find(z => z.name === spell.name) : null;
    const text = `${spell.name} ${(daten && daten.effekt) || spell.effekt || ''}`;
    return /heil|genes|kurier|wundverschluss|lebenskraft zurück/i.test(text);
}

// Ein erfolgreicher Heilzauber fragt, wem die Heilung gutkommt - sich selbst
// oder, ueber den Spielleiter weitergeleitet, einem verbundenen Mitspieler.
// Es gibt keine direkte Verbindung zwischen Spielern (Stern-Topologie um den
// Spielleiter herum), deshalb laeuft die Weiterleitung ueber ihn - er muss
// dabei aber selbst nichts tun, wie beim Angriff auch.
// Leer lassen ueberspringt die Zuteilung, genau wie bisher.
function heilzauberAnwenden(betrag, quelle) {
    const verbunden = typeof hostConnection !== 'undefined' && hostConnection && hostConnection.open;
    // gruppenStand fuehrt die GANZE Gruppe inklusive der eigenen Person -
    // fuer die Zielauswahl gehoert man selbst da nicht rein, dafuer gibt es 'S'.
    const mitspieler = verbunden && typeof gruppenStand !== 'undefined'
        ? gruppenStand.filter(p => p.name !== characterName()) : [];

    const zeilen = ['S) Mir selbst'];
    mitspieler.forEach((p, i) => zeilen.push(`${i + 1}) ${p.name}`));

    const eingabe = prompt(
        `${quelle} heilt ${betrag} LK. Wem gutschreiben?\n\n` + zeilen.join('\n') +
        `\n\nBuchstabe/Nummer eingeben, leer lassen zum Überspringen:`);
    if (!eingabe) return;

    const wahl = eingabe.trim().toUpperCase();

    if (wahl === 'S') {
        const max = lastDerived ? lastDerived.lebenskraft : 0;
        appData.lkCurrent = Math.min(max, (appData.lkCurrent || 0) + betrag);
        refreshBoundInputs();
        renderDerived();
        scheduleSave();
        addLog(`${escapeHtml(quelle)}: dir selbst ${betrag} LK gutgeschrieben — jetzt ${appData.lkCurrent}/${max}`, 'erfolg');
        if (verbunden) sendMultiplayerLog(`heilt sich selbst um ${betrag} LK (${escapeHtml(quelle)}) — jetzt ${appData.lkCurrent}/${max}`, 'erfolg', false);
        return;
    }

    const ziel = mitspieler[parseInt(wahl, 10) - 1];
    if (!ziel || !verbunden) return;

    hostConnection.send({ type: 'healRequest', zielName: ziel.name, betrag, quelle });
    addLog(`${escapeHtml(quelle)}: ${betrag} LK an <strong>${escapeHtml(ziel.name)}</strong> geschickt.`, 'erfolg');
}

function startSpellCooldown(result) {
    const spell = (appData.spells || []).find(s => s.prepared);
    if (!spell) return '';

    if (result.patzer) {
        spell.prepared = false;
        renderSpells();
        scheduleSave();
        return `Kampfpatzer: <strong>${escapeHtml(spell.name)}</strong> ist herausgesprungen und nicht mehr aktiv`;
    }
    if (!result.success) return '';

    // Heiler bekommen auch für das Heilen verletzter Kameraden einen
    // Slayerpunkt (Regelwerk S.45). Ob wirklich jemand verletzt war, weiß nur
    // der Tisch — deshalb greift das nur bei einem erkennbaren Heilzauber.
    if (istHeilzauber(spell)) slayerpunktVerdienen('Heilzauber gewirkt');

    let rounds = parseInt(spell.abklingzeit, 10);
    if (!rounds) return '';

    // Erzmagier-Talent "Abklingen": senkt die Abklingzeit JEDES Zauberspruchs,
    // nie unter Null (S.17)
    const abklingenRang = talentRang(appData.talents, 'Abklingen');
    if (abklingenRang) rounds = Math.max(0, rounds - abklingenRang);
    if (!rounds) return `${escapeHtml(spell.name)}: keine Abklingzeit mehr (Abklingen)`;

    if (typeof currentRound === 'number' && currentRound > 0) {
        spell.cooldownUntil = currentRound + rounds;
        renderSpells();
        scheduleSave();
        return `${escapeHtml(spell.name)} abklingend bis Runde ${spell.cooldownUntil}`;
    }
    return `${escapeHtml(spell.name)}: ${rounds} Runden Abklingzeit`;
}

// Welches mehrfach erwerbbare Talent passt zu einer typischen Probe?
// Wissensgebiet und Handwerk geben je +3 pro Rang, aber nur für ihr Gebiet
// (Regelwerk S.34 und S.47).
const DS4_PROBE_GEBIETSTALENT = {
    'Wissen': { talent: 'Wissensgebiet', proRang: 3 },
    'Handwerksprobe': { talent: 'Handwerk', proRang: 3 }
};

// Füllt die Gebietsauswahl, sobald zur gewählten Probe ein Gebietstalent passt
function renderGebietWahl() {
    const box = document.getElementById('gebiet-wahl');
    if (!box) return;
    const sel = document.getElementById('f-typische-probe');
    const probe = DS4_TYPISCHE_PROBEN[parseInt(sel.value, 10)];
    const def = probe ? DS4_PROBE_GEBIETSTALENT[probe.name] : null;
    const gebiete = def && typeof talentGebiete === 'function' ? talentGebiete(def.talent) : [];

    if (!def || !gebiete.length) { box.style.display = 'none'; return; }
    box.style.display = '';
    document.getElementById('gebiet-hinweis').textContent = `${def.talent} — +${def.proRang} je Rang`;
    document.getElementById('f-gebiet').innerHTML =
        '<option value="">ohne passendes Gebiet</option>' +
        gebiete.map(g => `<option value="${escapeHtml(g.gebiet)}">${escapeHtml(g.gebiet)} (Rang ${g.rang})</option>`).join('');
}

// Bonus aus dem gewählten Gebiet, falls eines passt
function gebietsBonus(probenName, gebietsWert) {
    const def = DS4_PROBE_GEBIETSTALENT[probenName];
    if (!def || !gebietsWert) return null;
    const treffer = (typeof talentGebiete === 'function' ? talentGebiete(def.talent) : [])
        .find(g => g.gebiet === gebietsWert);
    if (!treffer) return null;
    return { summe: def.proRang * treffer.rang, text: `${def.talent} ${treffer.gebiet} ${treffer.rang}: +${def.proRang * treffer.rang}` };
}

function rollTypischeProbe() {
    const sel = document.getElementById('f-typische-probe');
    const probe = DS4_TYPISCHE_PROBEN[parseInt(sel.value, 10)];
    if (!probe) return;

    const pw = probeWertFor(probe);
    let modifier = currentModifier();
    const quellen = [];

    // Wissensgebiet zählt nur für das gewählte Gebiet
    const gebiet = gebietsBonus(probe.name, (document.getElementById('f-gebiet') || {}).value);
    if (gebiet) {
        modifier += gebiet.summe;
        quellen.push(gebiet.text);
    }

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

    // Talente, die hier nur unter Bedingungen greifen, kommen als Erinnerung dazu
    const situativ = situativeProbenHinweise(appData.talents, probe.name);
    const extra = [
        quellen.length ? 'inkl. ' + quellen.join(', ') : '',
        situativ.length ? 'zusätzlich möglich — ' + situativ.join(' · ') : ''
    ].filter(Boolean).join(' · ');
    logProbe(result, extra);
}

// Handwerksprobe: Das Regelwerk legt keine feste Formel fest — welches Attribut
// und welche Eigenschaft passen, entscheidet die Spielleitung je nach Handwerk
// (Waffenschmied eher KÖR+ST, Feinmechanik eher GEI+GE). Der Rang im passenden
// Handwerk gibt +3 je Rang (S.34).
function rollHandwerksprobe() {
    const attrKey = document.getElementById('f-hw-attr').value;
    const eigKey = document.getElementById('f-hw-eig').value;
    if (!attrKey || !eigKey) return;

    const pw = (appData.attribute[attrKey] || 0) + effectiveEigenschaft(eigKey);
    let modifier = currentModifier();
    const quellen = [];

    // Nur das ausgewählte Handwerk zählt
    const auswahl = (document.getElementById('f-gebiet') || {}).value;
    const gebiet = gebietsBonus('Handwerksprobe', auswahl);
    if (gebiet) {
        modifier += gebiet.summe;
        quellen.push(gebiet.text);
    }

    const label = `Handwerk${gebiet ? ` (${auswahl})` : ''} — ${DS4_ATTRIBUT_NAMES[attrKey]}+${DS4_EIGENSCHAFT_ABBR[eigKey]}`;
    const result = rollProbe(pw, { label, modifier });
    showProbeResult(result, '', quellen.join(' · '));
    logProbe(result, quellen.length ? 'inkl. ' + quellen.join(', ') : '');
}

// Wertet die Formel einer typischen Probe gegen den Charakter aus.
// "oder"-Formeln nehmen den höheren Wert, "(mind. 8)" setzt eine Untergrenze.
function probeWertFor(probe) {
    const attrMap = { 'KÖR': 'koerper', 'AGI': 'agilitaet', 'GEI': 'geist' };
    const eigMap = { ST: 'staerke', 'HÄ': 'haerte', BE: 'bewegung', GE: 'geschick', VE: 'verstand', AU: 'aura' };

    // Alle Großbuchstaben-Kürzel der Formel einsammeln. Über \b ginge das nicht:
    // Ä ist kein Wortzeichen, "HÄ" in "KÖR+HÄ" würde damit nie gefunden.
    const codes = probe.formula.match(/[A-ZÄÖÜ]+/g) || [];
    const attrValue = appData.attribute[attrMap[codes[0]]] || 0;

    const eigValues = codes.slice(1)
        .filter(code => eigMap[code])
        .map(code => effectiveEigenschaft(eigMap[code]));
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

// Menschen dürfen ihren Eigenschaftshöchstwert um insgesamt 2 Punkte anheben:
// "2 beliebige Eigenschaften +1 oder 1 beliebige Eigenschaft +2" (Regelwerk S.9).
// Die Wahl gehört zum Charakter, nicht zur Steigerung — deshalb steht sie hier
// oben im Stufenaufstiegs-Dialog, wo die Höchstwerte ohnehin sichtbar sind.
const MENSCH_CAP_PUNKTE = 2;

function menschCapHtml() {
    if (appData.volk !== 'mensch') return '';
    const gewaehlt = appData.menschCapChoices || [];
    const offen = MENSCH_CAP_PUNKTE - gewaehlt.length;

    const pills = Object.keys(DS4_EIGENSCHAFT_NAMES).map(key => {
        const anzahl = gewaehlt.filter(c => c === key).length;
        return `<span class="radio-pill ${anzahl ? 'selected' : ''}" data-mcap="${key}"
                title="Klicken schaltet durch: kein Bonus → +1 → +2 → kein Bonus">
            ${DS4_EIGENSCHAFT_NAMES[key]}${anzahl ? ` +${anzahl}` : ''}
        </span>`;
    }).join('');

    return `<div class="budget ${offen === 0 ? 'done' : ''}" style="display:block;margin-bottom:0.9rem">
            <div style="margin-bottom:0.4rem">
                <strong>Höchstwert-Bonus (Mensch)</strong> —
                ${offen > 0 ? `noch <strong>${offen}</strong> Punkt${offen === 1 ? '' : 'e'} zu vergeben`
                            : 'vollständig vergeben'}
            </div>
            <div class="radio-row">${pills}</div>
            <div class="hint" style="margin-top:0.35rem">
                2 beliebige Eigenschaften +1 oder 1 Eigenschaft +2 auf den Grundwert 12.
            </div>
        </div>`;
}

function wireMenschCap(body) {
    body.querySelectorAll('[data-mcap]').forEach(pill => {
        pill.addEventListener('click', () => {
            const key = pill.dataset.mcap;
            const gewaehlt = appData.menschCapChoices || [];
            const andere = gewaehlt.filter(c => c !== key);

            // 0 → +1 → +2 → 0 durchschalten; passt es nicht ins Budget, auf 0 zurück
            let anzahl = (gewaehlt.length - andere.length + 1) % (MENSCH_CAP_PUNKTE + 1);
            if (andere.length + anzahl > MENSCH_CAP_PUNKTE) anzahl = 0;

            appData.menschCapChoices = andere.concat(new Array(anzahl).fill(key));
            renderAttributes();
            renderLevelUp();
            onDataChanged();
        });
    });
}

// Wie viele Steigerungen dieses Postens wurden mit Lernpunkten gekauft?
function gekaufteStufen(key) {
    return (appData.gekauft && appData.gekauft[key]) || 0;
}

function buchen(key, delta) {
    if (!appData.gekauft) {
        appData.gekauft = { staerke: 0, haerte: 0, bewegung: 0, geschick: 0, verstand: 0, aura: 0, lk: 0, tp: 0 };
    }
    appData.gekauft[key] = Math.max(0, (appData.gekauft[key] || 0) + delta);
}

// Nimmt eine mit Lernpunkten gekaufte Steigerung zurück und erstattet die Punkte.
// Erstattet wird zum aktuellen Preis — bei geänderten Hausregeln ist das die
// nachvollziehbarere Variante als ein gemerkter alter Preis.
function steigerungZuruecknehmen(art, key) {
    const costs = lpCosts();
    if (!costs) return;

    if (art === 'eig') {
        if (!gekaufteStufen(key)) return;
        appData.eigenschaften[key] = Math.max(0, (appData.eigenschaften[key] || 0) - 1);
        appData.lp = (appData.lp || 0) + costs[key];
        buchen(key, -1);
        addLog(`${DS4_EIGENSCHAFT_NAMES[key]} zurückgenommen — ${costs[key]} LP zurück`, 'neutral');
    } else if (art === 'lk') {
        if (!gekaufteStufen('lk')) return;
        appData.bonusLk = Math.max(0, (appData.bonusLk || 0) - 1);
        appData.lkCurrent = Math.max(0, (appData.lkCurrent || 0) - 1);
        appData.lp = (appData.lp || 0) + costs.lk;
        buchen('lk', -1);
        addLog(`Lebenskraft zurückgenommen — ${costs.lk} LP zurück`, 'neutral');
    } else if (art === 'tp') {
        if (!gekaufteStufen('tp')) return;
        if ((appData.tp || 0) < 1) {
            addLog('Der gekaufte Talentpunkt ist bereits ausgegeben — erst ein Talent zurücknehmen.', 'fehlschlag');
            return;
        }
        appData.tp -= 1;
        appData.extraTp = Math.max(0, (appData.extraTp || 0) - 1);
        appData.lp = (appData.lp || 0) + costs.tp;
        buchen('tp', -1);
        addLog(`Talentpunkt-Kauf zurückgenommen — ${costs.tp} LP zurück`, 'neutral');
    }

    renderAll();
    renderLevelUp();
    scheduleSave();
    syncMultiplayerState();
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
        const eff = effectiveEigenschaft(key);
        const max = eigenschaftMax(key, appData.volk, appData.klasse, appData.menschCapChoices);
        const blocked = eff >= max;
        const affordable = lp >= cost && !blocked;
        // Zurücknehmen geht nur, soweit hier auch gekauft wurde
        const gekauft = gekaufteStufen(key);
        return `<div class="list-row">
            <span style="flex:1">${DS4_EIGENSCHAFT_NAMES[key]}
                <span class="eig-abbr">${eff} → ${eff + 1} (max ${max})${gekauft ? ` · ${gekauft} gekauft` : ''}</span></span>
            <span class="tag">${cost} LP</span>
            <button class="btn btn-sm" data-refund="eig" data-key="${key}"
                    ${gekauft ? '' : 'disabled style="opacity:0.3"'}
                    title="${gekauft ? `Steigerung zurücknehmen, ${cost} LP zurück` : 'Hier wurde nichts mit Lernpunkten gekauft'}">−</button>
            <button class="btn btn-sm ${affordable ? 'btn-primary' : ''}" ${affordable ? '' : 'disabled style="opacity:0.4"'}
                    data-buy="eig" data-key="${key}" data-cost="${cost}">
                ${blocked ? 'Höchstwert' : 'Steigern'}
            </button>
        </div>`;
    }).join('');

    const lkAffordable = lp >= costs.lk;
    const tpAffordable = lp >= costs.tp;

    body.innerHTML = menschCapHtml() + `
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
            <span style="flex:1">Lebenskraft
                <span class="eig-abbr">dauerhaft +1${gekaufteStufen('lk') ? ` · ${gekaufteStufen('lk')} gekauft` : ''}</span></span>
            <span class="tag">${costs.lk} LP</span>
            <button class="btn btn-sm" data-refund="lk"
                    ${gekaufteStufen('lk') ? '' : 'disabled style="opacity:0.3"'}
                    title="${gekaufteStufen('lk') ? `Steigerung zurücknehmen, ${costs.lk} LP zurück` : 'Noch keine Lebenskraft gekauft'}">−</button>
            <button class="btn btn-sm ${lkAffordable ? 'btn-primary' : ''}" ${lkAffordable ? '' : 'disabled style="opacity:0.4"'}
                    data-buy="lk" data-cost="${costs.lk}">Steigern</button>
        </div>
        <div class="list-row">
            <span style="flex:1">Zusätzlicher Talentpunkt
                <span class="eig-abbr">${gekaufteStufen('tp') ? `${gekaufteStufen('tp')} gekauft` : ''}</span></span>
            <span class="tag">${costs.tp} LP</span>
            <button class="btn btn-sm" data-refund="tp"
                    ${gekaufteStufen('tp') ? '' : 'disabled style="opacity:0.3"'}
                    title="${gekaufteStufen('tp') ? `Kauf zurücknehmen, ${costs.tp} LP zurück` : 'Noch keinen Talentpunkt gekauft'}">−</button>
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

    wireMenschCap(body);

    body.querySelectorAll('[data-refund]').forEach(btn => {
        btn.addEventListener('click', () => steigerungZuruecknehmen(btn.dataset.refund, btn.dataset.key));
    });

    body.querySelectorAll('[data-buy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const cost = parseInt(btn.dataset.cost, 10);
            if ((appData.lp || 0) < cost) return;
            appData.lp -= cost;

            const kind = btn.dataset.buy;
            if (kind === 'eig') {
                const key = btn.dataset.key;
                appData.eigenschaften[key] = (appData.eigenschaften[key] || 0) + 1;
                buchen(key, 1);
                addLog(`${DS4_EIGENSCHAFT_NAMES[key]} auf ${effectiveEigenschaft(key)} gesteigert (${cost} LP)`, 'erfolg');
            } else if (kind === 'lk') {
                appData.bonusLk = (appData.bonusLk || 0) + 1;
                appData.lkCurrent = (appData.lkCurrent || 0) + 1;
                buchen('lk', 1);
                addLog(`Lebenskraft dauerhaft um 1 gesteigert (${cost} LP)`, 'erfolg');
            } else if (kind === 'tp') {
                appData.tp = (appData.tp || 0) + 1;
                // Zusätzlich gekaufte TP zählen im Talent-Budget mit
                appData.extraTp = (appData.extraTp || 0) + 1;
                buchen('tp', 1);
                addLog(`Talentpunkt gekauft (${cost} LP)`, 'erfolg');
            }

            renderAll();
            renderLevelUp();
            scheduleSave();
            syncMultiplayerState();
        });
    });
}

// Punkte für einen oder mehrere Stufenaufstiege gutschreiben. Zentral, damit der
// Aufstieg über EP vom Spielleiter dieselben (Haus-)Regeln nutzt wie der Knopf
// im Stufenaufstiegs-Dialog. Liefert einen lesbaren Text der Gutschrift.
// Schreibt die Punkte fuer eine Anzahl Stufen gut. Negative Werte nehmen sie
// wieder weg — nur so bleibt ein Herabsetzen der Stufe sauber.
function gutschriftFuerStufen(stufen) {
    if (!stufen) return '';
    const hr = typeof hausregeln !== 'undefined' ? hausregeln : null;
    const tpZuwachs = (hr ? hr.tpProStufe : 1) * stufen;
    const ntpZuwachs = ((hr && hr.ntpAktiv) ? hr.ntpProStufe : 0) * stufen;
    const lpZuwachs = 2 * stufen;

    // Beim Zurücknehmen nicht unter Null rutschen: Wer die Punkte schon
    // ausgegeben hat, behält das Gekaufte — der Bogen weist die Abweichung aus.
    appData.lp = Math.max(0, (appData.lp || 0) + lpZuwachs);
    appData.tp = Math.max(0, (appData.tp || 0) + tpZuwachs);
    if (ntpZuwachs) appData.ntp = Math.max(0, (appData.ntp || 0) + ntpZuwachs);

    const vz = stufen > 0 ? '+' : '';
    return `${vz}${lpZuwachs} Lernpunkte, ${vz}${tpZuwachs} Talentpunkte` +
        (ntpZuwachs ? `, ${vz}${ntpZuwachs} ${escapeHtml(hr.ntpName)}` : '');
}

// Gleicht die vergebenen Punkte mit der Stufe ab, die sich aus den EP ergibt.
// Wird immer aufgerufen, wenn sich EP oder Heldenklasse ändern — dadurch wirkt
// ein Herabsetzen der Stufe genauso wie ein Aufstieg, nur in die andere Richtung.
function stufenAbgleichen(still) {
    const stufe = stufeFuerEp(appData.ep || 0, !!appData.heldenklasse);
    const bisher = appData.stufenGutgeschrieben || 1;
    if (stufe === bisher) return false;

    const text = gutschriftFuerStufen(stufe - bisher);
    appData.stufenGutgeschrieben = stufe;

    if (!still) {
        addLog(stufe > bisher
            ? `<strong>Stufe ${stufe} erreicht</strong> — ${text}`
            : `Stufe auf ${stufe} gesenkt — ${text}`, stufe > bisher ? 'erfolg' : 'neutral');
    }
    return true;
}

function grantLevelUp() {
    // Die Stufe ergibt sich aus den EP — ohne EP-Anpassung bliebe der Charakter
    // sonst formal auf seiner alten Stufe stehen und Talente blieben gesperrt.
    const hatHeld = !!appData.heldenklasse;
    const naechste = epBisNaechsteStufe(appData.ep || 0, hatHeld);
    if (!naechste) { addLog('Höchststufe 20 bereits erreicht.', 'neutral'); return; }
    appData.ep = naechste.needed;

    stufenAbgleichen(true);
    addLog(`Stufenaufstieg auf <strong>Stufe ${naechste.stufe}</strong> (${naechste.needed} EP)`, 'erfolg');
    refreshBoundInputs();
    renderAll();
    renderLevelUp();
    scheduleSave();
    syncMultiplayerState();
}

// --- Zauber-Abklingzeit -----------------------------------------------------

// Der Spielleiter sendet die aktuelle Kampfrunde; daran hängt die Abklingzeit.
function tickSpellCooldowns(round) {
    merkeKampfstand(round);
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

        <h4 style="color:var(--accent-bright);margin-top:1rem">Kampfdetails (S.43–44)</h4>
        <ul class="hint" style="margin:0.3rem 0 0 1.2rem">
            <li><strong>Abwartehandlung:</strong> statt zu handeln später dran sein — +2 Initiative je Runde ohne Aktion, höchstens +10. Sobald man handelt, verfällt der Bonus.</li>
            <li><strong>Mehrere Gegner:</strong> Schlagen auf bis zu 4 angrenzende Gegner aufteilen, je ein eigener Angriff. Kostet 2 Abwehr pro Gegner bis zum nächsten Zug.</li>
            <li><strong>Zwei Waffen:</strong> −10 auf Schlagen und Abwehr, je Rang im Talent <em>Zwei Waffen</em> um 2 gemildert.</li>
            <li><strong>Zielen:</strong> höchstens Laufen/2 bewegen, dann +2 je gezielter Runde (max. +10) auf Schießen/Zielzauber.</li>
            <li><strong>Getümmel:</strong> blindlings in eine Menge schießen gibt +1 je Individuum (max. +20), das Ziel bestimmt der Zufall und der Schaden wird auf den normalen Höchstschaden gedeckelt.</li>
            <li><strong>Hindernisse:</strong> −1 je Baum, Gegner oder Kamerad, an dem vorbeigeschossen wird. Nur bei einem Patzer trifft man eines davon.</li>
            <li><strong>Wehrlose Gegner</strong> (gefesselt, schlafend): doppelter Schaden im Nahkampf, Abwehr ohne Rüstung.</li>
            <li><strong>Zurückdrängen:</strong> ein gelungener Nahkampftreffer schiebt gleich große oder kleinere Gegner 1m zurück (<em>Blocker</em> darf mit KÖR+HÄ dagegenhalten).</li>
            <li><strong>Rüstung anlegen:</strong> 2 Aktionen je Punkt Panzerung, Helme sind frei. Wer in Metallrüstung schläft, würfelt morgens KÖR+HÄ oder kassiert −1 auf alle Proben für 24 Stunden.</li>
            <li><strong>Größenkategorien</strong> (S.104): ${DS4_GROESSEN_REIHE.map(k => `${groessenName(k)} (${DS4_GROESSENKATEGORIEN[k].bereich})`).join(' · ')}. Je Kategorie Unterschied ±2 auf den Angriff.</li>
        </ul>

        <h4 style="color:var(--accent-bright);margin-top:1rem">Erfahrungspunkte (S.88)</h4>
        <ul class="hint" style="margin:0.3rem 0 0 1.2rem">
            <li><strong>Gegner:</strong> EP-Summe aller Gegner <strong>geteilt durch die Anzahl der beteiligten Charaktere</strong>. Fünf Helden gegen 10 Goblins zu je 20 EP: jeder bekommt 40.</li>
            <li><strong>Quests:</strong> mindestens ein Viertel aller Gegner-EP für ein erreichtes Abenteuerziel.</li>
            <li><strong>Rollenspiel:</strong> bis zu Stufe × 2 EP je Situation.</li>
            <li><strong>Sonstiges:</strong> 5–25 EP für gute Ideen und überwundene Fallen, 1 EP je erforschtem Dungeonraum oder 10 gereisten Kilometern.</li>
        </ul>

        <h4 style="color:var(--accent-bright);margin-top:1rem">Optionale Regeln (S.45)</h4>
        <ul class="hint" style="margin:0.3rem 0 0 1.2rem">
            <li><strong>Slayende Würfel:</strong> Ein Immersieg bei Angriff oder Abwehr löst sofort einen weiteren Wurf aus (ohne Patzer-Risiko); gelingt er, kommt sein Ergebnis dazu, und ein erneuter Immersieg wiederholt das Ganze. Bei PW über 20 zählt nur ein Immersieg des ersten Würfels.</li>
            <li><strong>Slayerpunkte:</strong> 1 SP je Kampfrunde, in der man Schaden verursacht (Heiler auch fürs Heilen verletzter Kameraden), höchstens 3 gleichzeitig. Sie verfallen am Kampfende und bei Bewusstlosigkeit.</li>
            <li>Beide sind unter <strong>⚙️ Hausregeln</strong> einschaltbar. Das Regelwerk empfiehlt, Slayende Würfel nicht ohne Slayerpunkte zu verwenden.</li>
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

// Klick auf den dunklen Rand schließt das Modal — das erwarten die meisten,
// und bei der langen Anleitung muss man sonst erst zum ✕ hochscrollen.
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
        closeModal(e.target.id);
    }
});

// Esc schließt das oberste offene Modal.
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const offen = Array.from(document.querySelectorAll('.modal-overlay.active'));
    if (offen.length) closeModal(offen[offen.length - 1].id);
});

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
    renderGebietWahl();
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
    probe.addEventListener('change', renderGebietWahl);

    // Freie Wahl für die Handwerksprobe
    document.getElementById('f-hw-attr').innerHTML = Object.entries(DS4_ATTRIBUT_NAMES)
        .map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
    document.getElementById('f-hw-eig').innerHTML = Object.entries(DS4_EIGENSCHAFT_NAMES)
        .map(([k, n]) => `<option value="${k}"${k === 'geschick' ? ' selected' : ''}>${n}</option>`).join('');

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
