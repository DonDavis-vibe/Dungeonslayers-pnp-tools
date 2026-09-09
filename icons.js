// Gezeichneter Symbolsatz statt Emoji.
//
// Emoji als Icons waren der lauteste Grund, warum der Bogen "wie jedes
// KI-Produkt" aussah — 353 Stueck quer durch die Oberflaeche. Hier steht
// stattdessen ein eigener Satz: 16x16, reine Striche, 1.4px, runde Enden,
// alles in currentColor. Damit nehmen die Symbole die Tinte der Umgebung an
// und passen zum gedruckten Blatt.
//
// Zwei Wege zur Nutzung:
//   - statisches Markup in index.html:  <svg class="ico"><use href="#i-w20"/></svg>
//   - aus JavaScript heraus:            ico('w20')
// Die <symbol>-Sammlung wird beim Laden einmal in den Body gehaengt.

const DS_ICONS = {
    // Wuerfel & Proben
    w20:      '<path d="M8 1.4 14.2 5v6L8 14.6 1.8 11V5z"/><path d="M8 1.4v13.2M1.8 5l12.4 6M14.2 5 1.8 11"/>',
    wuerfel:  '<rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.2"/><circle cx="5.6" cy="5.6" r=".9" fill="currentColor" stroke="none"/><circle cx="10.4" cy="10.4" r=".9" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r=".9" fill="currentColor" stroke="none"/>',
    stern:    '<path d="M8 1.8 9.9 6l4.3.5-3.2 3 .9 4.3L8 11.7l-3.9 2.1.9-4.3-3.2-3L6.1 6z"/>',
    blitz:    '<path d="M9.2 1.5 3.8 9h3.6l-.6 5.5L12.2 7H8.6z"/>',
    schaedel: '<path d="M8 1.8c3.2 0 5.2 2.2 5.2 5 0 1.9-1 2.9-1.6 3.5-.4.4-.6.8-.6 1.4v.6H5v-.6c0-.6-.2-1-.6-1.4-.6-.6-1.6-1.6-1.6-3.5 0-2.8 2-5 5.2-5z"/><circle cx="6" cy="7.2" r="1.2"/><circle cx="10" cy="7.2" r="1.2"/><path d="M6.4 14.2v-1.9M9.6 14.2v-1.9"/>',
    haken:    '<path d="M2.8 8.4 6.2 12l7-8"/>',
    kreuz:    '<path d="M3.6 3.6l8.8 8.8M12.4 3.6l-8.8 8.8"/>',

    // Kampf
    schwerter:'<path d="M2.2 2.2 9 9M13.8 2.2 7 9"/><path d="M1.6 12.2l2.6 2.6M14.4 12.2l-2.6 2.6"/><path d="M4.4 11.2 2.2 13.4M11.6 11.2l2.2 2.2"/>',
    schild:   '<path d="M8 1.6 13.4 3.6v5c0 3-2.4 5-5.4 5.9C5 13.6 2.6 11.6 2.6 8.6v-5z"/>',
    monster:  '<path d="M2.6 6.2 4 2.6l2.4 2.6M13.4 6.2 12 2.6 9.6 5.2"/><path d="M2.6 7.6c0-2 2.4-3 5.4-3s5.4 1 5.4 3c0 3.4-2.4 6-5.4 6s-5.4-2.6-5.4-6z"/><circle cx="6" cy="8.4" r=".9" fill="currentColor" stroke="none"/><circle cx="10" cy="8.4" r=".9" fill="currentColor" stroke="none"/>',
    sanduhr:  '<path d="M4 1.8h8M4 14.2h8"/><path d="M4.8 1.8v2.4L8 8l-3.2 3.8v2.4M11.2 1.8v2.4L8 8l3.2 3.8v2.4"/>',

    // Personen
    person:   '<circle cx="8" cy="5.2" r="2.7"/><path d="M2.9 14.2c0-2.9 2.3-4.6 5.1-4.6s5.1 1.7 5.1 4.6"/>',
    gruppe:   '<circle cx="6" cy="5.4" r="2.4"/><path d="M1.4 14.2c0-2.6 2-4.2 4.6-4.2s4.6 1.6 4.6 4.2"/><path d="M10.8 3.4a2.4 2.4 0 0 1 0 4M12 10.2c1.6.5 2.6 1.8 2.6 4"/>',
    krone:    '<path d="M2 12.4h12M2.2 12.4 1.4 4.6l3.4 2.6L8 2.4l3.2 4.8 3.4-2.6-.8 7.8z"/>',
    hand:     '<path d="M6 8.4V3.6a1.2 1.2 0 0 1 2.4 0v4.2M8.4 7.8V2.9a1.2 1.2 0 0 1 2.4 0v4.9M10.8 7.8V4.6a1.2 1.2 0 0 1 2.3 0v5.2c0 2.5-1.8 4.4-4.4 4.4-2.5 0-4-1.2-4.9-3.2L2.6 8.8a1.2 1.2 0 0 1 2-1.3z"/>',
    fluestern:'<path d="M2.4 3.4h11.2v7.4H7.8L4.4 13.6v-2.8H2.4z"/><path d="M5.6 6.2h4.8M5.6 8.2h3.2"/>',
    megafon:  '<path d="M2.4 6.4h2.8l6-3.4v10l-6-3.4H2.4z"/><path d="M13 5.6a3.4 3.4 0 0 1 0 4.8"/>',

    // Datei & Ablage
    blatt:    '<path d="M3 1.8h6.4l3.6 3.6v8.8H3z"/><path d="M9.4 1.8v3.6H13M5.4 8.8h5.2M5.4 11h3.6"/>',
    ordner:   '<path d="M1.8 12.8V3.6h4.4l1.6 1.9h6.4v7.3z"/><path d="M1.8 6.4h12.4"/>',
    ausgang:  '<path d="M8 10.6V2.2M5.2 5 8 2.2 10.8 5"/><path d="M2.6 9.8v4h10.8v-4"/>',
    muell:    '<path d="M2.6 4.2h10.8M6 4.2V2.4h4v1.8"/><path d="M3.8 4.2l.8 9.4h6.8l.8-9.4"/><path d="M6.6 6.8v4.2M9.4 6.8v4.2"/>',

    // Verbindung & Ausgabe
    funk:     '<circle cx="8" cy="8" r="1.7"/><path d="M4.4 4.4a5.1 5.1 0 0 0 0 7.2M11.6 4.4a5.1 5.1 0 0 1 0 7.2"/><path d="M2.2 2.2a8.2 8.2 0 0 0 0 11.6M13.8 2.2a8.2 8.2 0 0 1 0 11.6"/>',
    globus:   '<circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4"/><ellipse cx="8" cy="8" rx="2.9" ry="6.2"/>',
    ton:      '<path d="M2.2 6.2h2.6L8 3.2v9.6L4.8 9.8H2.2z"/><path d="M10.6 6a2.8 2.8 0 0 1 0 4M12.6 4a5.4 5.4 0 0 1 0 8"/>',
    note:     '<path d="M6 12.2V3.4l7-1.6v8.8"/><ellipse cx="4.2" cy="12.4" rx="1.9" ry="1.6"/><ellipse cx="11.2" cy="10.8" rx="1.9" ry="1.6"/>',
    tonAus:   '<path d="M2.2 6.2h2.6L8 3.2v9.6L4.8 9.8H2.2z"/><path d="M10.8 6.2l3.4 3.6M14.2 6.2l-3.4 3.6"/>',
    fahne:    '<path d="M3.6 14.2V2.2M3.6 2.6h8.8l-2 2.8 2 2.8H3.6"/>',
    liste:    '<rect x="3.4" y="2.4" width="9.2" height="11.2" rx="1"/><path d="M6 1.6h4v1.8H6z"/><path d="M5.8 7h4.4M5.8 9.6h3"/>',

    // Karte & Werkzeug
    karte:    '<path d="M1.6 3.6 6 2l4 1.9 4.4-1.6v10.1L10 14l-4-1.9-4.4 1.6z"/><path d="M6 2v10.1M10 3.9V14"/>',
    lineal:   '<path d="M1.6 10.4 10.4 1.6l4 4-8.8 8.8z"/><path d="M4.6 7.4 6 8.8M6.8 5.2l1.4 1.4M9 3l1.4 1.4"/>',
    pinsel:   '<path d="M12.6 2.2 6.8 8M3.4 12.6c1-2.6 2.6-3.2 3.8-2 1.2 1.2.6 2.8-2 3.8-.8.3-1.6.4-2.2.4.1-.6.2-1.4.4-2.2z"/><path d="M10.4 1.4 14.6 5.6 9.4 10.8 5.2 6.6z"/>',
    radierer: '<path d="M5.6 13.6H2.4L1.4 10 9 2.4l4.6 4.6z"/><path d="M5.6 13.6h8.8M6.2 5.2l4.6 4.6"/>',
    augeAus:  '<path d="M1.6 8S4.2 3.6 8 3.6c1.1 0 2.1.4 3 .9M14.4 8s-2.6 4.4-6.4 4.4c-1.1 0-2.1-.4-3-.9"/><path d="M2.2 2.2l11.6 11.6"/>',
    raster:   '<rect x="2.2" y="2.2" width="11.6" height="11.6"/><path d="M6.1 2.2v11.6M9.9 2.2v11.6M2.2 6.1h11.6M2.2 9.9h11.6"/>',
    schloss:  '<rect x="3" y="7" width="10" height="7"/><path d="M5.4 7V5a2.6 2.6 0 0 1 5.2 0v2"/>',
    schlossAuf:'<rect x="3" y="7" width="10" height="7"/><path d="M5.4 7V5a2.6 2.6 0 0 1 5.2 0"/>',
    vollbild: '<path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>',
    lampe:    '<path d="M6.2 13.4h3.6M6 11.2c0-1.6-2.4-2.6-2.4-5A4.4 4.4 0 0 1 12.4 6.2c0 2.4-2.4 3.4-2.4 5z"/>',
    nebel:    '<path d="M2 5.6h9M4.4 8.2h9.6M2.4 10.8h7.4M12 10.8h1.8M13 5.6h1"/>',
    rechteck: '<rect x="2.2" y="4" width="11.6" height="8"/>',
    kreis:    '<circle cx="8" cy="8" r="5.6"/>',

    // Steuerung
    abspielen:'<path d="M4.6 2.6 13 8l-8.4 5.4z"/>',
    stopp:    '<rect x="3.4" y="3.4" width="9.2" height="9.2"/>',
    plus:     '<path d="M8 2.8v10.4M2.8 8h10.4"/>',
    zurueck:  '<path d="M13.4 8H2.6M6.4 3.8 2.2 8l4.2 4.2"/>',
    weiter:   '<path d="M2.6 8h10.8M9.6 3.8 13.8 8l-4.2 4.2"/>',
    aufstieg: '<path d="M8 13.6V3M3.8 7.2 8 3l4.2 4.2"/>',

    // Sonstiges
    buch:     '<path d="M2.2 2.6h4.2c.9 0 1.6.7 1.6 1.6v9.2c0-.7-.7-1.3-1.6-1.3H2.2z"/><path d="M13.8 2.6H9.6c-.9 0-1.6.7-1.6 1.6v9.2c0-.7.7-1.3 1.6-1.3h4.2z"/>',
    zahnrad:  '<circle cx="8" cy="8" r="2.4"/><path d="M8 1.4v2M8 12.6v2M1.4 8h2M12.6 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4"/>',
    frage:    '<circle cx="8" cy="8" r="6.2"/><path d="M6.1 6.2A2 2 0 0 1 9.9 7c0 1.4-1.9 1.7-1.9 3"/><circle cx="8" cy="12" r=".8" fill="currentColor" stroke="none"/>',
    bild:     '<rect x="1.8" y="3" width="12.4" height="10"/><circle cx="5.6" cy="6.4" r="1.2"/><path d="M1.8 11 6 7.4l3 2.6 2.4-1.8 2.8 2.4"/>',
    funke:    '<path d="M8 1.8v3.4M8 10.8v3.4M1.8 8h3.4M10.8 8h3.4"/><path d="M3.9 3.9 6 6M10 10l2.1 2.1M12.1 3.9 10 6M6 10l-2.1 2.1"/>',
    speichern:'<path d="M2.4 2.4h9.2l2 2v9.2h-11.2z"/><path d="M5 2.4v4h5.2v-4M5 13.6V9h6v4.6"/>'
};

// Ein Symbol als fertiges SVG-Markup — fuer alles, was JavaScript erzeugt.
function ico(name, extraKlasse) {
    if (!DS_ICONS[name]) return '';
    return '<svg class="ico' + (extraKlasse ? ' ' + extraKlasse : '') +
        '" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>';
}

// Die <symbol>-Sammlung einmal in den Body haengen, damit <use> sie findet.
(function symboleEinhaengen() {
    const bauen = () => {
        if (document.getElementById('ds-symbole')) return;
        const halter = document.createElement('div');
        halter.id = 'ds-symbole';
        halter.setAttribute('aria-hidden', 'true');
        halter.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        halter.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' +
            Object.keys(DS_ICONS).map(n =>
                '<symbol id="i-' + n + '" viewBox="0 0 16 16">' + DS_ICONS[n] + '</symbol>').join('') +
            '</svg>';
        document.body.insertBefore(halter, document.body.firstChild);
    };
    if (document.body) bauen();
    else document.addEventListener('DOMContentLoaded', bauen);
})();
