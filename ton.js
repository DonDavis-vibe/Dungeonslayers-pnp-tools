// Papier oder Nacht — zwei Belegungen desselben Designs.
//
// Der Bogen ist ein gedrucktes Blatt: helles Papier, schwarze Tinte, ein
// Stempel. Am abgedunkelten Spieltisch blendet das aber, gerade den Spielleiter
// mit dem Dashboard vor der Nase. Deshalb gibt es denselben Bogen auch in
// dunklem Papier — gleiche Typografie, gleiches Raster, gleiche Symbole, nur
// andere Tinte. Umgeschaltet wird ueber <html data-ton="nacht">; die Farben
// selbst stehen komplett in style.css.
//
// Voreinstellung ist bewusst Papier und nicht die Systemvorgabe: das helle
// Blatt IST das Gesicht des Bogens, und wer es dunkel braucht, schaltet einmal
// um — die Wahl bleibt dann gespeichert.

const TON_KEY = 'ds4_ton';
let TON = 'papier';

(function tonBestimmen() {
    try {
        const gespeichert = localStorage.getItem(TON_KEY);
        if (gespeichert === 'nacht' || gespeichert === 'papier') TON = gespeichert;
    } catch (e) { /* Speicher evtl. blockiert */ }
    try { document.documentElement.dataset.ton = TON; } catch (e) { /* egal */ }
})();

function aktuellerTon() { return TON; }

function tonSetzen(ton) {
    if (ton !== 'papier' && ton !== 'nacht') return;
    TON = ton;
    document.documentElement.dataset.ton = ton;
    try { localStorage.setItem(TON_KEY, ton); } catch (e) { /* egal */ }

    // Die Leinwand zeichnet nicht mit CSS, sondern liest die --karte-*-Werte
    // beim Zeichnen aus. Sie muss also aktiv neu gezeichnet werden.
    if (typeof karte !== 'undefined' && karte && typeof karte.zeichnen === 'function') {
        try { karte.zeichnen(); } catch (e) { /* Karte evtl. noch nicht da */ }
    }
    // Die Meta-Farbe der Adressleiste mitziehen
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', ton === 'nacht' ? '#131110' : '#ddd6c6');

    tonschalterAktualisieren();
}

function tonUmschalten() { tonSetzen(TON === 'papier' ? 'nacht' : 'papier'); }

function tonschalterAktualisieren() {
    document.querySelectorAll('[data-ton-toggle]').forEach(b => {
        // Gezeigt wird, wohin es geht: bei Papier der Mond, nachts die Sonne.
        const zielNacht = TON === 'papier';
        b.innerHTML = typeof ico === 'function' ? ico(zielNacht ? 'mond' : 'sonne') : (zielNacht ? 'Nacht' : 'Papier');
        const label = zielNacht ? 'Auf Nachtmodus umstellen' : 'Auf Papier umstellen';
        b.setAttribute('aria-label', label);
        b.title = label;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ton-toggle]').forEach(b => {
        b.addEventListener('click', tonUmschalten);
    });
    tonSetzen(TON);
});
