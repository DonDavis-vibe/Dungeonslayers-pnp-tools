// Dungeonslayers 4 — Anbindung des Karten-Moduls an Bogen und SL-Dashboard
// Das eigentliche Zeichnen steckt in battlemap.js; hier hängt nur die Bedienung
// und die Übertragung über die bestehende Peer-to-Peer-Verbindung dran.
//
// Rollen: Der Spielleiter besitzt die Karte und darf alles. Spieler sehen zu und
// dürfen ausschließlich ihre eigene Figur bewegen.

let karte = null;
let karteOffen = false;
let karteBildDatenUrl = null;
// Der Spielleiter kann die Bestaetigungspflicht fuer Spielerzuege abschalten
let zuegeFrei = false;

// Bild wird in Stücken übertragen — ein DataChannel verträgt keine Megabyte am Stück
const BILD_STUECK = 16 * 1024;
let bildEmpfang = {};

function karteVorhanden() {
    return typeof BattleMap !== 'undefined';
}

// --- Platzierung ------------------------------------------------------------
//
// Es gibt nur EINE Leinwand. Sie wird zwischen den Einhängepunkten verschoben,
// je nachdem ob gerade Spieleransicht, SL-Dashboard oder Vollbild aktiv ist.
// So bleiben Bild, Figuren und Zoomstufe über alle Ansichten hinweg dieselben.

const KARTE_EINGEKLAPPT = 'ds4_karte_eingeklappt';
let karteImVollbild = false;

function karteInitialisieren() {
    if (karte || !karteVorhanden()) return;
    const canvas = document.getElementById('map-canvas');
    karte = BattleMap.create(canvas, {
        einheit: 1, einheitName: 'm',    // Regelwerk Anhang B: ein Feld = 1 Meter
        onChange: zustand => sendeKartenZustand(zustand),
        onLokaleFigur: figur => sendeEigeneFigur(figur),
        onZugVorschlag: (figur, felder) => sendeZugVorschlag(figur, felder)
    });
    wireKartenBedienung();
}

function karteEinhaengen() {
    karteInitialisieren();
    if (!karte) return;

    const widget = document.getElementById('map-widget');
    const ziel = document.getElementById(
        karteImVollbild ? 'map-host-overlay' : (isGmMode ? 'map-host-gm' : 'map-host-player')
    );
    if (ziel && widget && widget.parentElement !== ziel) ziel.appendChild(widget);

    karteOffen = true;
    // Spieler dürfen nur die eigene Figur schieben — und nur als Vorschlag,
    // den der Spielleiter bestätigt. Der Spielleiter selbst setzt direkt.
    karte.setBesitzer(isGmMode ? null : eigeneFigurKennung());
    karte.setBestaetigung(!isGmMode && !zuegeFrei);
    // Spieler sehen den Nebel deckend, der Spielleiter halbdurchsichtig
    karte.setNebelDeckend(!isGmMode);
    if (!isGmMode && ['malen', 'radieren', 'nebel-auf', 'nebel-zu'].includes(karte.getWerkzeug())) {
        karte.setWerkzeug('zeigen');
    }
    renderKartenWerkzeuge();
    // Die Leinwand kennt ihre Größe erst nach dem Umhängen
    setTimeout(() => karte.zeichnen(), 30);
}

function karteVollbild(an) {
    karteImVollbild = !!an;
    const overlay = document.getElementById('map-overlay');
    overlay.style.display = karteImVollbild ? 'flex' : 'none';
    if (karteImVollbild) karteEinklappen(isGmMode ? 'gm' : 'player', false);
    karteEinhaengen();
}

// Ein- und Ausklappen des eingebetteten Panels; die Wahl bleibt gespeichert.
function karteEinklappen(rolle, umschalten = true) {
    const host = document.getElementById('map-host-' + rolle);
    const knopf = document.getElementById('map-toggle-' + rolle);
    if (!host) return;

    const istZu = host.classList.contains('zugeklappt');
    const neuZu = umschalten ? !istZu : false;
    host.classList.toggle('zugeklappt', neuZu);
    if (knopf) knopf.textContent = neuZu ? 'Ausklappen' : 'Einklappen';
    try { localStorage.setItem(KARTE_EINGEKLAPPT, neuZu ? '1' : '0'); } catch (e) { /* Speicher evtl. blockiert */ }
    if (!neuZu) setTimeout(() => karte && karte.zeichnen(), 30);
}

function karteZustandHerstellen() {
    let zu = false;
    try { zu = localStorage.getItem(KARTE_EINGEKLAPPT) === '1'; } catch (e) { /* Speicher evtl. blockiert */ }
    ['player', 'gm'].forEach(rolle => {
        const host = document.getElementById('map-host-' + rolle);
        const knopf = document.getElementById('map-toggle-' + rolle);
        if (host) host.classList.toggle('zugeklappt', zu);
        if (knopf) knopf.textContent = zu ? 'Ausklappen' : 'Einklappen';
    });
}

// Der Knopf in der Kopfzeile klappt die Karte auf und springt hin
function openKarte() {
    karteEinklappen(isGmMode ? 'gm' : 'player', false);
    karteEinhaengen();
    const panel = document.getElementById(isGmMode ? 'map-panel-gm' : 'map-panel-player');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeKarte() { karteVollbild(false); }

document.addEventListener('DOMContentLoaded', () => {
    karteZustandHerstellen();
    karteEinhaengen();
});

// Kennung, an der eine Spielerfigur hängt — der Charaktername reicht hier aus
function eigeneFigurKennung() {
    return 'spieler:' + characterName();
}

// --- Bedienleiste -----------------------------------------------------------

function renderKartenWerkzeuge() {
    const leiste = document.getElementById('map-tools');
    if (!leiste) return;

    const wz = karte.getWerkzeug();
    const aktiv = name => wz === name ? 'selected' : '';

    if (!isGmMode) {
        leiste.innerHTML = `
            <label class="radio-pill ${aktiv('zeigen')}" onclick="werkzeugWaehlen('zeigen')">✋ Bewegen</label>
            <label class="radio-pill ${aktiv('messen')}" onclick="werkzeugWaehlen('messen')">📏 Messen</label>
            <button class="btn btn-sm btn-ghost" onclick="karte.einpassen()">Einpassen</button>
            <span class="hint">Mausrad zoomt · deine Figur ziehen meldet einen Zug beim Spielleiter an</span>`;
        return;
    }

    const r = karte.raster;
    const malArt = karte.getMalArt();
    const malAktiv = wz === 'malen';
    const farben = ['#f0c069', '#6fa84a', '#4a90d4', '#c4569e', '#b8462f'];

    leiste.innerHTML = `
        <button class="help-btn" type="button" data-hilfe="karte-werkzeuge" aria-label="Hilfe: Karten-Werkzeuge" title="Hilfe: Karten-Werkzeuge">?</button>
        <button class="btn btn-sm btn-primary" onclick="document.getElementById('map-file').click()">🖼️ Karte</button>
        ${karteBildDatenUrl ? '<button class="btn btn-sm" onclick="verteileKartenBild()" title="Karte erneut an alle verbundenen Spieler schicken">📤 Senden</button>' : ''}
        <button class="btn btn-sm" onclick="figurenAusKampfUebernehmen()" title="Alle Kampfteilnehmer auf einmal setzen">👥 Aus Kampf</button>
        <button class="btn btn-sm" onclick="figurSetzenDialog()" title="Einzelne Figur auf die Karte setzen">➕ Figur</button>
        <span class="werkzeug-gruppe">
            <label class="radio-pill ${aktiv('zeigen')}" onclick="werkzeugWaehlen('zeigen')" title="Karte und Figuren bewegen">✋</label>
            <label class="radio-pill ${aktiv('messen')}" onclick="werkzeugWaehlen('messen')" title="Entfernung messen">📏</label>
            <label class="radio-pill ${aktiv('malen')}" onclick="werkzeugWaehlen('malen')" title="Markierung zeichnen">✏️</label>
            <label class="radio-pill ${aktiv('radieren')}" onclick="werkzeugWaehlen('radieren')" title="Markierung entfernen">🧽</label>
        </span>
        ${malAktiv ? `
        <span class="werkzeug-gruppe">
            ${[['freihand', '〰️', 'Freihand'], ['linie', '📐', 'Linie'], ['kreis', '⭕', 'Kreis (Zauberwirkung)'], ['rechteck', '▭', 'Rechteck']]
                .map(([a, sym, titel]) => `<label class="radio-pill ${malArt === a ? 'selected' : ''}" onclick="malArtWaehlen('${a}')" title="${titel}">${sym}</label>`).join('')}
            ${farben.map(f => `<span class="mal-farbe ${karte.getMalFarbe() === f ? 'aktiv' : ''}" style="background:${f}" onclick="malFarbeWaehlen('${f}')"></span>`).join('')}
            <button class="btn btn-sm btn-ghost" onclick="karte.formenLoeschen()">Alle löschen</button>
        </span>` : ''}
        <span class="werkzeug-gruppe" title="Nebel des Krieges">
            <label class="radio-pill ${aktiv('nebel-auf')}" onclick="werkzeugWaehlen('nebel-auf')" title="Bereich vormerken zum Aufdecken">🔦 Auf</label>
            <label class="radio-pill ${aktiv('nebel-zu')}" onclick="werkzeugWaehlen('nebel-zu')" title="Bereich wieder zudecken">🌫️ Zu</label>
            <label class="radio-pill ${karte.getNebelForm() === 'rechteck' ? 'selected' : ''}" onclick="nebelFormWaehlen('rechteck')" title="Rechteckiger Bereich">▭</label>
            <label class="radio-pill ${karte.getNebelForm() === 'kreis' ? 'selected' : ''}" onclick="nebelFormWaehlen('kreis')" title="Runder Bereich (z.B. Lichtschein)">⭕</label>
            <button class="btn btn-sm btn-ghost" onclick="karte.nebelAllesZudecken();renderKartenWerkzeuge()" title="Ganze Karte verdecken">Alles zu</button>
            <button class="btn btn-sm btn-ghost" onclick="karte.nebelAllesAufdecken();renderKartenWerkzeuge()" title="Nebel abschalten">Alles auf</button>
        </span>
        <label class="radio-pill ${r.rasterSichtbar ? 'selected' : ''}" onclick="rasterUmschalten()">Raster</label>
        <label class="radio-pill ${r.einrasten ? 'selected' : ''}" onclick="einrastenUmschalten()">Einrasten</label>
        <input type="number" id="map-gridsize" value="${r.rasterGroesse}" min="4" max="400" style="width:4rem" title="Feldgröße in Pixeln">
        <input type="number" id="map-offx" value="${r.rasterVersatzX}" style="width:3.4rem" title="Versatz waagerecht">
        <input type="number" id="map-offy" value="${r.rasterVersatzY}" style="width:3.4rem" title="Versatz senkrecht">
        <button class="btn btn-sm btn-ghost" onclick="figurGroesseDialog()" title="Größe einer Figur ändern (Drache, Riese ...)">📏 Größe</button>
        <button class="btn btn-sm btn-ghost" onclick="figurEntfernenDialog()" title="Eine einzelne Figur von der Karte nehmen">🗑️ Figur</button>
        <label class="radio-pill ${zuegeFrei ? 'selected' : ''}" onclick="zugFreigabeUmschalten()"
               title="Aus: jeder Spielerzug muss bestätigt werden. An: Spieler bewegen ihre Figur frei — praktisch außerhalb des Kampfes.">${zuegeFrei ? '🔓 Züge frei' : '🔒 Züge prüfen'}</label>
        <button class="btn btn-sm btn-ghost" onclick="verdecktUmschalten()" title="Einzelne Gegner vor den Spielern verbergen">🙈</button>
        <button class="btn btn-sm btn-danger" style="margin-left:auto" onclick="figurenLeeren()">Figuren leeren</button>`;

    ['map-gridsize', 'map-offx', 'map-offy'].forEach(id => {
        const feld = document.getElementById(id);
        if (feld) feld.addEventListener('input', rasterAusFeldern);
    });
}

function rasterAusFeldern() {
    const zahl = id => parseFloat(document.getElementById(id).value) || 0;
    karte.setRaster({
        rasterGroesse: Math.max(4, zahl('map-gridsize')),
        rasterVersatzX: zahl('map-offx'),
        rasterVersatzY: zahl('map-offy')
    });
}

function rasterUmschalten() {
    karte.setRaster({ rasterSichtbar: !karte.raster.rasterSichtbar });
    renderKartenWerkzeuge();
}

function einrastenUmschalten() {
    karte.setRaster({ einrasten: !karte.raster.einrasten });
    renderKartenWerkzeuge();
}

const WERKZEUG_HINWEIS = {
    zeigen: '',
    messen: 'Ziehen misst die Entfernung in Feldern und Metern.',
    malen: 'Ziehen zeichnet eine Markierung. Der Kreis zeigt seinen Radius in Metern — praktisch für Zauberwirkungen.',
    radieren: 'Auf eine Markierung klicken, um sie zu entfernen.',
    'nebel-auf': 'Ein Rechteck ziehen, um diesen Bereich für die Spieler aufzudecken.',
    'nebel-zu': 'Ein Rechteck ziehen, um diesen Bereich wieder zu verdecken.'
};

function werkzeugWaehlen(name) {
    karte.setWerkzeug(name);
    renderKartenWerkzeuge();
    const status = document.getElementById('map-status');
    if (status) status.textContent = WERKZEUG_HINWEIS[name] || '';
}

function malArtWaehlen(art) { karte.setMalArt(art); renderKartenWerkzeuge(); }
function malFarbeWaehlen(farbe) { karte.setMalFarbe(farbe); renderKartenWerkzeuge(); }
function nebelFormWaehlen(form) { karte.setNebelForm(form); renderKartenWerkzeuge(); }

function nebelFreigeben() {
    const anzahl = karte.nebelFreigeben();
    renderNebelFreigabe();
    const status = document.getElementById('map-status');
    if (status) status.textContent = anzahl
        ? `${anzahl} Bereich(e) freigegeben — die Spieler sehen sie jetzt.`
        : 'Keine vorgemerkten Bereiche.';
    if (anzahl) addGmLog('Spielleiter', `hat ${anzahl} Kartenbereich(e) aufgedeckt.`, 'erfolg');
}

function nebelEntwurfVerwerfen() {
    const anzahl = karte.nebelEntwurfVerwerfen();
    renderNebelFreigabe();
    const status = document.getElementById('map-status');
    if (status) status.textContent = anzahl ? `${anzahl} vorgemerkte(r) Bereich(e) verworfen.` : '';
}

// Leiste mit der Freigabe — erscheint nur, wenn etwas vorgemerkt ist
function renderNebelFreigabe() {
    const box = document.getElementById('map-nebel');
    if (!box) return;
    if (!isGmMode || !karte) { box.innerHTML = ''; return; }

    const offen = karte.offeneNebelBereiche();
    if (!offen) { box.innerHTML = ''; return; }

    box.innerHTML = `<div class="nebel-freigabe">
        <span>🔦 <strong>${offen}</strong> Bereich(e) vorgemerkt — für die Spieler noch <strong>nicht</strong> sichtbar.
            Grün gestrichelt umrandet.</span>
        <span style="margin-left:auto;display:flex;gap:0.3rem">
            <button class="btn btn-sm btn-primary" onclick="nebelFreigeben()">Für Spieler freigeben</button>
            <button class="btn btn-sm btn-danger" onclick="nebelEntwurfVerwerfen()">Verwerfen</button>
        </span>
    </div>`;
}

// --- Figuren einzeln setzen -------------------------------------------------

// Der Spielleiter soll Figuren auch ohne laufenden Kampf platzieren können.
function figurSetzenDialog() {
    const bereits = new Set(karte.figuren.map(f => f.besitzer));
    const spieler = Object.values(connectedPlayers).filter(p => !bereits.has('spieler:' + p.name));

    const zeilen = [];
    spieler.forEach((p, i) => zeilen.push(`${i + 1}) ${p.name} (verbundener Spieler)`));
    zeilen.push('B) Gegner aus dem Bestiarium - kommt mit Werten in den Kampf');
    zeilen.push('N) Nur ein Marker mit eigenem Namen, ohne Werte');

    const eingabe = prompt(
        'Welche Figur auf die Karte setzen?\n\n' + zeilen.join('\n') +
        '\n\nNummer, B oder N eingeben:');
    if (!eingabe) return;

    const wahl = eingabe.trim().toUpperCase();

    // Ueber das Bestiarium kommt der Statblock gleich mit: dort erledigt
    // "+ Karte" Kampf-Tracker und Figur in einem Zug.
    if (wahl === 'B') {
        if (typeof openBestiary === 'function') openBestiary();
        else zeigeKartenHinweis('Das Bestiarium ist gerade nicht erreichbar.');
        return;
    }

    if (wahl === 'N') {
        const name = prompt('Name der Figur (nur Marker, ohne Werte):', 'Gegner');
        if (!name) return;
        figurSetzen({ name, farbe: '#a8342c', besitzer: 'sl', id: 'frei:' + uid() });
        return;
    }

    const p = spieler[parseInt(eingabe, 10) - 1];
    if (!p) return;
    figurSetzen({
        name: p.name,
        farbe: colorForPlayer(p.name),
        besitzer: 'spieler:' + p.name,
        id: 'spieler:' + p.name,
        portrait: p.portrait
    });
}

// Setzt die Figur auf ein freies Feld nahe der Kartenmitte
function figurSetzen(daten) {
    let x = 1, y = 1;
    const belegt = (px, py) => karte.figuren.some(f => Math.abs(f.x - px) < 0.9 && Math.abs(f.y - py) < 0.9);
    suche: for (let ring = 0; ring < 12; ring++) {
        for (let dy = 0; dy <= ring; dy++) {
            for (let dx = 0; dx <= ring; dx++) {
                if (!belegt(1 + dx, 1 + dy)) { x = 1 + dx; y = 1 + dy; break suche; }
            }
        }
    }

    karte.addFigur({
        id: daten.id, name: daten.name, farbe: daten.farbe, besitzer: daten.besitzer,
        x, y, groesse: daten.groesse || 1
    });
    if (daten.portrait) {
        karte.setFigurBild(daten.id, daten.portrait);
        verteileFigurenBilder();
    }
    const status = document.getElementById('map-status');
    if (status) status.textContent = `${daten.name} auf Feld ${x}/${y} gesetzt — von dort frei verschiebbar.`;
}

// Gegner vor den Spielern verbergen — für Hinterhalte und noch nicht
// entdeckte Kreaturen. Beim Spielleiter bleiben sie blass sichtbar.
function verdecktUmschalten() {
    const gegner = karte.figuren.filter(f => f.besitzer === 'sl');
    if (!gegner.length) {
        const status = document.getElementById('map-status');
        if (status) status.textContent = 'Keine Gegnerfiguren auf der Karte.';
        return;
    }
    const namen = gegner.map((f, i) => `${i + 1}) ${f.name}${f.verdeckt ? ' [verdeckt]' : ''}`).join('\n');
    const eingabe = prompt('Welche Figur verdecken bzw. aufdecken?\nNummer eingeben, "alle" für alle Gegner:\n\n' + namen);
    if (!eingabe) return;

    if (eingabe.trim().toLowerCase() === 'alle') {
        const neu = !gegner.every(f => f.verdeckt);
        gegner.forEach(f => karte.setVerdeckt(f.id, neu));
    } else {
        const nummer = parseInt(eingabe, 10);
        const ziel = gegner[nummer - 1];
        if (ziel) karte.setVerdeckt(ziel.id, !ziel.verdeckt);
    }
    const verdeckte = karte.figuren.filter(f => f.verdeckt).length;
    const status = document.getElementById('map-status');
    if (status) status.textContent = verdeckte
        ? `${verdeckte} Figur(en) für die Spieler verborgen — beim Spielleiter blass dargestellt.`
        : 'Alle Figuren sind für die Spieler sichtbar.';
}

function figurenLeeren() {
    if (!confirm('Wirklich alle Figuren von der Karte nehmen?')) return;
    karte.figurenLoeschen();
}

function wireKartenBedienung() {
    const datei = document.getElementById('map-file');
    if (datei) {
        datei.addEventListener('change', ereignis => {
            const f = ereignis.target.files[0];
            if (f) karteBildLaden(f);
            ereignis.target.value = '';
        });
    }
}

// --- Bild laden und verteilen ----------------------------------------------

function karteBildLaden(datei) {
    const status = document.getElementById('map-status');
    status.textContent = 'Bild wird vorbereitet...';

    BattleMap.bildVerkleinern(datei).then(ergebnis => {
        karteBildDatenUrl = ergebnis.dataUrl;
        karte.setBild(ergebnis.dataUrl);
        setTimeout(() => karte.einpassen(), 50);

        const kb = Math.round(ergebnis.dataUrl.length * 0.75 / 1024);
        status.textContent = `Karte geladen: ${ergebnis.breite}×${ergebnis.hoehe} Pixel, ~${kb} KB` +
            (ergebnis.verkleinert ? ' (für die Übertragung verkleinert)' : '');

        // Bild getrennt sichern, damit es einen Reload übersteht
        if (typeof karteBildSichern === 'function') karteBildSichern(ergebnis.dataUrl);
        if (isGmMode) verteileKartenBild();
    }).catch(fehler => {
        status.textContent = 'Fehler: ' + fehler.message;
    });
}

// Das Bild in Stücken an alle Spieler schicken
function verteileKartenBild(nurAn) {
    if (!karteBildDatenUrl) return;
    if (!nurAn && !Object.keys(clientConnections).length) {
        const status = document.getElementById('map-status');
        if (status) status.textContent = 'Noch kein Spieler verbunden — die Karte geht automatisch raus, sobald jemand beitritt.';
        return;
    }
    const kennung = 'bild-' + Date.now();
    const stuecke = [];
    for (let i = 0; i < karteBildDatenUrl.length; i += BILD_STUECK) {
        stuecke.push(karteBildDatenUrl.slice(i, i + BILD_STUECK));
    }

    const senden = nachricht => {
        if (nurAn) sendToPlayer(nurAn, nachricht);
        else broadcastToPlayers(nachricht);
    };

    senden({ type: 'mapImageStart', kennung, anzahl: stuecke.length });
    stuecke.forEach((teil, index) => senden({ type: 'mapImageChunk', kennung, index, teil }));
    senden({ type: 'mapImageEnd', kennung, zustand: karte.getState() });

    const status = document.getElementById('map-status');
    if (status) status.textContent += ` · an ${nurAn ? 'einen Spieler' : Object.keys(clientConnections).length + ' Spieler'} gesendet`;
}

// --- Figurengröße -----------------------------------------------------------

// Ein Feld entspricht 1m (Anhang B), deshalb lassen sich die Größenkategorien
// des Bestiariums direkt in Felder übersetzen.
const GK_ZU_FELDERN = {
    winzig: 0.5,   // unter 0,5 m
    klein: 1,      // 0,5 - 1 m
    normal: 1,     // 1 - 3 m
    gross: 2,      // 3 - 6 m
    riesig: 3,     // 6 - 12 m
    gewaltig: 4    // über 12 m
};

function groesseAusKategorie(gk) {
    return GK_ZU_FELDERN[gk] || 1;
}

// Erst fragen, welche Figur — dann die Größe
// Eine einzelne Figur von der Karte nehmen. battlemap kann das laengst
// (removeFigur), es fehlte nur der Weg dorthin — bisher gab es nur "alle loeschen".
function figurEntfernenDialog() {
    const figuren = karte.figuren;
    if (!figuren.length) {
        const status = document.getElementById('map-status');
        if (status) status.textContent = 'Keine Figuren auf der Karte.';
        return;
    }
    const zeilen = figuren.map((f, i) => `${i + 1}) ${f.name}${f.besitzer === 'sl' ? '' : ' (Spieler)'}`);
    const eingabe = prompt('Welche Figur von der Karte nehmen?\nNummer eingeben:\n\n' + zeilen.join('\n'));
    if (!eingabe) return;

    const f = figuren[parseInt(eingabe, 10) - 1];
    if (!f) return;
    karte.removeFigur(f.id);
    const status = document.getElementById('map-status');
    if (status) status.textContent = `${f.name} von der Karte genommen.`;
}

// Ausserhalb des Kampfes nervt die Bestaetigung jedes Schrittes. Der Spielleiter
// kann die Zuege deshalb freigeben; die Spieler bewegen dann direkt.
function zugFreigabeUmschalten() {
    zuegeFrei = !zuegeFrei;
    broadcastToPlayers({ type: 'mapZugFreigabe', frei: zuegeFrei });
    renderKartenWerkzeuge();
    const status = document.getElementById('map-status');
    if (status) {
        status.textContent = zuegeFrei
            ? 'Spieler bewegen ihre Figuren jetzt direkt — ohne Bestätigung.'
            : 'Spielerzüge müssen wieder bestätigt werden.';
    }
}

function figurGroesseDialog() {
    const figuren = karte.figuren;
    if (!figuren.length) {
        const status = document.getElementById('map-status');
        if (status) status.textContent = 'Keine Figuren auf der Karte.';
        return;
    }
    const zeilen = figuren.map((f, i) =>
        `${i + 1}) ${f.name} — ${String(f.groesse || 1).replace('.', ',')} Feld(er)`);
    const eingabe = prompt('Welche Figur?\n\n' + zeilen.join('\n'));
    const nummer = parseInt(eingabe, 10);
    if (figuren[nummer - 1]) figurGroesseAendern(figuren[nummer - 1].id);
}

// Größe einer Figur ändern — Auswahl nach den Kategorien des Regelwerks
function figurGroesseAendern(id) {
    const figur = karte.figuren.find(f => f.id === id);
    if (!figur) return;

    const kategorien = Object.entries(GK_ZU_FELDERN);
    const zeilen = kategorien.map(([k, felder], i) => {
        const def = (typeof DS4_GROESSENKATEGORIEN !== 'undefined' && DS4_GROESSENKATEGORIEN[k]) || {};
        const aktuell = (figur.groesse || 1) === felder ? '  ← aktuell' : '';
        return `${i + 1}) ${def.name || k} (${def.bereich || ''}) — ${felder} Feld${felder === 1 ? '' : 'er'}${aktuell}`;
    });

    const eingabe = prompt(
        `Größe von "${figur.name}"\n\nNummer wählen oder eine Feldzahl eingeben:\n\n` + zeilen.join('\n'),
        String(figur.groesse || 1));
    if (!eingabe) return;

    const nummer = parseInt(eingabe, 10);
    let felder;
    if (nummer >= 1 && nummer <= kategorien.length && !eingabe.includes('.') && !eingabe.includes(',')) {
        felder = kategorien[nummer - 1][1];
    } else {
        felder = parseFloat(eingabe.replace(',', '.'));
    }
    if (!Number.isFinite(felder) || felder <= 0) return;

    karte.setFigurGroesse(id, felder);
    const status = document.getElementById('map-status');
    if (status) status.textContent = `${figur.name}: Größe auf ${String(felder).replace('.', ',')} Feld(er) gesetzt.`;
}

// --- Figuren ----------------------------------------------------------------

// Übernimmt Spieler und Gegner aus dem Kampf-Tracker als Figuren
function figurenAusKampfUebernehmen() {
    if (typeof combatants === 'undefined') return;
    if (combatActive) syncPlayersIntoCombat();

    let spalte = 1;
    combatants.forEach((c, i) => {
        const figurId = 'kampf:' + c.id;
        const vorhanden = karte.figuren.find(f => f.id === figurId);
        karte.addFigur({
            id: figurId,
            name: c.name,
            farbe: c.type === 'player' ? colorForPlayer(c.name) : '#a8342c',
            besitzer: c.type === 'player' ? 'spieler:' + c.name : 'sl',
            x: vorhanden ? vorhanden.x : spalte,
            y: vorhanden ? vorhanden.y : 1 + (i % 8),
            groesse: 1
        });

        // Charakterbild des Spielers als Figurenbild verwenden
        if (c.type === 'player') {
            const spieler = connectedPlayers[c.peerId];
            if (spieler && spieler.portrait) karte.setFigurBild(figurId, spieler.portrait);
        }
        if ((i + 1) % 8 === 0) spalte++;
    });

    verteileFigurenBilder();
    const status = document.getElementById('map-status');
    if (status) status.textContent = `${combatants.length} Figuren aus dem Kampf übernommen.`;
}

// Figurenbilder gesondert verteilen — sie hängen NICHT am laufenden Zustand,
// der bei jeder Bewegung übertragen wird.
function verteileFigurenBilder(nurAn) {
    if (!isGmMode || !karte) return;
    const bilder = karte.getFigurBilder();
    if (!Object.keys(bilder).length) return;
    const nachricht = { type: 'mapPortraits', bilder };
    if (nurAn) sendToPlayer(nurAn, nachricht);
    else broadcastToPlayers(nachricht);
}

// --- Zugvorschläge beim Spielleiter ----------------------------------------

function renderZugVorschlaege() {
    const box = document.getElementById('map-zuege');
    if (!box) return;
    if (!isGmMode || !karte) { box.innerHTML = ''; return; }

    const offen = karte.offeneZuege();
    if (!offen.length) { box.innerHTML = ''; return; }

    box.innerHTML = offen.map(z => {
        // Laufen-Wert des zugehörigen Spielers zum Abgleich heranziehen
        const spieler = Object.values(connectedPlayers).find(p => 'spieler:' + p.name === z.besitzer);
        const laufen = spieler ? spieler.laufen : null;
        const zuWeit = typeof laufen === 'number' && z.felder > laufen;

        return `<div class="zug-vorschlag ${zuWeit ? 'zu-weit' : ''}">
            <span><strong>${escapeHtml(z.name)}</strong> will
                <strong>${z.felder} Feld${z.felder === 1 ? '' : 'er'}</strong> (${z.felder}m) weit
                ${typeof laufen === 'number' ? `— Laufen ${String(laufen).replace('.', ',')}m` : ''}
                ${zuWeit ? '<span class="tag tag-warn">zu weit</span>' : ''}
            </span>
            <span style="margin-left:auto;display:flex;gap:0.3rem">
                <button class="btn btn-sm btn-primary" data-zug-ok="${escapeHtml(z.id)}">Bestätigen</button>
                <button class="btn btn-sm btn-danger" data-zug-nein="${escapeHtml(z.id)}">Ablehnen</button>
            </span>
        </div>`;
    }).join('');

    box.querySelectorAll('[data-zug-ok]').forEach(b => b.addEventListener('click', () => zugEntscheiden(b.dataset.zugOk, true)));
    box.querySelectorAll('[data-zug-nein]').forEach(b => b.addEventListener('click', () => zugEntscheiden(b.dataset.zugNein, false)));
}

function zugEntscheiden(id, angenommen) {
    const figur = karte.figuren.find(f => f.id === id);
    const name = figur ? figur.name : '?';
    if (angenommen) karte.zugBestaetigen(id);
    else karte.zugVerwerfen(id);

    renderZugVorschlaege();
    broadcastToPlayers({ type: 'mapZugEntscheidung', id, angenommen, zustand: karte.getStateFuerSpieler() });
    addGmLog('Spielleiter', `Bewegung von <strong>${escapeHtml(name)}</strong> ${angenommen ? 'bestätigt' : 'abgelehnt'}.`,
        angenommen ? 'erfolg' : 'fehlschlag');
}

// --- Übertragung ------------------------------------------------------------

function sendeKartenZustand(zustand) {
    if (!karteOffen) return;
    if (isGmMode) {
        // Verdeckte Figuren und vorgemerkte Nebelbereiche bleiben beim Spielleiter
        broadcastToPlayers({ type: 'mapState', zustand: karte.getStateFuerSpieler() });
        renderZugVorschlaege();
        renderNebelFreigabe();
        if (typeof sitzungSichern === 'function') sitzungSichern();
    }
    // Spieler schicken nur ihre eigene Figur, siehe sendeEigeneFigur
}

// Wird aufgerufen, sobald eine Figur hier vor Ort abgelegt wurde.
function sendeEigeneFigur(figur) {
    if (isGmMode) {
        // Der Spielleiter darf jede Figur direkt versetzen. Damit beim Spieler
        // nichts unerklärt springt, wird das protokolliert und angekündigt.
        gmHatFigurVersetzt(figur);
        return;                                  // die Verteilung übernimmt mapState
    }
    if (!hostConnection || !hostConnection.open) return;
    if (figur.besitzer !== eigeneFigurKennung()) return;
    hostConnection.send({ type: 'mapToken', id: figur.id, x: figur.x, y: figur.y });
}

function gmHatFigurVersetzt(figur) {
    // Ein noch offener Vorschlag für diese Figur ist damit hinfällig
    if (figur.geplantX !== undefined && figur.geplantX !== null) {
        figur.geplantX = null;
        figur.geplantY = null;
        renderZugVorschlaege();
    }

    if (!figur.besitzer || !figur.besitzer.startsWith('spieler:')) return;

    const name = figur.besitzer.slice('spieler:'.length);
    addGmLog('Spielleiter', `hat <strong>${escapeHtml(figur.name)}</strong> auf der Karte versetzt.`, 'neutral');

    const eintrag = Object.entries(connectedPlayers).find(([, p]) => p.name === name);
    if (eintrag) {
        sendToPlayer(eintrag[0], { type: 'message', text: 'Der Spielleiter hat deine Figur auf der Karte versetzt.' });
    }
}

// Ein Spieler schlägt eine Bewegung vor — der Spielleiter entscheidet.
function sendeZugVorschlag(figur, felder) {
    const status = document.getElementById('map-status');
    if (!hostConnection || !hostConnection.open) {
        if (status) status.textContent = 'Nicht mit einem Spielleiter verbunden — der Zug kann nicht angemeldet werden.';
        return;
    }
    hostConnection.send({
        type: 'mapZugVorschlag',
        id: figur.id, vonX: figur.x, vonY: figur.y,
        zuX: figur.geplantX, zuY: figur.geplantY, felder
    });
    const laufen = lastDerived ? lastDerived.laufen : null;
    const zuWeit = laufen !== null && felder > laufen;
    if (status) {
        status.innerHTML = `Zug angemeldet: <strong>${felder} Feld${felder === 1 ? '' : 'er'}</strong> (${felder}m)` +
            (laufen !== null ? ` — dein Laufen-Wert ist ${String(laufen).replace('.', ',')}m` : '') +
            (zuWeit ? ' <span style="color:var(--fail)">· weiter als erlaubt</span>' : '') +
            ' · warte auf den Spielleiter.';
    }
}

// Nachrichten rund um die Karte — wird von multiplayer.js aufgerufen
function handleKartenNachricht(payload, vonPeer) {
    switch (payload.type) {

        // --- beim Spieler ---
        case 'mapImageStart':
            bildEmpfang[payload.kennung] = new Array(payload.anzahl).fill(null);
            zeigeKartenHinweis('Karte wird empfangen...');
            return true;

        case 'mapImageChunk': {
            const puffer = bildEmpfang[payload.kennung];
            if (puffer) puffer[payload.index] = payload.teil;
            return true;
        }

        case 'mapImageEnd': {
            const puffer = bildEmpfang[payload.kennung];
            delete bildEmpfang[payload.kennung];
            if (puffer && puffer.every(t => t !== null)) {
                karteBildDatenUrl = puffer.join('');
                karteEinhaengen();
                karte.applyState(payload.zustand || {}, karteBildDatenUrl);
                setTimeout(() => karte.einpassen(), 60);
                zeigeKartenHinweis('Der Spielleiter hat eine Karte geteilt.');
            } else {
                zeigeKartenHinweis('Die Karte kam unvollständig an.');
            }
            return true;
        }

        case 'mapState':
            if (!karte) return true;            // ohne geöffnete Karte nichts zu tun
            karte.applyState(payload.zustand);
            return true;

        case 'mapZugFreigabe':
            zuegeFrei = !!payload.frei;
            if (karte) karte.setBestaetigung(!isGmMode && !zuegeFrei);
            zeigeKartenHinweis(zuegeFrei
                ? 'Der Spielleiter hat die Bewegung freigegeben — du kannst deine Figur direkt ziehen.'
                : 'Züge müssen wieder vom Spielleiter bestätigt werden.');
            return true;

        case 'mapPortraits':
            if (!karte) return true;
            Object.entries(payload.bilder || {}).forEach(([id, dataUrl]) => karte.setFigurBild(id, dataUrl));
            return true;

        case 'mapZugEntscheidung': {
            if (!karte) return true;
            karte.applyState(payload.zustand);
            const eigene = payload.id && payload.id.includes(characterName());
            const status = document.getElementById('map-status');
            if (status) {
                status.innerHTML = payload.angenommen
                    ? '<span style="color:var(--success)">Der Spielleiter hat die Bewegung bestätigt.</span>'
                    : '<span style="color:var(--fail)">Der Spielleiter hat die Bewegung abgelehnt.</span>';
            }
            if (eigene && typeof showGmMessage === 'function') {
                showGmMessage(payload.angenommen
                    ? 'Deine Bewegung wurde <strong>bestätigt</strong>.'
                    : 'Deine Bewegung wurde <strong>abgelehnt</strong>.');
            }
            return true;
        }

        // --- beim Spielleiter ---
        case 'mapZugVorschlag': {
            if (!isGmMode || !karte) return true;
            const figur = karte.figuren.find(f => f.id === payload.id);
            if (!figur) return true;
            const spieler = connectedPlayers[vonPeer];
            // Nur die eigene Figur darf vorgeschlagen werden
            if (!spieler || figur.besitzer !== 'spieler:' + spieler.name) return true;

            figur.geplantX = payload.zuX;
            figur.geplantY = payload.zuY;
            karte.zeichnen();
            renderZugVorschlaege();

            const laufen = spieler.laufen;
            const zuWeit = typeof laufen === 'number' && payload.felder > laufen;
            addGmLog('System',
                `<strong>${escapeHtml(figur.name)}</strong> möchte ${payload.felder} Feld${payload.felder === 1 ? '' : 'er'} weit gehen` +
                (typeof laufen === 'number' ? ` (Laufen ${String(laufen).replace('.', ',')}m)` : '') +
                (zuWeit ? ' — <strong style="color:var(--fail)">weiter als erlaubt</strong>' : ''),
                zuWeit ? 'fehlschlag' : 'neutral');
            return true;
        }

        case 'mapToken': {
            if (!isGmMode || !karte) return true;
            const figur = karte.figuren.find(f => f.id === payload.id);
            if (!figur) return true;
            // Nur die eigene Figur des jeweiligen Spielers darf bewegt werden
            const spieler = connectedPlayers[vonPeer];
            if (!spieler || figur.besitzer !== 'spieler:' + spieler.name) return true;
            figur.x = payload.x;
            figur.y = payload.y;
            karte.zeichnen();
            broadcastToPlayers({ type: 'mapState', zustand: karte.getState() });
            return true;
        }

        // Ein neu beigetretener Spieler bekommt die Karte nachgereicht
        case 'mapAnfordern':
            if (!isGmMode) return true;
            if (karteBildDatenUrl) verteileKartenBild(vonPeer);
            verteileFigurenBilder(vonPeer);
            // Wer spaeter dazukommt, muss den Stand der Zug-Freigabe kennen
            if (zuegeFrei) sendToPlayer(vonPeer, { type: 'mapZugFreigabe', frei: true });
            return true;
    }
    return false;
}

function zeigeKartenHinweis(text) {
    const status = document.getElementById('map-status');
    if (status) status.textContent = text;
    // Ist das Panel zugeklappt, würde die neue Karte sonst unbemerkt bleiben
    const host = document.getElementById('map-host-' + (isGmMode ? 'gm' : 'player'));
    if (host && host.classList.contains('zugeklappt') && typeof showGmMessage === 'function') {
        showGmMessage(`${escapeHtml(text)} — das Kartenfeld ist eingeklappt.`);
    }
}
