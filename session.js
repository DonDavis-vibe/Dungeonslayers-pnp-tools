// Dungeonslayers 4 — Sitzung des Spielleiters über einen Reload retten
//
// Kampf-Tracker und Karte leben sonst nur im Arbeitsspeicher: Ein versehentliches
// Neuladen mitten im Spiel würde Gegner, Initiative-Reihenfolge und aufgedeckte
// Kartenbereiche vernichten. Kleine Daten liegen im localStorage, das Kartenbild
// wegen seiner Größe in IndexedDB.

const SL_SITZUNG_KEY = 'ds4_sl_sitzung';
const KARTE_DB = 'ds4_karte';
const KARTE_STORE = 'bilder';

// --- IndexedDB für das Kartenbild -------------------------------------------

function karteDbOeffnen() {
    return new Promise((erfuellen, ablehnen) => {
        if (!window.indexedDB) { ablehnen(new Error('IndexedDB nicht verfügbar')); return; }
        const anfrage = indexedDB.open(KARTE_DB, 1);
        anfrage.onupgradeneeded = () => {
            const db = anfrage.result;
            if (!db.objectStoreNames.contains(KARTE_STORE)) db.createObjectStore(KARTE_STORE);
        };
        anfrage.onsuccess = () => erfuellen(anfrage.result);
        anfrage.onerror = () => ablehnen(anfrage.error);
    });
}

function karteBildSichern(dataUrl) {
    return karteDbOeffnen().then(db => new Promise((erfuellen, ablehnen) => {
        const t = db.transaction(KARTE_STORE, 'readwrite');
        t.objectStore(KARTE_STORE).put(dataUrl, 'aktuell');
        t.oncomplete = () => { db.close(); erfuellen(true); };
        t.onerror = () => { db.close(); ablehnen(t.error); };
    })).catch(fehler => {
        console.warn('Kartenbild konnte nicht gesichert werden:', fehler);
        return false;
    });
}

function karteBildLesen() {
    return karteDbOeffnen().then(db => new Promise((erfuellen) => {
        const t = db.transaction(KARTE_STORE, 'readonly');
        const anfrage = t.objectStore(KARTE_STORE).get('aktuell');
        anfrage.onsuccess = () => { db.close(); erfuellen(anfrage.result || null); };
        anfrage.onerror = () => { db.close(); erfuellen(null); };
    })).catch(() => null);
}

function karteBildVerwerfen() {
    return karteDbOeffnen().then(db => new Promise(erfuellen => {
        const t = db.transaction(KARTE_STORE, 'readwrite');
        t.objectStore(KARTE_STORE).delete('aktuell');
        t.oncomplete = () => { db.close(); erfuellen(true); };
        t.onerror = () => { db.close(); erfuellen(false); };
    })).catch(() => false);
}

// --- Kampf und Karte sichern ------------------------------------------------

let sitzungSpeicherTimer = null;

// Gebündelt speichern: Beim Ziehen einer Figur feuert das sonst im Sekundentakt.
function sitzungSichern() {
    if (!isGmMode) return;
    clearTimeout(sitzungSpeicherTimer);
    sitzungSpeicherTimer = setTimeout(sitzungJetztSichern, 600);
}

function sitzungJetztSichern() {
    if (!isGmMode) return;
    try {
        const daten = {
            gespeichertAm: Date.now(),
            raumCode: document.getElementById('gm-room-code') ? document.getElementById('gm-room-code').textContent : '',
            kampf: {
                aktiv: typeof combatActive !== 'undefined' ? combatActive : false,
                runde: typeof currentRound !== 'undefined' ? currentRound : 0,
                zugIndex: typeof turnIndex !== 'undefined' ? turnIndex : 0,
                // Spielerfiguren kommen beim Verbinden von selbst zurück
                teilnehmer: (typeof combatants !== 'undefined' ? combatants : []).filter(c => c.type === 'npc')
            },
            karte: (typeof karte !== 'undefined' && karte) ? karte.getState() : null,
            figurBilder: (typeof karte !== 'undefined' && karte) ? karte.getFigurBilder() : null
        };
        localStorage.setItem(SL_SITZUNG_KEY, JSON.stringify(daten));
    } catch (fehler) {
        // Bei vollem Speicher lieber ohne Sicherung weiterspielen als abstürzen
        console.warn('Sitzung konnte nicht gesichert werden:', fehler);
    }
}

function sitzungLesen() {
    try {
        const roh = localStorage.getItem(SL_SITZUNG_KEY);
        return roh ? JSON.parse(roh) : null;
    } catch (fehler) {
        return null;
    }
}

function sitzungVerwerfen() {
    try { localStorage.removeItem(SL_SITZUNG_KEY); } catch (e) { /* Speicher evtl. blockiert */ }
    karteBildVerwerfen();
}

// --- Wiederherstellen -------------------------------------------------------

// Wird beim Betreten des Dashboards aufgerufen. Fragt nach, statt einfach
// wiederherzustellen — eine alte Sitzung soll keine neue Runde überschreiben.
function sitzungAnbieten() {
    const daten = sitzungLesen();
    if (!daten) return;

    const nsc = (daten.kampf && daten.kampf.teilnehmer) ? daten.kampf.teilnehmer.length : 0;
    const figuren = (daten.karte && daten.karte.figuren) ? daten.karte.figuren.length : 0;
    if (!nsc && !figuren) return;

    const alter = Math.round((Date.now() - daten.gespeichertAm) / 60000);
    const teile = [];
    if (nsc) teile.push(`${nsc} Gegner im Kampf`);
    if (figuren) teile.push(`${figuren} Figuren auf der Karte`);

    const box = document.getElementById('gm-sitzung');
    if (!box) return;
    box.innerHTML = `<div class="sitzung-hinweis">
        <span>💾 Eine frühere Sitzung liegt vor (${escapeHtml(teile.join(', '))},
            vor ${alter < 1 ? 'weniger als einer Minute' : alter + ' Minuten'} gesichert).</span>
        <span style="margin-left:auto;display:flex;gap:0.3rem">
            <button class="btn btn-sm btn-primary" onclick="sitzungWiederherstellen()">Wiederherstellen</button>
            <button class="btn btn-sm btn-ghost" onclick="sitzungHinweisSchliessen(true)">Verwerfen</button>
        </span>
    </div>`;
}

// --- Als Datei speichern und laden ------------------------------------------
//
// Die automatische Sicherung rettet nur den Unfall. Für eine Kampagne über
// mehrere Abende braucht es eine Datei, die man ablegen und zurückholen kann.

// Sammelt alles, was zur Sitzung des Spielleiters gehört
function sitzungSammeln(mitBild) {
    const notizen = {};
    for (let i = 0; i < localStorage.length; i++) {
        const schluessel = localStorage.key(i);
        if (schluessel && (schluessel.startsWith('ds4_gmnote_') ||
                           schluessel === 'ds4_gm_notes' ||
                           schluessel.startsWith('ds4_color_'))) {
            notizen[schluessel] = localStorage.getItem(schluessel);
        }
    }

    const daten = {
        art: 'dungeonslayers-sl-sitzung',
        fassung: 1,
        gespeichertAm: new Date().toISOString(),
        notizen,
        kampf: {
            aktiv: typeof combatActive !== 'undefined' ? combatActive : false,
            runde: typeof currentRound !== 'undefined' ? currentRound : 0,
            zugIndex: typeof turnIndex !== 'undefined' ? turnIndex : 0,
            // Gegner samt Position, Lebenskraft und Initiative
            teilnehmer: (typeof combatants !== 'undefined' ? combatants : []).filter(c => c.type === 'npc'),
            // Spielerpositionen getrennt, damit sie auch ohne Verbindung erhalten bleiben
            spielerPlaetze: (typeof combatants !== 'undefined' ? combatants : [])
                .filter(c => c.type === 'player')
                .map(c => ({ name: c.name, initiative: c.initiative, lkCurrent: c.lkCurrent, lkMax: c.lkMax }))
        },
        karte: (typeof karte !== 'undefined' && karte) ? karte.getState() : null,
        figurBilder: (typeof karte !== 'undefined' && karte) ? karte.getFigurBilder() : null
    };

    if (!mitBild) return Promise.resolve(daten);
    return karteBildLesen().then(bild => {
        if (bild) daten.kartenBild = bild;
        return daten;
    });
}

function sitzungExportieren() {
    const mitBild = confirm(
        'Kartenbild mitspeichern?\n\n' +
        'OK  = mit Bild (größere Datei, dafür vollständig)\n' +
        'Abbrechen = ohne Bild (nur Figuren, Nebel und Notizen)');

    sitzungSammeln(mitBild).then(daten => {
        const text = JSON.stringify(daten, null, 2);
        const blob = new Blob([text], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        const datum = new Date().toISOString().slice(0, 10);
        a.download = `dungeonslayers-sitzung-${datum}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);

        const mb = (text.length / 1024 / 1024).toFixed(1).replace('.', ',');
        addGmLog('System', `Sitzung gespeichert (${mb} MB${mitBild ? ', mit Kartenbild' : ', ohne Kartenbild'}).`, 'erfolg');
    });
}

function sitzungImportieren(ereignis) {
    const datei = ereignis.target.files[0];
    ereignis.target.value = '';
    if (!datei) return;

    const leser = new FileReader();
    leser.onload = e => {
        let daten;
        try {
            daten = JSON.parse(e.target.result);
        } catch (fehler) {
            alert('Die Datei konnte nicht gelesen werden.');
            return;
        }
        if (daten.art !== 'dungeonslayers-sl-sitzung') {
            alert('Das ist keine Spielleiter-Sitzung.\n\nCharakterbögen lädt man in der Spieleransicht über „Laden".');
            return;
        }
        if (!confirm('Aktuelle Sitzung durch die geladene ersetzen?')) return;
        sitzungAnwenden(daten);
    };
    leser.readAsText(datei);
}

function sitzungAnwenden(daten) {
    // Notizen und Spielerfarben zurückschreiben
    Object.entries(daten.notizen || {}).forEach(([schluessel, wert]) => {
        try { localStorage.setItem(schluessel, wert); } catch (e) { /* Speicher evtl. voll */ }
    });
    const notizfeld = document.getElementById('gm-general-notes');
    if (notizfeld) notizfeld.value = localStorage.getItem('ds4_gm_notes') || '';

    // Kampf
    if (daten.kampf && typeof combatants !== 'undefined') {
        combatants = (daten.kampf.teilnehmer || []).slice();
        combatActive = !!daten.kampf.aktiv;
        currentRound = daten.kampf.runde || 0;
        turnIndex = Math.min(daten.kampf.zugIndex || 0, Math.max(0, combatants.length - 1));
        combatants.forEach(c => {
            const nummer = parseInt(String(c.id).replace('npc-', ''), 10);
            if (Number.isFinite(nummer) && nummer > npcCounter) npcCounter = nummer;
        });
        renderCombat();
    }

    // Karte samt Figurenpositionen, Nebel und Markierungen
    if (daten.karte && typeof karte !== 'undefined' && karte) {
        karte.applyState(daten.karte, daten.kartenBild || undefined);
        Object.entries(daten.figurBilder || {}).forEach(([id, url]) => karte.setFigurBild(id, url));
        if (daten.kartenBild) {
            karteBildDatenUrl = daten.kartenBild;
            karteBildSichern(daten.kartenBild);
            setTimeout(() => karte.einpassen(), 60);
        }
    }

    renderGmDashboard();
    sitzungHinweisSchliessen(false);

    const fehlendesBild = daten.karte && !daten.kartenBild;
    addGmLog('System', 'Sitzung geladen.' +
        (fehlendesBild ? ' Das Kartenbild war nicht enthalten und muss neu geladen werden.' : ''), 'erfolg');

    const status = document.getElementById('map-status');
    if (status && daten.karte) {
        status.textContent = daten.kartenBild
            ? 'Sitzung geladen — über „Karte laden" erneut an verbundene Spieler senden.'
            : 'Figuren und Nebel geladen; das Kartenbild fehlt und muss neu gewählt werden.';
    }
}

function sitzungHinweisSchliessen(auchVerwerfen) {
    const box = document.getElementById('gm-sitzung');
    if (box) box.innerHTML = '';
    if (auchVerwerfen) sitzungVerwerfen();
}

function sitzungWiederherstellen() {
    const daten = sitzungLesen();
    if (!daten) return;

    // Kampf
    if (daten.kampf && typeof combatants !== 'undefined') {
        combatants = (daten.kampf.teilnehmer || []).slice();
        combatActive = !!daten.kampf.aktiv;
        currentRound = daten.kampf.runde || 0;
        turnIndex = Math.min(daten.kampf.zugIndex || 0, Math.max(0, combatants.length - 1));
        // Höchste vergebene Nummer merken, damit neue Gegner eindeutig bleiben
        combatants.forEach(c => {
            const nummer = parseInt(String(c.id).replace('npc-', ''), 10);
            if (Number.isFinite(nummer) && nummer > npcCounter) npcCounter = nummer;
        });
        renderCombat();
    }

    // Karte
    if (daten.karte && typeof karte !== 'undefined' && karte) {
        karteBildLesen().then(bild => {
            karte.applyState(daten.karte, bild || undefined);
            Object.entries(daten.figurBilder || {}).forEach(([id, url]) => karte.setFigurBild(id, url));
            if (bild) {
                karteBildDatenUrl = bild;
                setTimeout(() => karte.einpassen(), 60);
            }
            const status = document.getElementById('map-status');
            if (status) {
                status.textContent = bild
                    ? 'Karte wiederhergestellt. Über „Karte laden" erneut an die Spieler senden, sobald sie verbunden sind.'
                    : 'Figuren wiederhergestellt — das Kartenbild fehlt und muss neu geladen werden.';
            }
        });
    }

    sitzungHinweisSchliessen(false);
    addGmLog('System', 'Frühere Sitzung wiederhergestellt.', 'erfolg');
}
