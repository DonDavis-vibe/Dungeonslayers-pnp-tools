// Dungeonslayers 4 (DS4) - Bestiarium
// Quelle: regeln/Dungeonslayers4.pdf (kostenloses Regelwerk, dungeonslayers.net)
//   - Bestiarium-Vorbemerkungen (Groessenkategorien, Gegnerhaerte,
//     heroische/epische Gegner, Kreaturengruppen, Darstellungsschema):
//                                       PDF S. 114-115 (Buch S. 104-105)
//   - Liste der Kreaturen (alphabetisch): PDF S. 116-135 (Buch S. 106-125)
//
// Alle Beschreibungstexte sind KURZ PARAPHRASIERT (keine Volltext-Uebernahme aus dem
// Regelwerk). Alle Zahlenwerte sind exakt so uebernommen, wie sie im Buch abgedruckt sind;
// wo das Buch keinen Wert angibt (z.B. kein Nahkampfangriff), steht null - es wurde
// NICHTS ergaenzt oder hochgerechnet.
//
// ---------------------------------------------------------------------------
// FELDSATZ DES STATBLOCKS (so wie er im Buch tatsaechlich abgedruckt ist)
//
//   Kopfzeile   : Kreaturengruppen-Symbol + Name
//   Attribute   : KOER / AGI / GEI
//   Eigenschaft : ST / BE / VE  und  HAE / GE / AU
//   Symbolreihe : 6 Felder - Herz = LK, Schild = Abwehr, Stern = Initiative,
//                 Stiefel = Laufen, gekreuzte Schwerter = Schlagen,
//                 gekreuzte Pfeile = Schiessen. Ausgegraute Symbole = kein Wert.
//   Tabelle     : Bewaffnung | Panzerung
//   danach      : besondere Faehigkeiten (fett: Name, danach die Regel)
//   ggf.        : "Zauber"-Block mit Buchsymbol = Zaubern-Wert und
//                 Strahlensymbol = Zielzauber-Wert plus der Spruchliste
//   Fusszeile   : Beute / GH (Gegnerhaerte) / GK (Groessenkategorie) / EP
//
//   WICHTIG: Kreaturen haben KEINE "Stufe". Statt dessen gibt das Buch die
//   Gegnerhaerte (GH) an - die Summe der Charakterstufen, die eine Gruppe
//   zusammen haben sollte, um gegen ein Exemplar eine gute Chance zu haben
//   (PDF S. 114). Sie ist eine Orientierungshilfe, keine Kreaturenstufe.
// ---------------------------------------------------------------------------
//
// DS4_BESTIARIUM
//   name          : Kreaturenbezeichnung
//   kategorie     : Kreaturengruppe - 'Humanoide' | 'Konstrukte' | 'Magische Wesen'
//                   | 'Pflanzenwesen' | 'Tiere' | 'Untote' (PDF S. 115)
//   gh            : Gegnerhaerte (siehe oben)
//   gk            : Groessenkategorie ('winzig'|'klein'|'normal'|'gross'|'riesig'|'gewaltig')
//   ep            : Erfahrungspunkte fuer das Besiegen eines Exemplars
//   lk            : Lebenskraft
//   abwehr        : Abwehr-Wert (Panzerung bereits eingerechnet)
//   initiative    : Initiative (Waffen-/Ruestungsmodifikatoren bereits eingerechnet;
//                   in Einzelfaellen als Rechenausdruck abgedruckt, dann String)
//   laufen        : Laufen in Metern pro Kampfrunde
//   schlagen      : Nahkampfwert, null wenn die Kreatur keinen Nahkampfangriff hat
//   schiessen     : Fernkampfwert, null wenn die Kreatur keinen Fernkampfangriff hat
//   zaubern       : Zaubern-Probenwert, null wenn die Kreatur nicht zaubert
//   zielzauber    : Zielzauber-Probenwert, null wenn die Kreatur keine Zielzauber hat
//   attribute     : { koerper, agilitaet, geist }
//   eigenschaften : { staerke, haerte, bewegung, geschick, verstand, aura }
//   bewaffnung    : abgedruckte Bewaffnung inkl. WB/GA, null wenn keine
//   panzerung     : abgedruckte Panzerung inkl. PA, null wenn keine
//   pa            : Summe der abgedruckten Panzerungswerte, null wenn keine
//   besonderes    : [{ name, detail? }] - besondere Faehigkeiten. Die allgemeine
//                   (paraphrasierte) Regel steht in DS4_KREATUR_FAEHIGKEITEN unter
//                   `name` (bei "Mehrere Angriffe (+N)" unter "Mehrere Angriffe");
//                   `detail` ist der kreaturenspezifische Zusatz, sofern vorhanden.
//   zauber        : Liste der beherrschten Zaubersprueche, null wenn keine
//   herstellung   : { kosten (GM), handwerk } bei magischen Konstrukten, sonst null
//   beute         : abgedruckter Beute-/Trophaeen-Eintrag (Beutetabellen-Kuerzel), null wenn keiner
//   seite         : PDF-Seite des Eintrags (Buchseite = PDF-Seite - 10)
//
// SKALIERUNG (PDF S. 115): heroische Gegner haben LK x 5, Abwehr +2, 1 Angriff +2;
// epische Gegner LK x 10, Abwehr +4, 1 Angriff +4. Die EP werden dabei zuerst um
// (4 + zusaetzliche LK) erhoeht und danach verdoppelt.
// ---------------------------------------------------------------------------
//
// Dungeonslayers wurde geschaffen von Christian Kennig ((c) 2011, Burning Books, Berlin).
// Texte und Regelmechaniken stehen unter CC BY-NC-SA 4.0 - diese abgeleitete Datei
// daher ebenfalls: https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de

const DS4_KREATUR_GRUPPEN = ['Humanoide', 'Konstrukte', 'Magische Wesen',
    'Pflanzenwesen', 'Tiere', 'Untote'];

// Groessenkategorien (PDF S. 114). Groessere Gegner sind leichter zu treffen (+2 je
// Kategorie), kleinere schwerer (-2 je Kategorie) - siehe PDF S. 54.
const DS4_GROESSENKATEGORIEN = {
    winzig:   { name: 'winzig',   bereich: 'unter 0,5 m' },
    klein:    { name: 'klein',    bereich: '0,5 - 1 m' },
    normal:   { name: 'normal',   bereich: '1 - 3 m' },
    gross:    { name: 'groß',     bereich: '3 - 6 m' },
    riesig:   { name: 'riesig',   bereich: '6 - 12 m' },
    gewaltig: { name: 'gewaltig', bereich: 'über 12 m' }
};


// Glossar der besonderen Kreaturenfaehigkeiten (kurz paraphrasiert).
const DS4_KREATUR_FAEHIGKEITEN = {
    'Alterung': 'Ein Treffer lässt das Ziel altern.',
    'Anfällig': 'Erhält doppelten Schaden durch eine bestimmte Schadensart.',
    'Angst': 'Erzeugt 1x pro Kampf aktionsfrei auf Sicht Angst; wem GEI+VE+Stufe misslingt, ist eingeschüchtert (Malus auf alle Proben), bei einem Patzer ergreift er die Flucht.',
    'Antimagie': 'Sämtliche fremde Magie im Umkreis ist wirkungslos; die eigene Magie der Kreatur bleibt wirksam.',
    'Befreien': 'Regelt, wie ein umschlungenes bzw. verschlungenes Opfer sich wieder befreien kann.',
    'Bezaubern': 'Kann Gegner mit einem Lockruf bezaubern (siehe Zauber).',
    'Blickangriff': 'Greift aktionsfrei jeden mit dem Blick an, dem GEI+AU misslingt. Wer den Blick meidet, erhält -4 auf alle Proben, ist aber kein Ziel mehr.',
    'Dunkelsicht': 'Sieht auch in völliger Dunkelheit.',
    'Fliegen': 'Kann statt zu laufen mit doppeltem Laufen-Wert fliegen (rennend Laufen x 4).',
    'Geistesimmun': 'Immun gegen geistesbeeinflussende Effekte und entsprechend gekennzeichnete Zauber.',
    'Gift': 'Verursachter Schaden zwingt das Ziel zu einer "Gift trotzen"-Probe, sonst wirkt das Gift nach.',
    'Kletterläufer': 'Klettert aktionsfrei mit normaler Laufen-Geschwindigkeit an Wänden und Decken.',
    'Lähmungseffekt': 'Ein Sonderangriff macht das Ziel bewegungsunfähig, sofern ihm KÖR+ST misslingt.',
    'Mehrere Angriffe': 'Kann pro Runde zusätzliche Angriffe aktionsfrei ausführen (Anzahl in Klammern).',
    'Mehrere Angriffsglieder': 'Greift mit mehreren Gliedern gleichzeitig an; ein gegnerischer Schlagen-Immersieg trennt eines ab und senkt die Angriffsanzahl.',
    'Nachtsicht': 'Sieht bei einem Mindestmaß an Licht wie am hellen Tag.',
    'Natürliche Waffen': 'Bei einem Schlagen-Patzer gegen einen Bewaffneten wird dessen Waffe getroffen; der Angegriffene erhält aktionsfrei einen Gegenangriff.',
    'Nur durch Magie verletzbar': 'Nur magische Waffen und Zauber richten Schaden an (Anfälligkeiten ausgenommen).',
    'Odem': 'Odemangriff (Schießen), nur alle W20 Runden einsetzbar; erzeugt nicht abwehrbaren Schaden in einem Kegel, gegen den nur magische Abwehrboni zählen.',
    'Regeneration': 'Regeneriert jede Kampfrunde aktionsfrei LK (Probe mit PW = KÖR); Feuer- und Säureschaden ist nicht regenerierbar.',
    'Rost': 'Jeder Treffer senkt die PA eines zufälligen metallischen, nichtmagischen Rüstungsteils um 1 (analog der WB treffender Metallwaffen).',
    'Schleudern': 'Ein Schlagen-Immersieg schleudert ein gleich großes oder kleineres Ziel Schaden/3 Meter fort; es erleidet Sturzschaden und liegt danach am Boden.',
    'Schwarm': 'Gilt als einzelner Gegner. Der Schwarmwert (SCW) = Mitgliederanzahl/10 (max. 20); pro 1 LK Schaden sterben 10 Mitglieder. Schlagen, Abwehr und LK entsprechen dem aktuellen SCW.',
    'Schweben': 'Kann statt zu laufen schweben (rennend Laufen x 2).',
    'Schwimmen': 'Kann schwimmen bzw. sich im Wasser normal fortbewegen.',
    'Sonar': 'Orientiert sich per Sonar statt per Sicht.',
    'Sturmangriff': 'Wird mindestens die Laufen-Distanz gerannt, ist in derselben Runde noch ein Angriff mit Schlagen + KÖR möglich.',
    'Sturzangriff': 'Wird fliegend mindestens Laufen x 2 "rennend" zurückgelegt, ist während der Bewegung noch ein Angriff mit Schlagen + KÖR möglich.',
    'Totenkraft': 'Erhält GEI+AU als Bonus auf Stärke und Härte.',
    'Umschlingen': 'Ein Schlagen-Immersieg umschlingt ein kleineres Ziel: fester Schaden pro Runde, keine freie Bewegung, -2 auf alle Proben je Größenunterschied.',
    'Verschlingen': 'Ein Schlagen-Immersieg verschlingt ein 2+ Kategorien kleineres Ziel: 1 nicht abwehrbarer Schaden pro Runde und -8 auf alle Proben.',
    'Versteinern': 'Ein erfolgreicher Blickangriff versteinert das Ziel, sofern ihm KÖR+AU misslingt; nur der Zauber Allheilung hebt dies auf.',
    'Werteverlust': 'Jeder schadensverursachende Treffer senkt ein Attribut des Opfers um 1; Allheilung stellt je 1 Punkt wieder her.',
    'Wesen der Dunkelheit (Settingoption)': 'Gilt in den meisten Settings als Wesen der Dunkelheit; entsprechende Regeln greifen.',
    'Wesen der Dunkelheit / Wesen des Lichts (Settingoption)': 'Gilt je nach Setting als Wesen der Dunkelheit oder des Lichts; entsprechende Regeln greifen.',
    'Wesen des Lichts (Settingoption)': 'Gilt in den meisten Settings als Wesen des Lichts; entsprechende Regeln greifen.',
    'Zauber': 'Beherrscht Zaubersprüche (siehe Feld "zauber"; Probenwerte in "zaubern"/"zielzauber").',
    'Zerstampfen': 'Ein Angriff pro Runde mit -6 (je Größenunterschied um 2 gemindert) gegen ein kleineres Ziel verursacht nicht abwehrbaren Schaden.'
};

const DS4_BESTIARIUM = [
    {
        name: 'Adler',
        kategorie: 'Tiere',
        gh: 1, gk: 'klein', ep: 52,
        lk: 7, abwehr: 4, initiative: 11, laufen: 5,
        schlagen: 5, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 3, agilitaet: 8, geist: 1 },
        eigenschaften: { staerke: 1, haerte: 0, bewegung: 3, geschick: 1, verstand: 0, aura: 1 },
        bewaffnung: 'Krallen (WB+1)',
        panzerung: 'Federkleid (PA+1)', pa: 1,
        besonderes: [
            { name: 'Fliegen' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturzangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:11)',
        seite: 116
    },
    {
        name: 'Alligator',
        kategorie: 'Tiere',
        gh: 10, gk: 'gross', ep: 151,
        lk: 78, abwehr: 18, initiative: 15, laufen: 9,
        schlagen: 16, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 12, agilitaet: 10, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 4, bewegung: 5, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Großer Biss (WB+2; GA -2)',
        panzerung: 'Schuppenpanzer (PA+2)', pa: 2,
        besonderes: [
            { name: 'Natürliche Waffen' },
            { name: 'Schwimmen' },
            { name: 'Sturmangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:14)',
        seite: 116
    },
    {
        name: 'Augenball',
        kategorie: 'Magische Wesen',
        gh: 23, gk: 'gross', ep: 255,
        lk: 88, abwehr: 14, initiative: 4, laufen: 3,
        schlagen: null, schiessen: null, zaubern: 13, zielzauber: 12,
        attribute: { koerper: 8, agilitaet: 4, geist: 10 },
        eigenschaften: { staerke: 0, haerte: 4, bewegung: 0, geschick: 2, verstand: 2, aura: 3 },
        bewaffnung: null,
        panzerung: 'Warzenhaut (PA+2)', pa: 2,
        besonderes: [
            { name: 'Antimagie', detail: 'Radius 10m' },
            { name: 'Dunkelsicht' },
            { name: 'Mehrere Angriffe (+4)', detail: '4 zusätzliche Zaubersprüche pro Runde (jeder nur einmal)' },
            { name: 'Mehrere Angriffsglieder', detail: '5 von 10 Augen greifen gleichzeitig an' },
            { name: 'Schweben' },
            { name: 'Wesen der Dunkelheit (Settingoption)' },
            { name: 'Zauber' }
        ],
        zauber: ['Blenden', 'Einschläfern', 'Gehorche', 'Kettenblitz (Zielzauber 15)', 'Schleudern', 'Schutzfeld', 'Schutzschild', 'Telekinese', 'Unsichtbarkeit', 'Verwirren'],
        herstellung: null,
        beute: 'BW #5A:20, #5M:20',
        seite: 116
    },
    {
        name: 'Bär',
        kategorie: 'Tiere',
        gh: 9, gk: 'gross', ep: 139,
        lk: 75, abwehr: 16, initiative: 12, laufen: 8,
        schlagen: 17, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 12, agilitaet: 8, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 3, bewegung: 4, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Pranke (WB +2; GA -2)',
        panzerung: 'Fell (PA+1)', pa: 1,
        besonderes: [
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:16)',
        seite: 116
    },
    {
        name: 'Basilisk',
        kategorie: 'Magische Wesen',
        gh: 18, gk: 'gross', ep: 206,
        lk: 168, abwehr: 20, initiative: 10, laufen: 7,
        schlagen: 19, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 14, agilitaet: 7, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 4, bewegung: 3, geschick: 0, verstand: 0, aura: 1 },
        bewaffnung: 'Großer Biss (WB+2; GA -2)',
        panzerung: 'Schuppenpanzer (PA+2)', pa: 2,
        besonderes: [
            { name: 'Blickangriff' },
            { name: 'Nachtsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Versteinern' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 2A:20)',
        seite: 117
    },
    {
        name: 'Baumherr',
        kategorie: 'Pflanzenwesen',
        gh: 23, gk: 'gross', ep: 158,
        lk: 70, abwehr: 27, initiative: 1, laufen: 3.5,
        schlagen: 27, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 20, agilitaet: 1, geist: 1 },
        eigenschaften: { staerke: 5, haerte: 5, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Asthiebe (WB+2)',
        panzerung: 'Dicke Rinde (PA+2)', pa: 2,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Feuer' },
            { name: 'Mehrere Angriffe (+3)' },
            { name: 'Nachtsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Schleudern' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Lediglich Brennholz',
        seite: 117
    },
    {
        name: 'Niederer Dämon',
        kategorie: 'Magische Wesen',
        gh: 1, gk: 'klein', ep: 71,
        lk: 9, abwehr: 9, initiative: 7, laufen: 3.5,
        schlagen: 8, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 5, agilitaet: 5, geist: 5 },
        eigenschaften: { staerke: 2, haerte: 2, bewegung: 2, geschick: 2, verstand: 2, aura: 2 },
        bewaffnung: 'Pranke (WB+1; GA -1)',
        panzerung: 'Dämonenhaut (PA+2)', pa: 2,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 117
    },
    {
        name: 'Hoher Dämon',
        kategorie: 'Magische Wesen',
        gh: 4, gk: 'normal', ep: 104,
        lk: 20, abwehr: 12, initiative: 10, laufen: 4.5,
        schlagen: 12, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 7, agilitaet: 7, geist: 6 },
        eigenschaften: { staerke: 3, haerte: 3, bewegung: 3, geschick: 3, verstand: 3, aura: 3 },
        bewaffnung: 'Pranke (WB+2; GA -2)',
        panzerung: 'Dämonenhaut (PA+2)', pa: 2,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 117
    },
    {
        name: 'Kampfdämon',
        kategorie: 'Magische Wesen',
        gh: 8, gk: 'gross', ep: 152,
        lk: 46, abwehr: 15, initiative: 12, laufen: 6,
        schlagen: 16, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 9, agilitaet: 8, geist: 8 },
        eigenschaften: { staerke: 4, haerte: 4, bewegung: 4, geschick: 4, verstand: 4, aura: 4 },
        bewaffnung: 'Pranke (WB+3; GA -3)',
        panzerung: 'Dämonenhaut (PA+2)', pa: 2,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 117
    },
    {
        name: 'Kriegsdämon',
        kategorie: 'Magische Wesen',
        gh: 23, gk: 'riesig', ep: 297,
        lk: 160, abwehr: 24, initiative: 15, laufen: 8,
        schlagen: 26, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 15, agilitaet: 10, geist: 10 },
        eigenschaften: { staerke: 7, haerte: 7, bewegung: 5, geschick: 5, verstand: 5, aura: 5 },
        bewaffnung: 'Pranke (WB+4; GA -4)',
        panzerung: 'Dämonenhaut (PA+2)', pa: 2,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 118
    },
    {
        name: 'Dämonenfürst',
        kategorie: 'Magische Wesen',
        gh: 42, gk: 'gewaltig', ep: 579,
        lk: 400, abwehr: 32, initiative: 30, laufen: 16,
        schlagen: 35, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 20, agilitaet: 20, geist: 10 },
        eigenschaften: { staerke: 10, haerte: 10, bewegung: 10, geschick: 10, verstand: 5, aura: 5 },
        bewaffnung: 'Pranke (WB+5; GA -5)',
        panzerung: 'Dämonenhaut (PA+2)', pa: 2,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 118
    },
    {
        name: 'Drachenwelpe',
        kategorie: 'Magische Wesen',
        gh: 18, gk: 'gross', ep: 255,
        lk: 63, abwehr: 14, initiative: 14, laufen: 10,
        schlagen: 14, schiessen: 17, zaubern: null, zielzauber: null,
        attribute: { koerper: 9, agilitaet: 11, geist: 5 },
        eigenschaften: { staerke: 2, haerte: 2, bewegung: 3, geschick: 3, verstand: 1, aura: 2 },
        bewaffnung: 'Mehrere Angriffe; WB+3; GA-2',
        panzerung: 'Drachenschuppen (PA+3)', pa: 3,
        besonderes: [
            { name: 'Angst' },
            { name: 'Befreien' },
            { name: 'Dunkelsicht' },
            { name: 'Fliegen' },
            { name: 'Mehrere Angriffe (+1)' },
            { name: 'Natürliche Waffen' },
            { name: 'Odem' },
            { name: 'Schleudern' },
            { name: 'Sturzangriff' },
            { name: 'Verschlingen' },
            { name: 'Wesen der Dunkelheit / Wesen des Lichts (Settingoption)' },
            { name: 'Zerstampfen' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 2A:W20+10)',
        seite: 118
    },
    {
        name: 'Jungdrache',
        kategorie: 'Magische Wesen',
        gh: 36, gk: 'riesig', ep: 481,
        lk: 225, abwehr: 24, initiative: 15, laufen: 12.5,
        schlagen: 24, schiessen: 19, zaubern: null, zielzauber: null,
        attribute: { koerper: 16, agilitaet: 12, geist: 7 },
        eigenschaften: { staerke: 4, haerte: 4, bewegung: 3, geschick: 3, verstand: 2, aura: 2 },
        bewaffnung: 'Mehrere Angriffe; WB+4; GA-4',
        panzerung: 'Drachenschuppen (PA+4)', pa: 4,
        besonderes: [
            { name: 'Angst' },
            { name: 'Befreien' },
            { name: 'Dunkelsicht' },
            { name: 'Fliegen' },
            { name: 'Mehrere Angriffe (+1)' },
            { name: 'Natürliche Waffen' },
            { name: 'Odem' },
            { name: 'Schleudern' },
            { name: 'Sturzangriff' },
            { name: 'Verschlingen' },
            { name: 'Wesen der Dunkelheit / Wesen des Lichts (Settingoption)' },
            { name: 'Zerstampfen' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 4A:W20+10), BW #(A:W20+10)x10, #8M:19',
        seite: 118
    },
    {
        name: 'Erwachsener Drache',
        kategorie: 'Magische Wesen',
        gh: 63, gk: 'gewaltig', ep: 907,
        lk: 600, abwehr: 35, initiative: 20, laufen: 20,
        schlagen: 35, schiessen: 25, zaubern: null, zielzauber: null,
        attribute: { koerper: 24, agilitaet: 16, geist: 10 },
        eigenschaften: { staerke: 6, haerte: 6, bewegung: 4, geschick: 4, verstand: 2, aura: 3 },
        bewaffnung: 'Mehrere Angriffe; WB+5; GA-5',
        panzerung: 'Drachenschuppen (PA+5)', pa: 5,
        besonderes: [
            { name: 'Angst' },
            { name: 'Befreien' },
            { name: 'Dunkelsicht' },
            { name: 'Fliegen' },
            { name: 'Mehrere Angriffe (+1)' },
            { name: 'Natürliche Waffen' },
            { name: 'Odem' },
            { name: 'Schleudern' },
            { name: 'Sturzangriff' },
            { name: 'Verschlingen' },
            { name: 'Wesen der Dunkelheit / Wesen des Lichts (Settingoption)' },
            { name: 'Zerstampfen' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 8A:W20+10), BW #(A:W20+10)x10, #12M:20',
        seite: 119
    },
    {
        name: 'Echsenmensch',
        kategorie: 'Humanoide',
        gh: 3, gk: 'normal', ep: 71,
        lk: 21, abwehr: 14, initiative: 8, laufen: 5,
        schlagen: 14, schiessen: 11, zaubern: null, zielzauber: null,
        attribute: { koerper: 9, agilitaet: 8, geist: 3 },
        eigenschaften: { staerke: 4, haerte: 2, bewegung: 0, geschick: 2, verstand: 2, aura: 0 },
        bewaffnung: 'Speer (WB +1)',
        panzerung: 'Schuppenpanzer (PA+1)', pa: 1,
        besonderes: [
            { name: 'Nachtsicht' },
            { name: 'Schleudern' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'BW 1B:12, #2B:17',
        seite: 119
    },
    {
        name: 'Einhorn',
        kategorie: 'Magische Wesen',
        gh: 9, gk: 'gross', ep: 189,
        lk: 63, abwehr: 11, initiative: 19, laufen: 11,
        schlagen: 12, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 9, agilitaet: 13, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 2, bewegung: 6, geschick: 0, verstand: 1, aura: 1 },
        bewaffnung: 'Mehrere Angriffe; WB+1; GA-2',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Angst' },
            { name: 'Geistesimmun' },
            { name: 'Mehrere Angriffe (+1)' },
            { name: 'Nachtsicht' },
            { name: 'Schleudern' },
            { name: 'Sturmangriff' },
            { name: 'Wesen des Lichts (Settingoption)' },
            { name: 'Zauber' }
        ],
        zauber: ['Spurt (jederzeit aktionsfrei und ohne Probe)'],
        herstellung: null,
        beute: 'BW 1B:12, #2B:17',
        seite: 119
    },
    {
        name: 'Erdelementar I',
        kategorie: 'Magische Wesen',
        gh: 8, gk: 'klein', ep: 44,
        lk: 13, abwehr: 20, initiative: 3, laufen: 2,
        schlagen: 19, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 12, agilitaet: 2, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 4, bewegung: 1, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Steinpranke (WB+4)',
        panzerung: 'Steinwesen (PA+4)', pa: 4,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Blitz-, Sturm- und Windangriffe' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 120
    },
    {
        name: 'Erdelementar II',
        kategorie: 'Magische Wesen',
        gh: 15, gk: 'normal', ep: 70,
        lk: 32, abwehr: 26, initiative: 3, laufen: 2,
        schlagen: 25, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 17, agilitaet: 2, geist: 1 },
        eigenschaften: { staerke: 4, haerte: 5, bewegung: 1, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Steinpranke (WB+4)',
        panzerung: 'Steinwesen (PA+4)', pa: 4,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Blitz-, Sturm- und Windangriffe' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 120
    },
    {
        name: 'Erdelementar III',
        kategorie: 'Magische Wesen',
        gh: 23, gk: 'gross', ep: 124,
        lk: 78, abwehr: 33, initiative: 3, laufen: 2.5,
        schlagen: 31, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 22, agilitaet: 2, geist: 1 },
        eigenschaften: { staerke: 5, haerte: 7, bewegung: 1, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Steinpranke (WB+4)',
        panzerung: 'Steinwesen (PA+4)', pa: 4,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Blitz-, Sturm- und Windangriffe' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 120
    },
    {
        name: 'Feuerelementar I',
        kategorie: 'Magische Wesen',
        gh: 9, gk: 'klein', ep: 70,
        lk: 12, abwehr: 22, initiative: 5, laufen: 3.5,
        schlagen: 14, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 9, agilitaet: 5, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 5, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Flammenhieb (WB+2)',
        panzerung: 'Keine feste Gestalt (PA+8)', pa: 8,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Eis-, Frost- und Wasserangriffe' },
            { name: 'Fliegen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 120
    },
    {
        name: 'Feuerelementar II',
        kategorie: 'Magische Wesen',
        gh: 15, gk: 'normal', ep: 95,
        lk: 29, abwehr: 27, initiative: 6, laufen: 4,
        schlagen: 18, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 13, agilitaet: 6, geist: 1 },
        eigenschaften: { staerke: 4, haerte: 6, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Flammenhieb (WB+3)',
        panzerung: 'Keine feste Gestalt (PA+8)', pa: 8,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Eis-, Frost- und Wasserangriffe' },
            { name: 'Fliegen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 120
    },
    {
        name: 'Feuerelementar III',
        kategorie: 'Magische Wesen',
        gh: 24, gk: 'gross', ep: 145,
        lk: 70, abwehr: 33, initiative: 6, laufen: 4.5,
        schlagen: 28, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 18, agilitaet: 6, geist: 1 },
        eigenschaften: { staerke: 6, haerte: 7, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Flammenhieb (WB+4)',
        panzerung: 'Keine feste Gestalt (PA+8)', pa: 8,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Eis-, Frost- und Wasserangriffe' },
            { name: 'Fliegen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 121
    },
    {
        name: 'Luftelementar I',
        kategorie: 'Magische Wesen',
        gh: 4, gk: 'klein', ep: 68,
        lk: 10, abwehr: 17, initiative: 8, laufen: 5,
        schlagen: 9, schiessen: 12, zaubern: null, zielzauber: null,
        attribute: { koerper: 6, agilitaet: 8, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 3, bewegung: 0, geschick: 3, verstand: 0, aura: 0 },
        bewaffnung: 'Luftstoß (WB+1; -1/2m)',
        panzerung: 'Keine feste Gestalt (PA+8)', pa: 8,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Erd-, Fels- und Steinangriffe' },
            { name: 'Fliegen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 121
    },
    {
        name: 'Luftelementar II',
        kategorie: 'Magische Wesen',
        gh: 9, gk: 'normal', ep: 92,
        lk: 25, abwehr: 23, initiative: 9, laufen: 5.5,
        schlagen: 14, schiessen: 14, zaubern: null, zielzauber: null,
        attribute: { koerper: 10, agilitaet: 9, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 5, bewegung: 0, geschick: 3, verstand: 0, aura: 0 },
        bewaffnung: 'Luftstoß (WB+2; -1/2m)',
        panzerung: 'Keine feste Gestalt (PA+8)', pa: 8,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Erd-, Fels- und Steinangriffe' },
            { name: 'Fliegen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 121
    },
    {
        name: 'Luftelementar III',
        kategorie: 'Magische Wesen',
        gh: 16, gk: 'gross', ep: 143,
        lk: 64, abwehr: 30, initiative: 9, laufen: 6,
        schlagen: 21, schiessen: 17, zaubern: null, zielzauber: null,
        attribute: { koerper: 15, agilitaet: 9, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 7, bewegung: 0, geschick: 4, verstand: 0, aura: 0 },
        bewaffnung: 'Luftstoß (WB+4; -1/2m)',
        panzerung: 'Keine feste Gestalt (PA+8)', pa: 8,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Erd-, Fels- und Steinangriffe' },
            { name: 'Fliegen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 121
    },
    {
        name: 'Wasserelementar I',
        kategorie: 'Magische Wesen',
        gh: 3, gk: 'klein', ep: 60,
        lk: 10, abwehr: 17, initiative: 8, laufen: 5,
        schlagen: 11, schiessen: 12, zaubern: null, zielzauber: null,
        attribute: { koerper: 6, agilitaet: 8, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 3, bewegung: 0, geschick: 2, verstand: 0, aura: 0 },
        bewaffnung: 'Wasserstrahl (WB+2; -1/2m)',
        panzerung: 'Keine feste Gestalt (PA+8)', pa: 8,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Feuerangriffe' },
            { name: 'Schwimmen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 121
    },
    {
        name: 'Wasserelementar II',
        kategorie: 'Magische Wesen',
        gh: 9, gk: 'normal', ep: 83,
        lk: 24, abwehr: 22, initiative: 8, laufen: 5,
        schlagen: 18, schiessen: 14, zaubern: null, zielzauber: null,
        attribute: { koerper: 11, agilitaet: 8, geist: 1 },
        eigenschaften: { staerke: 4, haerte: 3, bewegung: 0, geschick: 3, verstand: 0, aura: 0 },
        bewaffnung: 'Wasserstrahl (WB+3; -1/2m)',
        panzerung: 'Keine feste Gestalt (PA+8)', pa: 8,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Feuerangriffe' },
            { name: 'Schwimmen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 121
    },
    {
        name: 'Wasserelementar III',
        kategorie: 'Magische Wesen',
        gh: 16, gk: 'gross', ep: 133,
        lk: 62, abwehr: 29, initiative: 9, laufen: 6,
        schlagen: 24, schiessen: 17, zaubern: null, zielzauber: null,
        attribute: { koerper: 15, agilitaet: 9, geist: 1 },
        eigenschaften: { staerke: 5, haerte: 6, bewegung: 0, geschick: 4, verstand: 0, aura: 0 },
        bewaffnung: 'Wasserstrahl (WB+4; -1/2m)',
        panzerung: 'Keine feste Gestalt (PA+8)', pa: 8,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Feuerangriffe' },
            { name: 'Schwimmen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 122
    },
    {
        name: 'Eulerich',
        kategorie: 'Magische Wesen',
        gh: 11, gk: 'gross', ep: 115,
        lk: 54, abwehr: 18, initiative: 9, laufen: 4.5,
        schlagen: 20, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 14, agilitaet: 6, geist: 1 },
        eigenschaften: { staerke: 4, haerte: 3, bewegung: 3, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Pranke (WB+2; GA-2)',
        panzerung: 'Federkleid (PA+1)', pa: 1,
        besonderes: [
            { name: 'Dunkelsicht' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:14)',
        seite: 122
    },
    {
        name: 'Fliegendes Schwert',
        kategorie: 'Konstrukte',
        gh: 8, gk: 'klein', ep: 57,
        lk: 12, abwehr: 19, initiative: 5, laufen: 3.5,
        schlagen: 16, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 10, agilitaet: 5, geist: 0 },
        eigenschaften: { staerke: 4, haerte: 4, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Langschwert (WB+2)',
        panzerung: 'Metallwesen (PA+5)', pa: 5,
        besonderes: [
            { name: 'Fliegen' }
        ],
        zauber: null,
        herstellung: { kosten: 1513, handwerk: 'Waffenschmied' },
        beute: null,
        seite: 122
    },
    {
        name: 'Gargyl',
        kategorie: 'Magische Wesen',
        gh: 6, gk: 'klein', ep: 91,
        lk: 10, abwehr: 13, initiative: 8, laufen: 4.5,
        schlagen: 11, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 7, agilitaet: 7, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 2, bewegung: 1, geschick: 2, verstand: 0, aura: 1 },
        bewaffnung: 'Steinklaue (WB+2)',
        panzerung: 'Steinwesen (PA+4)', pa: 4,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Feuer' },
            { name: 'Dunkelsicht' },
            { name: 'Fliegen' },
            { name: 'Geistesimmun' },
            { name: 'Kletterläufer' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturzangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:8)',
        seite: 122
    },
    {
        name: 'Geist',
        kategorie: 'Untote',
        gh: 17, gk: 'normal', ep: 245,
        lk: 27, abwehr: 25, initiative: 11, laufen: 6.5,
        schlagen: 19, schiessen: null, zaubern: 16, zielzauber: null,
        attribute: { koerper: 1, agilitaet: 11, geist: 10 },
        eigenschaften: { staerke: 16, haerte: 16, bewegung: 0, geschick: 2, verstand: 3, aura: 6 },
        bewaffnung: 'Geisterklaue (WB+2; GA-2)',
        panzerung: 'Körperlos (PA+8)', pa: 8,
        besonderes: [
            { name: 'Alterung', detail: 'Ziel altert 1 Jahr pro erlittenem Schadenspunkt' },
            { name: 'Angst' },
            { name: 'Fliegen' },
            { name: 'Geistesimmun' },
            { name: 'Nur durch Magie verletzbar' },
            { name: 'Totenkraft' },
            { name: 'Wesen der Dunkelheit / Wesen des Lichts (Settingoption)' },
            { name: 'Zauber' }
        ],
        zauber: ['Terror'],
        herstellung: null,
        beute: null,
        seite: 123
    },
    {
        name: 'Goblin',
        kategorie: 'Humanoide',
        gh: 1, gk: 'klein', ep: 42,
        lk: 8, abwehr: 7, initiative: 9, laufen: 4.5,
        schlagen: 7, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 5, agilitaet: 7, geist: 3 },
        eigenschaften: { staerke: 2, haerte: 1, bewegung: 2, geschick: 2, verstand: 1, aura: 0 },
        bewaffnung: 'Ast/Messer (WB+0)',
        panzerung: 'Fellflicken (PA+1)', pa: 1,
        besonderes: [
            { name: 'Nachtsicht' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'BW 1B:10',
        seite: 123
    },
    {
        name: 'Golem, Eisen-',
        kategorie: 'Konstrukte',
        gh: 27, gk: 'gross', ep: 173,
        lk: 72, abwehr: 31, initiative: 7, laufen: 4,
        schlagen: 31, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 20, agilitaet: 5, geist: 0 },
        eigenschaften: { staerke: 5, haerte: 6, bewegung: 2, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Eisenpranke (WB+6)',
        panzerung: 'Metallwesen (PA+5)', pa: 5,
        besonderes: [
            { name: 'Zerstampfen' }
        ],
        zauber: null,
        herstellung: { kosten: 3750, handwerk: 'Rüstungsschmied' },
        beute: null,
        seite: 123
    },
    {
        name: 'Golem, Knochen-',
        kategorie: 'Konstrukte',
        gh: 11, gk: 'gross', ep: 148,
        lk: 40, abwehr: 10, initiative: 18, laufen: 7.5,
        schlagen: 17, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 10, agilitaet: 12, geist: 0 },
        eigenschaften: { staerke: 5, haerte: 0, bewegung: 6, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Knochenpranke (WB+2)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Mehrere Angriffe (+3)' },
            { name: 'Mehrere Angriffsglieder', detail: '4 Arme' }
        ],
        zauber: null,
        herstellung: { kosten: 2613, handwerk: 'Schreinern' },
        beute: null,
        seite: 124
    },
    {
        name: 'Golem, Kristall-',
        kategorie: 'Konstrukte',
        gh: 10, gk: 'gross', ep: 134,
        lk: 42, abwehr: 14, initiative: 10, laufen: 6.5,
        schlagen: 13, schiessen: null, zaubern: null, zielzauber: 12,
        attribute: { koerper: 8, agilitaet: 10, geist: 4 },
        eigenschaften: { staerke: 3, haerte: 3, bewegung: 0, geschick: 5, verstand: 0, aura: 0 },
        bewaffnung: 'Kristallpranke (WB+2)',
        panzerung: 'Kristallwesen (PA+3)', pa: 3,
        besonderes: [
            { name: 'Zauber' }
        ],
        zauber: ['Blitz'],
        herstellung: { kosten: 2513, handwerk: 'Steinmetz' },
        beute: null,
        seite: 124
    },
    {
        name: 'Golem, Lehm-',
        kategorie: 'Konstrukte',
        gh: 8, gk: 'gross', ep: 110,
        lk: 46, abwehr: 13, initiative: 8, laufen: 4.5,
        schlagen: 16, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 10, agilitaet: 6, geist: 4 },
        eigenschaften: { staerke: 3, haerte: 3, bewegung: 2, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Lehmpranke (WB+3)',
        panzerung: null, pa: null,
        besonderes: [],
        zauber: null,
        herstellung: { kosten: 2338, handwerk: 'Steinmetz' },
        beute: null,
        seite: 124
    },
    {
        name: 'Golem, Stein-',
        kategorie: 'Konstrukte',
        gh: 23, gk: 'gross', ep: 160,
        lk: 66, abwehr: 28, initiative: 6, laufen: 3.5,
        schlagen: 26, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 18, agilitaet: 4, geist: 4 },
        eigenschaften: { staerke: 4, haerte: 5, bewegung: 0, geschick: 2, verstand: 0, aura: 0 },
        bewaffnung: 'Steinpranke (WB+4)',
        panzerung: 'Steinwesen (PA+4)', pa: 4,
        besonderes: [
            { name: 'Zerstampfen' }
        ],
        zauber: null,
        herstellung: { kosten: 3338, handwerk: 'Steinmetz' },
        beute: null,
        seite: 124
    },
    {
        name: 'Harpyie',
        kategorie: 'Magische Wesen',
        gh: 10, gk: 'normal', ep: 128,
        lk: 20, abwehr: 11, initiative: 8, laufen: 4,
        schlagen: 12, schiessen: null, zaubern: 8, zielzauber: null,
        attribute: { koerper: 8, agilitaet: 6, geist: 6 },
        eigenschaften: { staerke: 2, haerte: 2, bewegung: 2, geschick: 1, verstand: 1, aura: 2 },
        bewaffnung: 'Krallenklaue (WB+2)',
        panzerung: 'Federkleid (PA+1)', pa: 1,
        besonderes: [
            { name: 'Bezaubern' },
            { name: 'Fliegen' },
            { name: 'Nachtsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturzangriff' },
            { name: 'Zauber' }
        ],
        zauber: ['Lockruf (wirkt wie Gehorche; Abklingzeit 10 Kampfrunden)'],
        herstellung: null,
        beute: 'Trophäe (BW 1A:8)',
        seite: 125
    },
    {
        name: 'Hai',
        kategorie: 'Tiere',
        gh: 9, gk: 'normal', ep: 106,
        lk: 39, abwehr: 16, initiative: 9, laufen: 6,
        schlagen: 19, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 13, agilitaet: 6, geist: 1 },
        eigenschaften: { staerke: 4, haerte: 3, bewegung: 3, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Großer Biss (WB+2; GA-2)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Natürliche Waffen' },
            { name: 'Schwimmen' },
            { name: 'Sturmangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:12)',
        seite: 125
    },
    {
        name: 'Hobgoblin',
        kategorie: 'Humanoide',
        gh: 4, gk: 'normal', ep: 71,
        lk: 24, abwehr: 18, initiative: '5+1', laufen: 3.5,
        schlagen: 15, schiessen: 10, zaubern: null, zielzauber: null,
        attribute: { koerper: 11, agilitaet: 6, geist: 3 },
        eigenschaften: { staerke: 2, haerte: 3, bewegung: 0, geschick: 3, verstand: 2, aura: 0 },
        bewaffnung: 'Langschwert (WB+2); Kurzbogen (WB+1; I+1)',
        panzerung: 'Kettenpanzer (PA+2; L-0,5); Helm (PA+1; I-1); Holzschild (PA+1)', pa: 4,
        besonderes: [
            { name: 'Nachtsicht' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'BW 1B:18',
        seite: 125
    },
    {
        name: 'Hund',
        kategorie: 'Tiere',
        gh: 1, gk: 'klein', ep: 31,
        lk: 11, abwehr: 6, initiative: 9, laufen: 6,
        schlagen: 9, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 5, agilitaet: 6, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 0, bewegung: 3, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Biss (WB+1)',
        panzerung: 'Fell (PA+1)', pa: 1,
        besonderes: [
            { name: 'Natürliche Waffen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 125
    },
    {
        name: 'Hydra',
        kategorie: 'Magische Wesen',
        gh: 23, gk: 'gross', ep: 246,
        lk: 90, abwehr: 22, initiative: 12, laufen: 10,
        schlagen: 21, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 14, agilitaet: 10, geist: 1 },
        eigenschaften: { staerke: 5, haerte: 6, bewegung: 2, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Großer Biss (WB+2; GA-2)',
        panzerung: 'Schuppenpanzer (PA+2)', pa: 2,
        besonderes: [
            { name: 'Mehrere Angriffe (+5)' },
            { name: 'Mehrere Angriffsglieder', detail: '6 Köpfe' },
            { name: 'Nachtsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Regeneration' },
            { name: 'Schleudern' },
            { name: 'Schwimmen' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:20)',
        seite: 126
    },
    {
        name: 'Keiler',
        kategorie: 'Tiere',
        gh: 6, gk: 'normal', ep: 79,
        lk: 38, abwehr: 17, initiative: 9, laufen: 7,
        schlagen: 14, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 10, agilitaet: 7, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 5, bewegung: 2, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Hauer (WB+2; GA-1)',
        panzerung: 'Dicke Borstenhaut (PA+2)', pa: 2,
        besonderes: [
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:10)',
        seite: 126
    },
    {
        name: 'Kobold',
        kategorie: 'Humanoide',
        gh: 1, gk: 'klein', ep: 25,
        lk: 7, abwehr: 4, initiative: 7, laufen: 4,
        schlagen: 5, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 3, agilitaet: 6, geist: 2 },
        eigenschaften: { staerke: 1, haerte: 1, bewegung: 1, geschick: 2, verstand: 1, aura: 0 },
        bewaffnung: 'Kleiner Knüppel (WB+1)',
        panzerung: null, pa: null,
        besonderes: [],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1B:8)',
        seite: 126
    },
    {
        name: 'Kriegselefant',
        kategorie: 'Tiere',
        gh: 16, gk: 'gross', ep: 142,
        lk: 93, abwehr: 23, initiative: 8, laufen: 6.5,
        schlagen: 22, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 16, agilitaet: 6, geist: 1 },
        eigenschaften: { staerke: 5, haerte: 5, bewegung: 2, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Rammen (WB+2)',
        panzerung: 'Dickhäuter (PA+2)', pa: 2,
        besonderes: [
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:20)',
        seite: 126
    },
    {
        name: 'Lebende Rüstung',
        kategorie: 'Konstrukte',
        gh: 8, gk: 'normal', ep: 72,
        lk: 24, abwehr: 19, initiative: 6, laufen: 4,
        schlagen: 16, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 10, agilitaet: 6, geist: 0 },
        eigenschaften: { staerke: 4, haerte: 4, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Langschwert (WB+2)',
        panzerung: 'Metallwesen (PA+5)', pa: 5,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Geistesimmun' }
        ],
        zauber: null,
        herstellung: { kosten: 1875, handwerk: 'Rüstungsschmied' },
        beute: null,
        seite: 126
    },
    {
        name: 'Leichnam',
        kategorie: 'Untote',
        gh: 26, gk: 'normal', ep: 299,
        lk: 39, abwehr: 31, initiative: 6, laufen: 4,
        schlagen: null, schiessen: null, zaubern: 17, zielzauber: 18,
        attribute: { koerper: 7, agilitaet: 6, geist: 9 },
        eigenschaften: { staerke: 17, haerte: 21, bewegung: 0, geschick: 4, verstand: 8, aura: 8 },
        bewaffnung: null,
        panzerung: 'mag. Robe +3 (PA+3)', pa: 3,
        besonderes: [
            { name: 'Angst' },
            { name: 'Geistesimmun' },
            { name: 'Totenkraft' },
            { name: 'Wesen der Dunkelheit (Settingoption)' },
            { name: 'Zauber' }
        ],
        zauber: ['Arkanes Schwert', 'Ebenentor', 'Einschläfern', 'Flammeninferno', 'Frostschock', 'Gasgestalt', 'Gehorche', 'Kontrollieren', 'Magisches Schloss', 'Netz', 'Schatten', 'Schatten erwecken', 'Schattenlanze', 'Skelette erwecken', 'Springen', 'Stolpern', 'Trugbild', 'Unsichtbarkeit', 'Verwirren', 'Wandöffnung', 'Wolke des Todes', 'Zeitstop'],
        herstellung: null,
        beute: 'BW #(A:20)x10, #10M:20',
        seite: 127
    },
    {
        name: 'Medusa',
        kategorie: 'Magische Wesen',
        gh: 18, gk: 'normal', ep: 205,
        lk: 36, abwehr: 15, initiative: 6, laufen: 7.5,
        schlagen: 16, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 11, agilitaet: 6, geist: 7 },
        eigenschaften: { staerke: 3, haerte: 3, bewegung: 0, geschick: 2, verstand: 2, aura: 2 },
        bewaffnung: 'Klauen/Schlangen (WB+2)',
        panzerung: 'Schuppen (PA+1)', pa: 1,
        besonderes: [
            { name: 'Blickangriff' },
            { name: 'Mehrere Angriffe (+5)' },
            { name: 'Schleudern' },
            { name: 'Versteinern' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW A:18), BW #5A:20, #5M:20',
        seite: 127
    },
    {
        name: 'Minotaurus',
        kategorie: 'Humanoide',
        gh: 12, gk: 'gross', ep: 138,
        lk: 54, abwehr: 18, initiative: 8, laufen: 5,
        schlagen: 20, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 14, agilitaet: 6, geist: 4 },
        eigenschaften: { staerke: 4, haerte: 3, bewegung: 2, geschick: 1, verstand: 1, aura: 1 },
        bewaffnung: 'Massive Keule, Horn oder; Huf (alles WB+2; GA-2)',
        panzerung: 'Fell (PA+1)', pa: 1,
        besonderes: [
            { name: 'Sturmangriff' },
            { name: 'Zerstampfen' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:16), BW 2B:20',
        seite: 127
    },
    {
        name: 'Monsterspinne',
        kategorie: 'Tiere',
        gh: 11, gk: 'gross', ep: 165,
        lk: 72, abwehr: 15, initiative: 11, laufen: 8.5,
        schlagen: 17, schiessen: 15, zaubern: null, zielzauber: null,
        attribute: { koerper: 12, agilitaet: 9, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 2, bewegung: 2, geschick: 4, verstand: 0, aura: 0 },
        bewaffnung: 'Spinnenbiss (WB+2; GA-2); Netzflüssigkeit (WB+2)',
        panzerung: 'Dicke Spinnenhaut (PA+1)', pa: 1,
        besonderes: [
            { name: 'Kletterläufer' },
            { name: 'Lähmungseffekt', detail: 'Netzflüssigkeit, alle 10 Kampfrunden einsetzbar' },
            { name: 'Natürliche Waffen' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:12)',
        seite: 127
    },
    {
        name: 'Mumie',
        kategorie: 'Untote',
        gh: 18, gk: 'normal', ep: 124,
        lk: 32, abwehr: 23, initiative: 4, laufen: 3,
        schlagen: 24, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 12, agilitaet: 4, geist: 4 },
        eigenschaften: { staerke: 10, haerte: 10, bewegung: 0, geschick: 0, verstand: 0, aura: 2 },
        bewaffnung: 'Fäulnispranke (WB+1)',
        panzerung: 'Bandagen (PA+1)', pa: 1,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Feuer' },
            { name: 'Angst' },
            { name: 'Geistesimmun' },
            { name: 'Natürliche Waffen' },
            { name: 'Totenkraft' },
            { name: 'Werteverlust', detail: 'KÖR -1 je Treffer (bei KÖR 0 tot)' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'BW #2A:18, #1M:16',
        seite: 128
    },
    {
        name: 'Oger',
        kategorie: 'Humanoide',
        gh: 10, gk: 'gross', ep: 121,
        lk: 50, abwehr: 17, initiative: 6, laufen: 3.5,
        schlagen: 17, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 12, agilitaet: 4, geist: 2 },
        eigenschaften: { staerke: 3, haerte: 3, bewegung: 2, geschick: 0, verstand: 1, aura: 0 },
        bewaffnung: 'Massive Keule (WB+2; GA-2)',
        panzerung: 'Felle (PA+1)', pa: 1,
        besonderes: [
            { name: 'Befreien' },
            { name: 'Nachtsicht' },
            { name: 'Umschlingen', detail: '3 Punkte abwehrbarer Schaden pro Runde' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'BW 1B:8, #1B18',
        seite: 128
    },
    {
        name: 'Ork',
        kategorie: 'Humanoide',
        gh: 2, gk: 'normal', ep: 63,
        lk: 23, abwehr: 14, initiative: 7, laufen: 4,
        schlagen: 13, schiessen: 10, zaubern: null, zielzauber: null,
        attribute: { koerper: 10, agilitaet: 6, geist: 2 },
        eigenschaften: { staerke: 2, haerte: 3, bewegung: 0, geschick: 3, verstand: 1, aura: 0 },
        bewaffnung: 'Speer (WB+1)',
        panzerung: 'Lederpanzer (PA+1)', pa: 1,
        besonderes: [
            { name: 'Nachtsicht' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'BW 1B:14, #1B16',
        seite: 128
    },
    {
        name: 'Pferd',
        kategorie: 'Tiere',
        gh: 4, gk: 'gross', ep: 101,
        lk: 66, abwehr: 12, initiative: 18, laufen: 10,
        schlagen: 14, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 10, agilitaet: 11, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 2, bewegung: 7, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Huf (WB+2; in Notwehr)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Natürliche Waffen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 129
    },
    {
        name: 'Pony',
        kategorie: 'Tiere',
        gh: 3, gk: 'gross', ep: 92,
        lk: 63, abwehr: 11, initiative: 13, laufen: 7.5,
        schlagen: 13, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 9, agilitaet: 8, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 2, bewegung: 5, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Huf (WB+2; in Notwehr)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Natürliche Waffen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 129
    },
    {
        name: 'Ratte',
        kategorie: 'Tiere',
        gh: 1, gk: 'winzig', ep: 26,
        lk: 3, abwehr: 2, initiative: 6, laufen: 3,
        schlagen: 4, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 2, agilitaet: 4, geist: 1 },
        eigenschaften: { staerke: 1, haerte: 0, bewegung: 2, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Spitze Zähne (WB+1)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Schwimmen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 129
    },
    {
        name: 'Raubkatze',
        kategorie: 'Tiere',
        gh: 2, gk: 'normal', ep: 84,
        lk: 27, abwehr: 9, initiative: 15, laufen: 9,
        schlagen: 12, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 7, agilitaet: 10, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 1, bewegung: 5, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Pranke/Biss (WB+2; GA-1)',
        panzerung: 'Fell (PA+1)', pa: 1,
        besonderes: [
            { name: 'Mehrere Angriffe (+1)' },
            { name: 'Nachtsicht' },
            { name: 'Natürliche Waffen' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:18)',
        seite: 129
    },
    {
        name: 'Reitkeiler',
        kategorie: 'Tiere',
        gh: 5, gk: 'normal', ep: 76,
        lk: 35, abwehr: 15, initiative: 11, laufen: 8.5,
        schlagen: 13, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 9, agilitaet: 9, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 4, bewegung: 2, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Hauer (WB+2; GA-1)',
        panzerung: 'Dicke Borstenhaut (PA+2)', pa: 2,
        besonderes: [
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:10)',
        seite: 129
    },
    {
        name: 'Riese',
        kategorie: 'Humanoide',
        gh: 30, gk: 'riesig', ep: 387,
        lk: 220, abwehr: 35, initiative: 6, laufen: 8,
        schlagen: 38, schiessen: 13, zaubern: null, zielzauber: null,
        attribute: { koerper: 27, agilitaet: 6, geist: 2 },
        eigenschaften: { staerke: 7, haerte: 7, bewegung: 3, geschick: 0, verstand: 1, aura: 0 },
        bewaffnung: 'Baumstamm (WB+4; GA-4); Geworf. Fels (WB+4; GA-4)',
        panzerung: 'Felle (PA+1)', pa: 1,
        besonderes: [
            { name: 'Befreien' },
            { name: 'Umschlingen', detail: '3 Punkte abwehrbarer Schaden pro Runde' },
            { name: 'Zerstampfen' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:20)',
        seite: 130
    },
    {
        name: 'Riesenechse',
        kategorie: 'Tiere',
        gh: 25, gk: 'riesig', ep: 316,
        lk: 218, abwehr: 21, initiative: 17, laufen: 11.5,
        schlagen: 24, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 15, agilitaet: 12, geist: 1 },
        eigenschaften: { staerke: 5, haerte: 14, bewegung: 5, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Grausamer Biss (WB+4)',
        panzerung: 'Schuppenpanzer (PA+2)', pa: 2,
        besonderes: [
            { name: 'Befreien' },
            { name: 'Kletterläufer' },
            { name: 'Nachtsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' },
            { name: 'Verschlingen' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 2A:16)',
        seite: 130
    },
    {
        name: 'Riesenkrake',
        kategorie: 'Tiere',
        gh: 35, gk: 'riesig', ep: 397,
        lk: 270, abwehr: 26, initiative: 18, laufen: 10,
        schlagen: 29, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 22, agilitaet: 10, geist: 1 },
        eigenschaften: { staerke: 5, haerte: 4, bewegung: 8, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Fangarme (WB+2)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Befreien' },
            { name: 'Mehrere Angriffe (+5)' },
            { name: 'Mehrere Angriffsglieder', detail: '6 Fangarme' },
            { name: 'Natürliche Waffen' },
            { name: 'Schwimmen' },
            { name: 'Umschlingen', detail: '5 Punkte abwehrbarer Schaden pro Runde' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 2A:18)',
        seite: 130
    },
    {
        name: 'Riesenratte',
        kategorie: 'Tiere',
        gh: 1, gk: 'klein', ep: 41,
        lk: 11, abwehr: 5, initiative: 8, laufen: 6,
        schlagen: 8, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 4, agilitaet: 6, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 1, bewegung: 2, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Scharfe Zähne (WB+2)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Schwimmen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 130
    },
    {
        name: 'Riesenschlange',
        kategorie: 'Tiere',
        gh: 8, gk: 'gross', ep: 143,
        lk: 66, abwehr: 14, initiative: 15, laufen: 10.5,
        schlagen: 16, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 9, agilitaet: 12, geist: 1 },
        eigenschaften: { staerke: 5, haerte: 3, bewegung: 3, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Großer Biss (WB+2; GA-2)',
        panzerung: 'Schuppenpanzer (PA+2)', pa: 2,
        besonderes: [
            { name: 'Befreien' },
            { name: 'Gift', detail: 'W20 Kampfrunden lang 1 nicht abwehrbarer Schaden pro Runde' },
            { name: 'Natürliche Waffen' },
            { name: 'Umschlingen', detail: '5 Punkte abwehrbarer Schaden pro Runde' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:18)',
        seite: 131
    },
    {
        name: 'Rostassel',
        kategorie: 'Tiere',
        gh: 8, gk: 'normal', ep: 111,
        lk: 33, abwehr: 15, initiative: 7, laufen: 7,
        schlagen: 13, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 8, agilitaet: 7, geist: 1 },
        eigenschaften: { staerke: 4, haerte: 4, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Tentakelfühler (WB+1)',
        panzerung: 'Chitinpanzer (PA+3)', pa: 3,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Mehrere Angriffe (+3)' },
            { name: 'Mehrere Angriffsglieder', detail: '4 Tentakelfühler' },
            { name: 'Natürliche Waffen' },
            { name: 'Rost' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:6)',
        seite: 131
    },
    {
        name: 'Schatten',
        kategorie: 'Untote',
        gh: 14, gk: 'normal', ep: 126,
        lk: 25, abwehr: 23, initiative: 11, laufen: 6.5,
        schlagen: 18, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 11, agilitaet: 11, geist: 0 },
        eigenschaften: { staerke: 5, haerte: 4, bewegung: 0, geschick: 2, verstand: 0, aura: 0 },
        bewaffnung: 'Geisterklaue (WB+2; GA-2)',
        panzerung: 'Körperlos (PA+8)', pa: 8,
        besonderes: [
            { name: 'Alterung', detail: 'Ziel altert 1 Jahr pro Treffer' },
            { name: 'Fliegen' },
            { name: 'Geistesimmun' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 131
    },
    {
        name: 'Schimmerross',
        kategorie: 'Tiere',
        gh: 4, gk: 'gross', ep: 106,
        lk: 66, abwehr: 12, initiative: 18, laufen: 10.5,
        schlagen: 13, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 9, agilitaet: 12, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 3, bewegung: 6, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Huf (WB+2; in Notwehr)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Nachtsicht' },
            { name: 'Natürliche Waffen' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 131
    },
    {
        name: 'Schlachtross',
        kategorie: 'Tiere',
        gh: 9, gk: 'gross', ep: 121,
        lk: 75, abwehr: 15, initiative: 14, laufen: 9,
        schlagen: 18, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 12, agilitaet: 10, geist: 1 },
        eigenschaften: { staerke: 4, haerte: 3, bewegung: 4, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Huf/Rammen (WB+2)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 132
    },
    {
        name: 'Schlingwurzelbusch',
        kategorie: 'Pflanzenwesen',
        gh: 7, gk: 'normal', ep: 122,
        lk: 30, abwehr: 11, initiative: 8, laufen: 7.5,
        schlagen: 11, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 6, agilitaet: 8, geist: 0 },
        eigenschaften: { staerke: 3, haerte: 4, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Wurzelhiebe (WB+2)',
        panzerung: 'Gehölz (PA+1)', pa: 1,
        besonderes: [
            { name: 'Befreien' },
            { name: 'Geistesimmun' },
            { name: 'Mehrere Angriffe (+4)' },
            { name: 'Natürliche Waffen' },
            { name: 'Umschlingen', detail: '5 Punkte abwehrbarer Schaden pro Runde' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Lediglich Brennholz',
        seite: 132
    },
    {
        name: 'Schwarm',
        kategorie: 'Tiere',
        gh: 5, gk: 'klein', ep: 68,
        lk: 'SCW', abwehr: 'SCW', initiative: 8, laufen: 7.5,
        schlagen: 'SCW', schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: null, agilitaet: null, geist: null },
        eigenschaften: { staerke: null, haerte: null, bewegung: null, geschick: null, verstand: null, aura: null },
        bewaffnung: null,
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Geistesimmun' },
            { name: 'Schwarm' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 132
    },
    {
        name: 'Skelett',
        kategorie: 'Untote',
        gh: 4, gk: 'normal', ep: 72,
        lk: 22, abwehr: 12, initiative: 10, laufen: 5,
        schlagen: 14, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 10, agilitaet: 8, geist: 0 },
        eigenschaften: { staerke: 3, haerte: 2, bewegung: 2, geschick: 2, verstand: 0, aura: 0 },
        bewaffnung: 'Knochenklaue (WB+1)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Geistesimmun' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 132
    },
    {
        name: 'Tentakelhirn',
        kategorie: 'Magische Wesen',
        gh: 7, gk: 'klein', ep: 89,
        lk: 11, abwehr: 5, initiative: 8, laufen: 6,
        schlagen: null, schiessen: null, zaubern: null, zielzauber: 11,
        attribute: { koerper: 4, agilitaet: 6, geist: 1 },
        eigenschaften: { staerke: 2, haerte: 1, bewegung: 2, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: null,
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Dunkelsicht' },
            { name: 'Schweben' },
            { name: 'Werteverlust', detail: 'GEI -1 je Treffer des Gedankenzehrerstrahls (bei GEI 0 wahnsinnig)' }
        ],
        zauber: ['Gedankenzehrerstrahl (Zielzauber; senkt GEI um 1 je Treffer)'],
        herstellung: null,
        beute: null,
        seite: 133
    },
    {
        name: 'Todesfee',
        kategorie: 'Untote',
        gh: 23, gk: 'normal', ep: 284,
        lk: 35, abwehr: 33, initiative: 9, laufen: 5.5,
        schlagen: 27, schiessen: null, zaubern: 19, zielzauber: null,
        attribute: { koerper: 6, agilitaet: 9, geist: 10 },
        eigenschaften: { staerke: 19, haerte: 19, bewegung: 0, geschick: 0, verstand: 3, aura: 9 },
        bewaffnung: 'Geisterklaue (WB+2; GA-2)',
        panzerung: 'Körperlos (PA+8)', pa: 8,
        besonderes: [
            { name: 'Alterung', detail: 'Ziel altert 1 Jahr pro Treffer' },
            { name: 'Angst' },
            { name: 'Fliegen' },
            { name: 'Geistesimmun' },
            { name: 'Nur durch Magie verletzbar' },
            { name: 'Totenkraft' },
            { name: 'Wesen der Dunkelheit (Settingoption)' },
            { name: 'Zauber' }
        ],
        zauber: ['Wehklagen (ZB -(KÖR+AU)/2 des Ziels; Abklingzeit 10 Kampfrunden; nicht abwehrbarer Flächenschaden in Höhe des Probenergebnisses im Umkreis von 9m)'],
        herstellung: null,
        beute: null,
        seite: 133
    },
    {
        name: 'Troll',
        kategorie: 'Humanoide',
        gh: 14, gk: 'gross', ep: 202,
        lk: 60, abwehr: 22, initiative: 9, laufen: 5,
        schlagen: 22, schiessen: 13, zaubern: null, zielzauber: null,
        attribute: { koerper: 16, agilitaet: 6, geist: 2 },
        eigenschaften: { staerke: 4, haerte: 4, bewegung: 0, geschick: 3, verstand: 1, aura: 0 },
        bewaffnung: 'Massive Keule (WB+2; GA-2); Geworf. Fels (WB+4; GA-4)',
        panzerung: 'Warzenhaut (PA+2)', pa: 2,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Lichtangriffe' },
            { name: 'Befreien' },
            { name: 'Dunkelsicht' },
            { name: 'Regeneration' },
            { name: 'Umschlingen', detail: '5 Punkte abwehrbarer Schaden pro Runde' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: '#BW 1B16',
        seite: 134
    },
    {
        name: 'Unwolf',
        kategorie: 'Magische Wesen',
        gh: 7, gk: 'klein', ep: 115,
        lk: 35, abwehr: 14, initiative: 10, laufen: 7.5,
        schlagen: 17, schiessen: 12, zaubern: null, zielzauber: null,
        attribute: { koerper: 11, agilitaet: 8, geist: 1 },
        eigenschaften: { staerke: 4, haerte: 2, bewegung: 2, geschick: 2, verstand: 0, aura: 0 },
        bewaffnung: 'Biss (WB+1) oder; Feuerodem (WB+2)',
        panzerung: 'Brennendes Fell (PA+1)', pa: 1,
        besonderes: [
            { name: 'Anfällig', detail: 'doppelter Schaden durch Lichtangriffe' },
            { name: 'Natürliche Waffen' },
            { name: 'Odem', detail: 'Feuerodem, Kegel GE x 5m lang' },
            { name: 'Sturmangriff' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:16)',
        seite: 134
    },
    {
        name: 'Vampirfledermaus',
        kategorie: 'Tiere',
        gh: 1, gk: 'winzig', ep: 55,
        lk: 4, abwehr: 7, initiative: 4, laufen: 3,
        schlagen: 9, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 5, agilitaet: 4, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 2, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Krallen (WB+1)',
        panzerung: null, pa: null,
        besonderes: [
            { name: 'Fliegen' },
            { name: 'Natürliche Waffen' },
            { name: 'Sonar' },
            { name: 'Sturzangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: null,
        seite: 134
    },
    {
        name: 'Wolf',
        kategorie: 'Tiere',
        gh: 2, gk: 'normal', ep: 81,
        lk: 29, abwehr: 10, initiative: 11, laufen: 7,
        schlagen: 13, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 8, agilitaet: 7, geist: 1 },
        eigenschaften: { staerke: 3, haerte: 1, bewegung: 4, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Kräftiger Biss (WB+2; GA-1)',
        panzerung: 'Wolfspelz (PA+1)', pa: 1,
        besonderes: [
            { name: 'Nachtsicht' },
            { name: 'Natürliche Waffen' },
            { name: 'Sturmangriff' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'Trophäe (BW 1A:10)',
        seite: 135
    },
    {
        name: 'Zombie',
        kategorie: 'Untote',
        gh: 10, gk: 'normal', ep: 78,
        lk: 28, abwehr: 20, initiative: 3, laufen: 2.5,
        schlagen: 18, schiessen: null, zaubern: null, zielzauber: null,
        attribute: { koerper: 13, agilitaet: 3, geist: 0 },
        eigenschaften: { staerke: 3, haerte: 5, bewegung: 0, geschick: 0, verstand: 0, aura: 0 },
        bewaffnung: 'Fäulnispranke (WB+2)',
        panzerung: 'Merkt nichts (PA+2)', pa: 2,
        besonderes: [
            { name: 'Geistesimmun' },
            { name: 'Natürliche Waffen' },
            { name: 'Wesen der Dunkelheit (Settingoption)' }
        ],
        zauber: null,
        herstellung: null,
        beute: 'BW 1B:4',
        seite: 135
    }
];
