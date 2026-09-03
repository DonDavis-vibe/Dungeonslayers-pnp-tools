// Dungeonslayers 4 — Charaktererschaffung (Regelwerk S.3-7)

const WIZARD_STEPS = [
    { id: 'volk', label: '1. Volk' },
    { id: 'klasse', label: '2. Klasse' },
    { id: 'attribute', label: '3. Attribute' },
    { id: 'eigenschaften', label: '4. Eigenschaften' },
    { id: 'boni', label: '5. Boni' },
    { id: 'ausruestung', label: '6. Ausrüstung' },
    { id: 'fertig', label: '7. Feinschliff' }
];

const ATTRIBUT_BUDGET = 20;
const ATTRIBUT_MAX = 8;
const EIGENSCHAFT_BUDGET = 8;
const EIGENSCHAFT_MAX_START = 4;

let wizardStep = 0;
let wizardDraft = null;

function openWizard() {
    wizardDraft = {
        volk: appData.volk || '',
        klasse: appData.klasse || '',
        subtype: appData.subtype || '',
        attribute: Object.assign({ koerper: 0, agilitaet: 0, geist: 0 }, appData.attribute),
        eigenschaften: Object.assign(
            { staerke: 0, haerte: 0, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
            appData.eigenschaften
        ),
        volksbonus: appData.volksbonus || '',
        klassenbonus: appData.klassenbonus || '',
        equipment: Object.assign({ melee: '', ranged: '', koerper: '', helm: '', schienen: '', schild: '' }, appData.equipment),
        name: appData.name || '',
        spieler: appData.spieler || ''
    };
    wizardStep = 0;
    renderWizard();
    openModal('wizard-modal');
}

function closeWizard() { closeModal('wizard-modal'); }

function wizardNext() {
    if (wizardStep < WIZARD_STEPS.length - 1) {
        if (!wizardStepValid(wizardStep)) return;
        wizardStep++;
        renderWizard();
    } else {
        applyWizard();
    }
}

function wizardBack() {
    if (wizardStep > 0) { wizardStep--; renderWizard(); }
}

// --- Validierung ------------------------------------------------------------

function attrSum() { return Object.values(wizardDraft.attribute).reduce((a, b) => a + b, 0); }
function eigSum() { return Object.values(wizardDraft.eigenschaften).reduce((a, b) => a + b, 0); }

function wizardStepValid(step) {
    const id = WIZARD_STEPS[step].id;
    switch (id) {
        case 'volk': return !!wizardDraft.volk;
        case 'klasse':
            if (!wizardDraft.klasse) return false;
            if (wizardDraft.klasse === 'zauberwirker' && !wizardDraft.subtype) return false;
            return true;
        case 'attribute': return attrSum() === ATTRIBUT_BUDGET;
        case 'eigenschaften': return eigSum() === EIGENSCHAFT_BUDGET;
        case 'boni': return !!wizardDraft.volksbonus && !!wizardDraft.klassenbonus;
        default: return true;
    }
}

function wizardValidationHint(step) {
    const id = WIZARD_STEPS[step].id;
    switch (id) {
        case 'volk': return wizardDraft.volk ? '' : 'Bitte ein Volk wählen.';
        case 'klasse':
            if (!wizardDraft.klasse) return 'Bitte eine Klasse wählen.';
            if (wizardDraft.klasse === 'zauberwirker' && !wizardDraft.subtype) return 'Bitte einen Zauberwirker-Typ wählen.';
            return '';
        case 'attribute': {
            const diff = ATTRIBUT_BUDGET - attrSum();
            if (diff > 0) return `Noch ${diff} Attributspunkt${diff === 1 ? '' : 'e'} zu verteilen.`;
            if (diff < 0) return `${-diff} Punkt${diff === -1 ? '' : 'e'} zu viel verteilt.`;
            return '';
        }
        case 'eigenschaften': {
            const diff = EIGENSCHAFT_BUDGET - eigSum();
            if (diff > 0) return `Noch ${diff} Eigenschaftspunkt${diff === 1 ? '' : 'e'} zu verteilen.`;
            if (diff < 0) return `${-diff} Punkt${diff === -1 ? '' : 'e'} zu viel verteilt.`;
            return '';
        }
        case 'boni': {
            if (!wizardDraft.volksbonus) return 'Bitte den Volksbonus wählen.';
            if (!wizardDraft.klassenbonus) return 'Bitte den Klassenbonus wählen.';
            return '';
        }
        default: return '';
    }
}

// --- Rendering --------------------------------------------------------------

function renderWizard() {
    document.getElementById('wizard-steps').innerHTML = WIZARD_STEPS.map((s, i) =>
        `<span class="wizard-step ${i === wizardStep ? 'active' : (i < wizardStep ? 'done' : '')}">${s.label}</span>`
    ).join('');

    const body = document.getElementById('wizard-body');
    body.innerHTML = wizardStepHtml(WIZARD_STEPS[wizardStep].id);
    wireWizardStep(WIZARD_STEPS[wizardStep].id);

    document.getElementById('wizard-back').style.visibility = wizardStep === 0 ? 'hidden' : 'visible';
    const nextBtn = document.getElementById('wizard-next');
    nextBtn.textContent = wizardStep === WIZARD_STEPS.length - 1 ? '✓ Charakter übernehmen' : 'Weiter →';
    nextBtn.disabled = !wizardStepValid(wizardStep);
    nextBtn.style.opacity = nextBtn.disabled ? '0.45' : '1';
    document.getElementById('wizard-validation').textContent = wizardValidationHint(wizardStep);
    if (typeof uebersetzeDOM === 'function') {
        uebersetzeDOM(document.getElementById('wizard-modal') || document.body);
    }
}

function wizardStepHtml(id) {
    switch (id) {
        case 'volk':
            return `<p class="hint" style="margin-bottom:0.8rem">Das Volk bestimmt einen Eigenschaftsbonus und die Volksfähigkeiten.</p>
                <div class="choice-grid">` +
                Object.entries(DS4_RACES).map(([key, race]) => `
                    <div class="choice-card ${wizardDraft.volk === key ? 'selected' : ''}" data-choice="volk" data-value="${key}">
                        <h4>${t(race.name)}</h4>
                        <p>${t('Bonus:')} ${race.bonusOptions.map(b => t(DS4_EIGENSCHAFT_NAMES[b])).join(' / ')} +1</p>
                        <ul>${race.traits.map(tr => `<li>${escapeHtml(t(tr))}</li>`).join('')}</ul>
                    </div>`).join('') + '</div>';

        case 'klasse': {
            let html = `<p class="hint" style="margin-bottom:0.8rem">Die Klasse bestimmt Bonus, Rüstungszugang und Steigerungskosten.</p>
                <div class="choice-grid">` +
                Object.entries(DS4_CLASSES).map(([key, cls]) => `
                    <div class="choice-card ${wizardDraft.klasse === key ? 'selected' : ''}" data-choice="klasse" data-value="${key}">
                        <h4>${t(cls.name)}</h4>
                        <p>${escapeHtml(t(cls.role))}</p>
                        <p style="margin-top:0.3rem">${t('Bonus:')} ${cls.bonusOptions.map(b => t(DS4_EIGENSCHAFT_NAMES[b])).join(' / ')} +1</p>
                    </div>`).join('') + '</div>';

            if (wizardDraft.klasse === 'zauberwirker') {
                html += `<h4 style="margin:1rem 0 0.5rem;color:var(--accent)">${t('Zauberwirker-Typ')}</h4>
                    <div class="choice-grid">` +
                    Object.entries(DS4_CLASSES.zauberwirker.subtypes).map(([key, sub]) => `
                        <div class="choice-card ${wizardDraft.subtype === key ? 'selected' : ''}" data-choice="subtype" data-value="${key}">
                            <h4>${t(sub.name)}</h4>
                            <p>${escapeHtml(t(sub.role))}</p>
                        </div>`).join('') + '</div>';
            }
            return html;
        }

        case 'attribute': {
            const sum = attrSum();
            const rest = ATTRIBUT_BUDGET - sum;
            return `<p class="hint" style="margin-bottom:0.8rem">
                    ${tp('Verteile <strong>{n} Punkte</strong> auf die drei Attribute. Kein Attribut darf über <strong>{max}</strong> liegen.', { n: ATTRIBUT_BUDGET, max: ATTRIBUT_MAX })}
                </p>
                <div class="budget ${rest === 0 ? 'done' : (rest < 0 ? 'over' : '')}" style="margin-bottom:0.9rem">
                    ${t('Verteilt:')} <strong>${sum}</strong> / ${ATTRIBUT_BUDGET} &nbsp;·&nbsp; ${t('Übrig:')} <strong>${rest}</strong>
                </div>
                <div class="grid-3">` +
                Object.entries(DS4_ATTRIBUT_NAMES).map(([key, name]) => {
                    const v = wizardDraft.attribute[key];
                    return `<div class="attr-block">
                        <div class="attr-head">
                            <span class="attr-name">${t(name)}</span>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:0.5rem">
                            <span class="stepper"><button data-wstep="attribute" data-key="${key}" data-delta="-1" ${v <= 0 ? 'disabled' : ''}>−</button></span>
                            <span class="attr-value">${v}</span>
                            <span class="stepper"><button data-wstep="attribute" data-key="${key}" data-delta="1" ${(v >= ATTRIBUT_MAX || rest <= 0) ? 'disabled' : ''}>+</button></span>
                        </div>
                        <div class="hint" style="text-align:center;margin-top:0.4rem">
                            ${DS4_EIGENSCHAFTEN_BY_ATTRIBUT[key].map(e => t(DS4_EIGENSCHAFT_NAMES[e])).join(', ')}
                        </div>
                    </div>`;
                }).join('') + '</div>';
        }

        case 'eigenschaften': {
            const sum = eigSum();
            const rest = EIGENSCHAFT_BUDGET - sum;
            return `<p class="hint" style="margin-bottom:0.8rem">
                    ${tp('Verteile <strong>{n} Punkte</strong> auf die sechs Eigenschaften. Höchstens <strong>{max}</strong> je Eigenschaft — 0 ist erlaubt. Volks- und Klassenbonus kommen im nächsten Schritt obendrauf.', { n: EIGENSCHAFT_BUDGET, max: EIGENSCHAFT_MAX_START })}
                </p>
                <div class="budget ${rest === 0 ? 'done' : (rest < 0 ? 'over' : '')}" style="margin-bottom:0.9rem">
                    ${t('Verteilt:')} <strong>${sum}</strong> / ${EIGENSCHAFT_BUDGET} &nbsp;·&nbsp; ${t('Übrig:')} <strong>${rest}</strong>
                </div>
                <div class="grid-3">` +
                Object.entries(DS4_EIGENSCHAFTEN_BY_ATTRIBUT).map(([attrKey, eigKeys]) => `
                    <div class="attr-block">
                        <div class="attr-head"><span class="attr-name">${t(DS4_ATTRIBUT_NAMES[attrKey])}</span>
                            <span class="hint">${wizardDraft.attribute[attrKey]}</span></div>
                        ${eigKeys.map(eigKey => {
                            const v = wizardDraft.eigenschaften[eigKey];
                            return `<div class="eig-row">
                                <span class="eig-name">${t(DS4_EIGENSCHAFT_NAMES[eigKey])}<span class="eig-abbr">${DS4_EIGENSCHAFT_ABBR[eigKey]}</span></span>
                                <span class="stepper"><button data-wstep="eigenschaften" data-key="${eigKey}" data-delta="-1" ${v <= 0 ? 'disabled' : ''}>−</button></span>
                                <span class="eig-value">${v}</span>
                                <span class="stepper"><button data-wstep="eigenschaften" data-key="${eigKey}" data-delta="1" ${(v >= EIGENSCHAFT_MAX_START || rest <= 0) ? 'disabled' : ''}>+</button></span>
                            </div>`;
                        }).join('')}
                    </div>`).join('') + '</div>';
        }

        case 'boni': {
            const race = DS4_RACES[wizardDraft.volk];
            const cls = DS4_CLASSES[wizardDraft.klasse];
            const pill = (group, key, selected) =>
                `<span class="radio-pill ${selected ? 'selected' : ''}" data-choice="${group}" data-value="${key}">
                    ${t(DS4_EIGENSCHAFT_NAMES[key])} +1 <span class="eig-abbr">(${wizardDraft.eigenschaften[key]} → ${wizardDraft.eigenschaften[key] + 1})</span>
                </span>`;

            return `<p class="hint" style="margin-bottom:0.8rem">
                    ${t('Jetzt kommen Volks- und Klassenbonus obendrauf — hier dürfen Eigenschaften erstmals über 4 steigen.')}
                </p>
                <h4 style="color:var(--accent);margin-bottom:0.4rem">${t('Volksbonus')} (${t(race.name)})</h4>
                <div class="radio-row">${race.bonusOptions.map(k => pill('volksbonus', k, wizardDraft.volksbonus === k)).join('')}</div>
                <h4 style="color:var(--accent);margin:1rem 0 0.4rem">${t('Klassenbonus')} (${t(cls.name)})</h4>
                <div class="radio-row">${cls.bonusOptions.map(k => pill('klassenbonus', k, wizardDraft.klassenbonus === k)).join('')}</div>`;
        }

        case 'ausruestung': {
            const weaponOpt = (w, current) =>
                `<option value="${escapeHtml(w.name)}" ${current === w.name ? 'selected' : ''}>${escapeHtml(w.name)} — WB ${w.wb}${w.twoHanded ? ', 2H' : ''} — ${w.price}</option>`;
            const armorOpt = (a, current) =>
                `<option value="${escapeHtml(a.name)}" ${current === a.name ? 'selected' : ''}>${escapeHtml(a.name)} — PA ${a.pa} — ${a.price}</option>`;

            return `<p class="hint" style="margin-bottom:0.8rem">
                    Jeder Held startet mit einfacher Kleidung, Feuerstein &amp; Zunder, Wasserschlauch, Decke, Rucksack,
                    2× Heilkraut und <strong>10 Goldmünzen</strong> für Ausrüstung.
                </p>
                <div class="grid-2">
                    <div class="field"><label>Nahkampfwaffe</label>
                        <select data-wequip="melee"><option value="">keine</option>
                        ${DS4_WEAPONS.filter(w => w.type === 'melee' || w.type === 'both').map(w => weaponOpt(w, wizardDraft.equipment.melee)).join('')}</select></div>
                    <div class="field"><label>Fernkampfwaffe</label>
                        <select data-wequip="ranged"><option value="">keine</option>
                        ${DS4_WEAPONS.filter(w => w.type === 'ranged' || w.type === 'both').map(w => weaponOpt(w, wizardDraft.equipment.ranged)).join('')}</select></div>
                    <div class="field"><label>Körperrüstung</label>
                        <select data-wequip="koerper"><option value="">keine</option>
                        ${DS4_ARMOR.filter(a => a.slot === 'koerper').map(a => armorOpt(a, wizardDraft.equipment.koerper)).join('')}</select></div>
                    <div class="field"><label>Schild</label>
                        <select data-wequip="schild"><option value="">keins</option>
                        ${DS4_ARMOR.filter(a => a.slot === 'schild').map(a => armorOpt(a, wizardDraft.equipment.schild)).join('')}</select></div>
                </div>
                <div id="wizard-equip-warn" style="margin-top:0.8rem"></div>`;
        }

        case 'fertig': {
            const preview = computeDerived({
                volk: wizardDraft.volk,
                klasse: wizardDraft.klasse,
                attribute: wizardDraft.attribute,
                eigenschaften: wizardEffectiveEigenschaften(),
                equipment: wizardDraft.equipment,
                zauberZb: 0
            });
            const race = DS4_RACES[wizardDraft.volk];
            const cls = DS4_CLASSES[wizardDraft.klasse];
            const startTp = wizardDraft.volk === 'mensch' ? 2 : 1;

            return `<div class="grid-2" style="margin-bottom:1rem">
                    <div class="field"><label>${t('Name des Helden')}</label><input type="text" data-wfield="name" value="${escapeHtml(wizardDraft.name)}"></div>
                    <div class="field"><label>${t('Spieler')}</label><input type="text" data-wfield="spieler" value="${escapeHtml(wizardDraft.spieler)}"></div>
                </div>
                <div class="panel" style="background:rgba(0,0,0,0.25)">
                    <div class="panel-head"><h3>${t('Übersicht')}</h3>
                        <div class="panel-actions"><span class="tag">${t('Stufe 1')} · 0 ${t('EP')} · ${startTp} ${t('TP')}</span></div>
                    </div>
                    <div class="panel-body">
                        <p style="margin-bottom:0.7rem">
                            <strong style="color:var(--accent-bright)">${escapeHtml(wizardDraft.name || t('Namenloser Held'))}</strong> —
                            ${t(race.name)} ${cls.isCaster ? t(cls.subtypes[wizardDraft.subtype].name) : t(cls.name)}
                        </p>
                        <div class="kampfwerte">
                            <div class="kw-card"><div class="kw-label">Lebenskraft</div><div class="kw-value">${preview.lebenskraft}</div></div>
                            <div class="kw-card"><div class="kw-label">Abwehr</div><div class="kw-value">${preview.abwehr}</div></div>
                            <div class="kw-card"><div class="kw-label">Initiative</div><div class="kw-value">${preview.initiative}</div></div>
                            <div class="kw-card"><div class="kw-label">Laufen</div><div class="kw-value">${String(preview.laufen).replace('.', ',')}m</div></div>
                            <div class="kw-card"><div class="kw-label">Schlagen</div><div class="kw-value">${preview.schlagen}</div></div>
                            <div class="kw-card"><div class="kw-label">Schießen</div><div class="kw-value">${preview.schiessen}</div></div>
                            ${cls.isCaster ? `
                            <div class="kw-card"><div class="kw-label">Zaubern</div><div class="kw-value">${preview.zaubern}</div></div>
                            <div class="kw-card"><div class="kw-label">Zielzauber</div><div class="kw-value">${preview.zielzauber}</div></div>` : ''}
                        </div>
                        <p class="hint" style="margin-top:0.8rem">
                            ${Object.entries(wizardEffectiveEigenschaften())
                                .map(([k, v]) => `${DS4_EIGENSCHAFT_ABBR[k]} ${v}`).join(' · ')}
                        </p>
                        ${cls.isCaster ? '<p class="hint-rule" style="margin-top:0.7rem">Als Zauberwirker startest du mit einem Zauberspruch der Stufe 1 — trage ihn nach dem Übernehmen im Zauber-Panel ein.</p>' : ''}
                    </div>
                </div>`;
        }
        default: return '';
    }
}

function wizardEffectiveEigenschaften() {
    const out = Object.assign({}, wizardDraft.eigenschaften);
    if (wizardDraft.volksbonus) out[wizardDraft.volksbonus] += 1;
    if (wizardDraft.klassenbonus) out[wizardDraft.klassenbonus] += 1;
    return out;
}

function wireWizardStep(id) {
    const body = document.getElementById('wizard-body');

    body.querySelectorAll('[data-choice]').forEach(el => {
        el.addEventListener('click', () => {
            const group = el.dataset.choice;
            wizardDraft[group] = el.dataset.value;
            // Klassenwechsel macht eine zuvor getroffene Untertyp-/Bonuswahl ungültig
            if (group === 'klasse') {
                wizardDraft.subtype = '';
                wizardDraft.klassenbonus = '';
            }
            if (group === 'volk') wizardDraft.volksbonus = '';
            renderWizard();
        });
    });

    body.querySelectorAll('button[data-wstep]').forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.dataset.wstep;
            const key = btn.dataset.key;
            const delta = parseInt(btn.dataset.delta, 10);
            const max = group === 'attribute' ? ATTRIBUT_MAX : EIGENSCHAFT_MAX_START;
            const budget = group === 'attribute' ? ATTRIBUT_BUDGET : EIGENSCHAFT_BUDGET;
            const sum = group === 'attribute' ? attrSum() : eigSum();

            const next = wizardDraft[group][key] + delta;
            if (next < 0 || next > max) return;
            if (delta > 0 && sum >= budget) return;
            wizardDraft[group][key] = next;
            renderWizard();
        });
    });

    body.querySelectorAll('[data-wequip]').forEach(sel => {
        sel.addEventListener('change', () => {
            wizardDraft.equipment[sel.dataset.wequip] = sel.value;
            renderWizardEquipWarnings();
        });
    });

    body.querySelectorAll('[data-wfield]').forEach(input => {
        input.addEventListener('input', () => { wizardDraft[input.dataset.wfield] = input.value; });
    });

    if (id === 'ausruestung') renderWizardEquipWarnings();
}

function renderWizardEquipWarnings() {
    const box = document.getElementById('wizard-equip-warn');
    if (!box) return;
    const warnings = [];
    const race = DS4_RACES[wizardDraft.volk];
    const cls = DS4_CLASSES[wizardDraft.klasse];
    const rules = cls.isCaster ? (cls.subtypes[wizardDraft.subtype] || {}).armor : cls.armor;

    const bodyArmorType = {
        'Robe': 'stoff', 'Robe (runenbestickt)': 'stoff', 'Lederpanzer': 'leder',
        'Kettenpanzer': 'kette', 'Plattenpanzer': 'platte'
    };
    const bodyArmor = wizardDraft.equipment.koerper;
    if (rules && bodyArmor && rules[bodyArmorType[bodyArmor]] === false) {
        warnings.push(`<span class="tag tag-warn">${escapeHtml(bodyArmor)} ist für diese Klasse nicht erlaubt</span>`);
    }

    ['melee', 'ranged'].forEach(slot => {
        const name = wizardDraft.equipment[slot];
        if (name && race.weaponBans.includes(name)) {
            warnings.push(`<span class="tag tag-warn">${escapeHtml(name)}: für Zwerge zu unhandlich</span>`);
        }
    });

    const melee = findWeapon(wizardDraft.equipment.melee);
    const ranged = findWeapon(wizardDraft.equipment.ranged);
    if (wizardDraft.equipment.schild && ((melee && melee.twoHanded) || (ranged && ranged.twoHanded))) {
        warnings.push('<span class="tag tag-warn">Schild ist mit einer Zweihandwaffe nicht nutzbar</span>');
    }

    box.innerHTML = warnings.join(' ');
}

// --- Übernahme --------------------------------------------------------------

function applyWizard() {
    // Vollständig von einem leeren Bogen ausgehen. Vorher blieben Talente,
    // Zauber und Inventar des alten Charakters stehen und tauchten beim neuen
    // wieder auf. Nur Dinge, die nicht zum Charakter gehören, werden übernommen.
    const behalten = {
        portrait: appData.portrait || '',
        log: appData.log || []
    };
    appData = Object.assign(blankCharacter(), behalten);

    appData.volk = wizardDraft.volk;
    appData.klasse = wizardDraft.klasse;
    appData.subtype = wizardDraft.subtype;
    appData.attribute = Object.assign({}, wizardDraft.attribute);
    appData.eigenschaften = Object.assign({}, wizardDraft.eigenschaften);
    appData.volksbonus = wizardDraft.volksbonus;
    appData.klassenbonus = wizardDraft.klassenbonus;
    appData.equipment = Object.assign({}, wizardDraft.equipment);
    appData.name = wizardDraft.name;
    appData.spieler = wizardDraft.spieler;
    appData.tp = wizardDraft.volk === 'mensch' ? 2 : 1;

    const derived = computeDerived(charForRules());
    appData.lkCurrent = derived.lebenskraft;

    closeWizard();
    renderAll();
    scheduleSave();
    syncMultiplayerState();
    addLog(`Charakter erschaffen: ${characterName()} (${DS4_RACES[appData.volk].name})`, 'erfolg');
}
