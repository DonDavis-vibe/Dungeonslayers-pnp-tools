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

// Jede Karte legt ihr Bild unter ihrer eigenen ID ab. Der Default 'aktuell'
// hält die Abwärtskompatibilität zu Sitzungen von vor der Mehrkarten-Funktion.
function karteBildSichern(dataUrl, schluessel = 'aktuell') {
    return karteDbOeffnen().then(db => new Promise((erfuellen, ablehnen) => {
        const t = db.transaction(KARTE_STORE, 'readwrite');
        t.objectStore(KARTE_STORE).put(dataUrl, schluessel);
        t.oncomplete = () => { db.close(); erfuellen(true); };
        t.onerror = () => { db.close(); ablehnen(t.error); };
    })).catch(fehler => {
        console.warn('Kartenbild konnte nicht gesichert werden:', fehler);
        return false;
    });
}

function karteBildLesen(schluessel = 'aktuell') {
    return karteDbOeffnen().then(db => new Promise((erfuellen) => {
        const t = db.transaction(KARTE_STORE, 'readonly');
        const anfrage = t.objectStore(KARTE_STORE).get(schluessel);
        anfrage.onsuccess = () => { db.close(); erfuellen(anfrage.result || null); };
        anfrage.onerror = () => { db.close(); erfuellen(null); };
    })).catch(() => null);
}

function karteBildVerwerfen(schluessel = 'aktuell') {
    return karteDbOeffnen().then(db => new Promise(erfuellen => {
        const t = db.transaction(KARTE_STORE, 'readwrite');
        t.objectStore(KARTE_STORE).delete(schluessel);
        t.oncomplete = () => { db.close(); erfuellen(true); };
        t.onerror = () => { db.close(); erfuellen(false); };
    })).catch(() => false);
}

function karteBildAllesVerwerfen() {
    return karteDbOeffnen().then(db => new Promise(erfuellen => {
        const t = db.transaction(KARTE_STORE, 'readwrite');
        t.objectStore(KARTE_STORE).clear();
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
        if (typeof karteAktuellenStandSpeichern === 'function') karteAktuellenStandSpeichern();
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
            // Bilder liegen NICHT hier drin (localStorage-Quota) — sie stehen je
            // Karten-ID in IndexedDB.
            karten: (typeof karten !== 'undefined' ? karten : []).map(k => ({
                id: k.id, name: k.name, zustand: k.zustand, figurBilder: k.figurBilder || {}
            })),
            aktiveKarteId: typeof aktiveKarteId !== 'undefined' ? aktiveKarteId : null,
            kartenZuweisung: typeof kartenZuweisung !== 'undefined' ? kartenZuweisung : {}
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
    karteBildAllesVerwerfen();
}

// Karteneinträge aus gespeicherten Daten normalisieren — neue Sitzungen tragen
// `karten` als Array, alte nur ein einzelnes `karte`-Objekt.
function kartenAusDaten(daten) {
    if (Array.isArray(daten.karten)) return daten.karten.map(k => Object.assign({}, k));
    if (daten.karte) {
        return [{
            id: 'karte:' + (typeof uid === 'function' ? uid() : 'legacy'),
            name: 'Karte 1',
            zustand: daten.karte,
            figurBilder: daten.figurBilder || {},
            bild: daten.kartenBild || null,   // nur bei Datei-Import vorhanden
            _legacyBild: true
        }];
    }
    return [];
}

// --- Wiederherstellen -------------------------------------------------------

// Wird beim Betreten des Dashboards aufgerufen. Fragt nach, statt einfach
// wiederherzustellen — eine alte Sitzung soll keine neue Runde überschreiben.
function sitzungAnbieten() {
    const daten = sitzungLesen();
    if (!daten) return;

    const nsc = (daten.kampf && daten.kampf.teilnehmer) ? daten.kampf.teilnehmer.length : 0;
    const figuren = kartenAusDaten(daten).reduce((s, k) =>
        s + ((k.zustand && Array.isArray(k.zustand.figuren)) ? k.zustand.figuren.length : 0), 0);
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

    if (typeof karteAktuellenStandSpeichern === 'function') karteAktuellenStandSpeichern();

    const daten = {
        art: 'dungeonslayers-sl-sitzung',
        fassung: 2,
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
        karten: (typeof karten !== 'undefined' ? karten : []).map(k => {
            const e = { id: k.id, name: k.name, zustand: k.zustand, figurBilder: k.figurBilder || {} };
            if (mitBild && k.bild) e.bild = k.bild;   // Bilder liegen im RAM je Karte
            return e;
        }),
        aktiveKarteId: typeof aktiveKarteId !== 'undefined' ? aktiveKarteId : null,
        kartenZuweisung: typeof kartenZuweisung !== 'undefined' ? kartenZuweisung : {}
    };

    return Promise.resolve(daten);
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
        if (typeof currentCombatantId !== 'undefined') {
            currentCombatantId = combatActive && combatants[turnIndex] ? combatants[turnIndex].id : null;
        }
        if (typeof lastTickedRound !== 'undefined') lastTickedRound = currentRound;
        combatants.forEach(c => {
            const nummer = parseInt(String(c.id).replace('npc-', ''), 10);
            if (Number.isFinite(nummer) && nummer > npcCounter) npcCounter = nummer;
        });
        renderCombat();
    }

    // Karten samt Figurenpositionen, Nebel und Markierungen (Bilder stecken in der Datei)
    kartenUebernehmen(daten, false);

    renderGmDashboard();
    sitzungHinweisSchliessen(false);

    const kn = kartenAusDaten(daten);
    const ohneBild = kn.length && !kn.some(k => k.bild);
    addGmLog('System', 'Sitzung geladen.' +
        (ohneBild ? ' Kartenbild(er) waren nicht enthalten und müssen neu geladen werden.' : ''), 'erfolg');

    const status = document.getElementById('map-status');
    if (status && kn.length) {
        status.textContent = ohneBild
            ? 'Figuren und Nebel geladen; Kartenbild(er) fehlen und müssen neu gewählt werden.'
            : 'Sitzung geladen — über „📤 Senden" erneut an verbundene Spieler schicken.';
    }
}

// Karteneinträge aus geladenen Daten in die Laufzeit übernehmen. `bilderLaden`
// steuert, ob die Bilder aus IndexedDB nachgeladen werden (Sitzungswiederher-
// stellung) oder schon in den Daten stecken (Datei-Import).
function kartenUebernehmen(daten, bilderLaden) {
    if (typeof karte === 'undefined' || !karte) return;
    const roh = kartenAusDaten(daten);
    if (!roh.length) return;

    const fertig = () => {
        karten = roh.map(k => ({
            id: k.id, name: k.name,
            zustand: k.zustand || { raster: {}, figuren: [], formen: [], nebel: { aktiv: false, aufgedeckt: [], entwurf: [] } },
            bild: k.bild || null,
            figurBilder: k.figurBilder || {}
        }));
        aktiveKarteId = (daten.aktiveKarteId && karten.find(k => k.id === daten.aktiveKarteId))
            ? daten.aktiveKarteId : (karten[0] && karten[0].id) || null;
        kartenZuweisung = daten.kartenZuweisung || {};

        const aktiv = karten.find(k => k.id === aktiveKarteId);
        if (aktiv) {
            karte.applyState(aktiv.zustand, aktiv.bild || undefined);
            Object.entries(aktiv.figurBilder || {}).forEach(([id, url]) => karte.setFigurBild(id, url));
            if (aktiv.bild) { karteBildDatenUrl = aktiv.bild; setTimeout(() => karte.einpassen(), 60); }
            else karteBildDatenUrl = null;
        }

        // Bilder dauerhaft je Karten-ID sichern; Legacy-Bild von 'aktuell' umziehen
        karten.forEach(k => { if (k.bild) karteBildSichern(k.bild, k.id); });
        roh.forEach(k => { if (k._legacyBild) karteBildVerwerfen('aktuell'); });

        if (typeof renderKartenListe === 'function') renderKartenListe();
        if (typeof renderKartenZuweisung === 'function') renderKartenZuweisung();
    };

    if (bilderLaden) {
        Promise.all(roh.map(k =>
            (k.bild ? Promise.resolve(k.bild) : karteBildLesen(k._legacyBild ? 'aktuell' : k.id))
                .then(bild => { k.bild = bild || null; })
        )).then(fertig);
    } else {
        fertig();
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

    // Karten — Bilder je Karten-ID aus IndexedDB nachladen
    kartenUebernehmen(daten, true);
    const status = document.getElementById('map-status');
    if (status && kartenAusDaten(daten).length) {
        status.textContent = 'Karten wiederhergestellt. Über „📤 Senden" erneut an die Spieler schicken, sobald sie verbunden sind.';
    }

    sitzungHinweisSchliessen(false);
    addGmLog('System', 'Frühere Sitzung wiederhergestellt.', 'erfolg');
}
