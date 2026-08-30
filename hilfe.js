/* Dungeonslayers 4 — Hilfesystem
 *
 * Ein "?" neben einer Überschrift oder einem Bedienelement öffnet ein kleines
 * Popover mit der Erklärung dazu. Dieselben Texte bilden zusammen die
 * Gesamtanleitung (❓ Hilfe in der Kopfzeile) — jeder Text steht also nur
 * einmal hier im Verzeichnis und wird an beiden Stellen ausgespielt.
 *
 * Verwendung im HTML:  <button class="help-btn" data-hilfe="kampfwerte">?</button>
 * Die Knöpfe werden per Delegation abgefangen, deshalb funktionieren auch
 * solche, die erst zur Laufzeit erzeugt werden.
 */

const HILFE_GRUPPEN = [
    { id: 'start',  titel: '🚀 Erste Schritte' },
    { id: 'bogen',  titel: '📋 Der Charakterbogen' },
    { id: 'wuerfe', titel: '🎲 Würfeln & Proben' },
    { id: 'runde',  titel: '📡 Zusammen spielen' },
    { id: 'sl',     titel: '👑 Spielleiter-Dashboard' }
];

const HILFE_THEMEN = {

    // ---------- Erste Schritte ----------

    'sounds': {
        gruppe: 'start',
        titel: 'Hinweistöne',
        text: `<p>Sechs kurze Töne (1-3 Sekunden) machen auf Dinge aufmerksam, die man sonst
               leicht übersieht — allen voran, dass überhaupt ein Kampf begonnen hat:</p>
               <ul>
                 <li>Ein Kampf beginnt</li>
                 <li>Du bist am Zug</li>
                 <li>Du erleidest Schaden</li>
                 <li>Du wirst geheilt</li>
                 <li>Der Spielleiter flüstert dir etwas oder macht eine Ansage an alle</li>
               </ul>
               <p><strong>🔊/🔇</strong> in der Kopfzeile schaltet alle Töne auf einmal stumm,
               der <strong>Regler</strong> daneben stellt <em>deine</em> Lautstärke ein — für die
               Hinweistöne <strong>und</strong> das Soundboard des Spielleiters. Er legt sich als
               Gesamtpegel über dessen Mischung, ersetzt sie also nicht. Beides bleibt auf deinem
               Gerät gespeichert und wandert nicht in die Charakterdatei.</p>
               <p>Browser blockieren Sound, bevor du überhaupt mit der Seite interagiert hast.
               Ein Klick irgendwo auf der Seite (z.B. Raum eröffnen oder beitreten) reicht, danach
               spielen die Töne normal.</p>`
    },
    'soundboard': {
        gruppe: 'sl',
        titel: 'Soundboard',
        text: `<p>Ausgewählte Effekte und Ambient-Tracks für die Runde — nach Gruppen sortiert
               (Reaktionen, Kulisse, Dungeon, Kampf &amp; Magie, Tisch-Kontrolle, Musik).</p>
               <ul>
                 <li><strong>🎧 Vorhören</strong> spielt den Klang nur bei dir.</li>
                 <li><strong>▶ Für alle</strong> spielt ihn zusätzlich bei jedem verbundenen
                     Spieler ab.</li>
                 <li><strong>🌙 Fade</strong> blendet alles Laufende in 3 Sekunden aus,
                     <strong>⏹ Stop</strong> bricht sofort ab.</li>
                 <li>Der <strong>Gesamtlautstärke</strong>-Regler mischt die laufenden Sounds
                     zueinander und wird an alle mitgeschickt; jeder Spieler hat daneben noch
                     seinen eigenen Regler in der Kopfzeile.</li>
               </ul>
               <p>Sounds stoppen sich <strong>nicht</strong> gegenseitig — so läuft Regen als
               Endlos-Kulisse, während du einen Gong oder einen Schrei darüberlegst.</p>
               <p><strong>➕ Eigener Sound</strong> legt eine Datei von deiner Festplatte ins
               Soundboard — lizenzierte Musik, selbst aufgenommene Atmo, ein Jingle. Sie
               erscheint unter <em>Eigene</em> in der Liste und lässt sich wie jeder andere
               Klang vorhören oder für alle abspielen. Solche Dateien bleiben
               <strong>ausschließlich auf diesem Gerät</strong> (im Browser gespeichert) und
               gehen beim Abspielen direkt an die verbundenen Spieler — nichts davon wird
               veröffentlicht. Grenze: 20 MB je Datei.</p>
               <p class="hint-rule">Die kurzen Effekte (Türen, Münzen, Klingen …) liegen als
               CC0-Dateien von <em>Kenney</em> im Tool selbst. Die langen Kulissen- und
               Musikstücke wären zu groß fürs Repo und kommen von der Seite des
               Schwesterprojekts <em>How to be a Hero</em> — dafür braucht es eine
               Internetverbindung.</p>`
    },

    'ueberblick': {
        gruppe: 'start',
        titel: 'Was ist das hier?',
        text: `<p>Ein digitaler Charakterbogen für <strong>Dungeonslayers 4</strong>. Er rechnet
               alle Kampfwerte selbst aus, kennt Talente, Zauber und Bestiarium aus dem Regelwerk
               und würfelt Proben regelkonform.</p>
               <p>Es läuft alles im Browser: keine Anmeldung, kein Server, keine Installation.
               Dein Charakter liegt in diesem Browser und wandert über <strong>💾 Speichern</strong>
               als Datei auf deine Festplatte.</p>
               <ul>
                 <li><strong>Spieler</strong> füllen den Bogen aus und würfeln damit.</li>
                 <li><strong>Spielleiter</strong> eröffnen unter 📡 Multiplayer einen Raum und
                     bekommen ein eigenes Dashboard mit Kampf-Tracker.</li>
               </ul>`
    },
    'schnellstart': {
        gruppe: 'start',
        titel: 'In fünf Minuten losspielen',
        text: `<ol>
                 <li><strong>🧙 Charakter erschaffen</strong> — der Assistent führt in sieben
                     Schritten durch Volk, Klasse, Attribute, Eigenschaften und Ausrüstung.
                     Er lässt dich nicht weiter, solange die Punkte nicht regelkonform verteilt sind.</li>
                 <li>Alternativ <strong>👤 Beispiel</strong> für einen fertigen Helden zum Ausprobieren.</li>
                 <li>Im Bogen auf einen <strong>Kampfwert klicken</strong> — das würfelt die Probe.</li>
                 <li><strong>💾 Speichern</strong> legt den Charakter als Datei ab,
                     <strong>📂 Laden</strong> holt ihn zurück.</li>
                 <li>Für eine Runde am Tisch oder online: <strong>📡 Multiplayer</strong>,
                     Raum-Code vom Spielleiter eintippen, fertig.</li>
               </ol>`
    },
    'speichern': {
        gruppe: 'start',
        titel: 'Speichern, Laden & Löschen',
        text: `<p>Der Bogen sichert sich <strong>laufend automatisch in diesem Browser</strong>.
               Beim nächsten Aufruf ist dein Held wieder da — solange du nicht die Browserdaten
               löschst oder einen anderen Rechner benutzt.</p>
               <ul>
                 <li><strong>💾 Speichern</strong> — schreibt eine JSON-Datei. Die kannst du
                     sichern, weitergeben oder auf einem anderen Gerät laden.</li>
                 <li><strong>📂 Laden</strong> — liest so eine Datei wieder ein und ersetzt den
                     aktuellen Bogen.</li>
                 <li><strong>🗑️ Löschen</strong> — leert den Bogen vollständig; nach dem Bild
                     wird getrennt gefragt.</li>
               </ul>
               <p>Solange du den Bogen in dieser Sitzung noch nicht als Datei gespeichert hast —
               oder seither etwas geändert hast — fragt der Browser beim Schließen des Tabs nach.
               Eine Erinnerung, <em>💾 Speichern</em> zu drücken: Der Browser-Speicher allein kann
               verloren gehen (Verlauf gelöscht, anderes Gerät).</p>
               <p>Die Discord-Webhook-URL wird bewusst <strong>nicht</strong> mitgespeichert —
               geteilte Charakterdateien verraten deinen Kanal also nicht.</p>`
    },

    // ---------- Charakterbogen ----------

    'charakter': {
        gruppe: 'bogen',
        titel: 'Charakterdaten',
        text: `<p>Die Stammdaten deines Helden. <strong>Volk</strong> und <strong>Klasse</strong>
               bestimmen mit, was du lernen darfst und welche Boni automatisch einfließen —
               ändere sie also nicht leichtfertig mitten in der Kampagne.</p>
               <p><strong>Erfahrungspunkte</strong> bestimmen die Stufe. Trägst du EP nach, steigt
               die Stufe automatisch und du bekommst Lern- und Talentpunkte gutgeschrieben;
               senkst du sie wieder, werden sie sauber abgezogen.</p>
               <p><strong>Lernpunkte (LP)</strong> steigern Eigenschaften und Lebenskraft,
               <strong>Talentpunkte (TP)</strong> kaufen Talentränge. Ausgegeben wird beides im
               Dialog <em>⬆️ Stufenaufstieg</em>.</p>`
    },
    'portrait': {
        gruppe: 'bogen',
        titel: 'Charakterbild',
        text: `<p>Ein Bild deines Helden — ein Klick auf den Rahmen wählt eine Datei.</p>
               <p>Es ist mehr als Deko: Der Spielleiter sieht es auf seiner Übersicht, und auf der
               <strong>Karte</strong> wird deine Figur damit dargestellt, umrandet in deiner
               Spielerfarbe.</p>`
    },
    'attribute': {
        gruppe: 'bogen',
        titel: 'Attribute & Eigenschaften',
        text: `<p>Drei Attribute (<strong>Körper, Agilität, Geist</strong>) mit je zwei
               Eigenschaften. Jeder Probenwert im Spiel ist eine Summe aus Attribut + Eigenschaft
               (+ etwaige Boni).</p>
               <p><strong>Bei der Erschaffung:</strong> 20 Punkte auf die Attribute (höchstens 8 je
               Attribut), 8 Punkte auf die Eigenschaften (höchstens 4 je Eigenschaft). Volks- und
               Klassenbonus von je +1 kommen erst danach obendrauf.</p>
               <p>Die beiden Zähler oben rechts zeigen dein Budget — rot heißt: zu viel verteilt.
               Nach einer bezahlten Steigerung wächst das Budget mit, unbezahlt hochgesetzte Werte
               bleiben als Überschreitung markiert.</p>
               <p>An jeder Eigenschaft steht ihr <strong>Höchstwert</strong> (12, +1 je durch Volk
               oder Klasse begünstigter Eigenschaft).</p>`
    },
    'kampfwerte': {
        gruppe: 'bogen',
        titel: 'Kampfwerte',
        text: `<p>Alle Werte rechnet der Bogen live aus Attributen, Eigenschaften, Ausrüstung,
               Volksfähigkeiten und Talenten. <strong>Ein Klick auf eine Karte würfelt die
               Probe</strong> direkt.</p>
               <ul>
                 <li><strong>Schlagen / Schießen / Zaubern / Zielzauber</strong> — deine Angriffe.
                     Das Wurfergebnis <em>ist</em> der Schaden.</li>
                 <li><strong>Abwehr</strong> — wird gewürfelt, wenn dich jemand trifft; das
                     Ergebnis wird vom Schaden abgezogen.</li>
                 <li><strong>Initiative</strong> bestimmt die Zugreihenfolge, <strong>Laufen</strong>
                     die Bewegung in Metern.</li>
               </ul>
               <p>Fließt ein Talent- oder Ausrüstungsbonus ein, weist die Karte ihn aus und nennt
               im Tooltip die Quelle. Situative Talente wie <em>Parade</em> werden bewusst
               <strong>nicht</strong> automatisch verrechnet — sie stehen mit ihrer Bedingung als
               Erinnerung darunter.</p>`
    },
    'lebenskraft': {
        gruppe: 'bogen',
        titel: 'Lebenskraft & Rasten',
        text: `<p>Links die aktuelle LK, rechts das Maximum. Die Knöpfe <strong>−1 / −5 / +1 /
               +5</strong> ändern sie schnell; im Multiplayer sieht der Spielleiter den Balken
               sofort.</p>
               <ul>
                 <li><strong>Verschnaufen</strong> — nach dem Kampf die Hälfte der
                     <em>in diesem Kampf</em> verlorenen LK zurück. Läuft ein Kampf über den
                     Rundenzähler, merkt sich der Bogen den Stand bei Kampfbeginn; alte Wunden
                     heilt es nicht mit.</li>
                 <li><strong>Nachtruhe</strong> — 24 Stunden: 1W20/2 LK zurück, +1 je 4 Stunden
                     Bettruhe.</li>
                 <li><strong>Voll</strong> — setzt ohne Wurf auf das Maximum, etwa nach einem
                     Zeitsprung.</li>
               </ul>`
    },
    'slayerpunkte': {
        gruppe: 'bogen',
        titel: 'Slayerpunkte',
        text: `<p>Die optionale Regel aus S.45 — der Kasten erscheint nur, wenn sie in den
               <em>Hausregeln</em> eingeschaltet ist. Höchstens <strong>3 Punkte</strong> gleichzeitig.</p>
               <p><strong>Verdient</strong> werden sie automatisch: <strong>1 SP je Kampfrunde, in
               der du Schaden verursachst</strong> — mehr als einen pro Runde gibt es nicht. Läuft
               kein Rundenzähler, zählt jede schadensbringende Aktion. Ein gelungener Heilzauber
               bringt ebenfalls einen Punkt.</p>
               <p>Der Knopf <strong>★ Heilung</strong> ist für den Fall, den das Tool nicht wissen
               kann: Ein Heiler bekommt den Punkt nur, wenn der Kamerad <em>in diesem Kampf</em>
               verletzt wurde — das weiß nur der Tisch. <strong>+</strong> schreibt einen Punkt von
               Hand gut, <strong>✕</strong> lässt alle verfallen.</p>
               <p>Punkte <strong>verfallen</strong> am Kampfende und bei Bewusstlosigkeit.</p>
               <p>Die Auswahlliste zeigt die Ausgabetabelle des Regelwerks — gefiltert auf das, was
               du dir gerade leisten kannst (etwa <em>Abwehr +3</em> für 1 SP oder
               <em>Angriffsprobe +2</em> für 2 SP).</p>`
    },
    'ausruestung': {
        gruppe: 'bogen',
        titel: 'Ausrüstung',
        text: `<p>Waffen und Rüstung wirken sich sofort auf die Kampfwerte aus: Waffenbonus,
               Panzerung, Initiative-Malus schwerer Rüstung, Laufen-Abzüge.</p>
               <p>Der Bogen <strong>prüft die Regeln mit</strong> und warnt, wenn ein Zwerg zum
               Bihänder greift, ein Zauberer Kettenrüstung anlegt oder ein Schild neben einer
               Zweihandwaffe hängt.</p>
               <p><strong>Klassenfremde Rüstung wird auch gerechnet</strong> (S.41): Der PA-Malus
               auf Zaubern und Zielzauber vervierfacht sich und die Agilität sinkt um den PA-Wert —
               das schlägt auf Initiative, Laufen und Schießen durch. Das Talent <em>Gerüstet</em>
               hebt die erlaubte Rüstungsklasse an und nimmt den Malus wieder heraus.</p>
               <p>Darunter stehen die <strong>Rüstzeiten</strong> (2 Aktionen je Punkt Panzerung,
               Helme frei).</p>`
    },
    'talente': {
        gruppe: 'bogen',
        titel: 'Talente',
        text: `<p><strong>+ Talent</strong> öffnet die Auswahl mit allen 125 Talenten aus dem
               Regelwerk. Angezeigt werden nur die, die deine Klasse auf deiner Stufe lernen darf —
               auf Wunsch blendest du die gesperrten mit ein und siehst, ab welcher Stufe sie
               kommen.</p>
               <ul>
                 <li>Jeder Rang kostet <strong>1 Talentpunkt</strong>; beim Entfernen gibt es ihn zurück.</li>
                 <li><strong>Höchstränge werden erzwungen</strong> — jede Klasse hat je Talent
                     ihren eigenen Maximalrang.</li>
                 <li>Dauerhafte Boni (<em>Kämpfer</em>, <em>Einstecker</em>, <em>Flink</em> …)
                     fließen automatisch in die Kampfwerte.</li>
                 <li>Ab Stufe 10 schalten die <strong>Heldenklassen</strong> zusätzliche Talente frei.</li>
               </ul>`
    },
    'zauber': {
        gruppe: 'bogen',
        titel: 'Zaubersprüche',
        text: `<p>Der Kasten erscheint bei Zauberwirkern — und beim Meisterdieb mit dem Talent
               <em>Zauber auslösen</em>. <strong>+ Zauber</strong> zeigt die Sprüche, die dein Typ
               (Heiler, Zauberer, Schwarzmagier) auf deiner Stufe lernen darf.</p>
               <p>Der <strong>Meisterdieb</strong> lernt keine Sprüche, sondern löst sie von
               <strong>Schriftrollen</strong> aus: Der Kasten nennt die bei Talenterwerb gewählten
               Zauberklassen, gewürfelt wird auf Zaubern/Zielzauber, den ZB der Rolle trägst du beim
               Wurf im Feld <em>Bonus/Malus für den nächsten Wurf</em> ein.</p>
               <p>Es kann immer nur <strong>ein Zauber vorbereitet</strong> sein. Wechseln kostet
               eine Aktion und eine GEI+VE-Probe. Kein Mana — stattdessen gilt die
               <strong>Abklingzeit</strong>, die am Rundenzähler des Spielleiters mitläuft.</p>
               <p>Der Zauberbonus des vorbereiteten Spruchs fließt automatisch in den Kampfwert ein,
               mit dem er auch gewirkt wird. Sprüche mit <em>formelhaftem</em> Zauberbonus (der vom
               Ziel abhängt) sind markiert — dort rechnet der Bogen bewusst mit 0, statt still
               etwas Falsches einzusetzen.</p>
               <p>Mit dem Heldenklassen-Talent <em>Zauberroutine</em> (Erzmagier) erscheint zusätzlich
               ein Knopf <strong>⚙ binden</strong> — bis zu so viele Zauber wie Talentränge lassen sich
               damit an den Erzmagier binden, wie mit einem Zauberstab. Zu einem gebundenen Spruch
               wechselst du <strong>ohne Aktion und ohne GEI+VE-Probe</strong>. Es bleibt trotzdem bei
               einem vorbereiteten Zauber zur Zeit — der Zauberbonus zählt immer nur für den Spruch,
               den du gerade wirkst. Die anderen gebundenen Sprüche stehen unter den Kampfwerten als
               Erinnerung, welche ohne Wechselprobe bereit sind.</p>`
    },
    'stufenaufstieg': {
        gruppe: 'bogen',
        titel: 'Stufenaufstieg',
        text: `<p>Hier gibst du <strong>Lernpunkte</strong> aus: günstige Eigenschaften 2 LP,
               übrige 3 LP, Lebenskraft 1 LP, ein Talentpunkt 3 LP (per Hausregel änderbar).</p>
               <p>Jede Zeile hat ein <strong>−</strong>: Steigerungen lassen sich zurücknehmen und
               die Punkte werden erstattet. Der Bogen merkt sich, was tatsächlich gekauft wurde —
               wo nichts zu erstatten ist, bleibt der Knopf gesperrt.</p>
               <p><strong>+1 Stufe gutschreiben</strong> hebt auch die Erfahrungspunkte auf die
               nächste Schwelle, damit Stufe, Talentzugang und Punktebudget zusammenpassen.</p>
               <p>Menschen wählen hier außerdem ihre beiden freien Höchstwert-Punkte.</p>`
    },
    'inventar': {
        gruppe: 'bogen',
        titel: 'Inventar & Münzen',
        text: `<p>Freie Liste für alles, was nicht in die Ausrüstungsplätze gehört — Fackeln,
               Seile, Beute. Der Spielleiter sieht sie im Multiplayer live mit.</p>
               <p>Die Münzfelder (Gold, Silber, Kupfer) stehen unter der Ausrüstung.</p>`
    },
    'notizen': {
        gruppe: 'bogen',
        titel: 'Notizen',
        text: `<p>Freitext für Hintergrund, Ziele und Questnotizen. Wandert mit in die gespeicherte
               Charakterdatei.</p>`
    },
    'hausregeln': {
        gruppe: 'bogen',
        titel: 'Hausregeln',
        text: `<p>Die wichtigsten Stellschrauben, ohne an den Regeldateien zu drehen:</p>
               <ul>
                 <li><strong>Steigerungskosten</strong> — nach Regelwerk, einheitlich oder je
                     Posten frei einstellbar.</li>
                 <li><strong>Talentpunkte je Stufe</strong> frei wählbar, dazu optional ein
                     zweiter, getrennt geführter Topf (etwa für Talente außerhalb des Kampfes).</li>
                 <li><strong>Slayende Würfel</strong> (S.45) — ein Immersieg bei Angriff oder
                     Abwehr löst sofort einen weiteren Wurf aus.</li>
                 <li><strong>Slayerpunkte</strong> (S.45) — ein eigenes Feld unter den Kampfwerten,
                     mit automatischer Vergabe und der Ausgabetabelle des Regelwerks.</li>
                 <li><strong>Eigene Talente, Zauber und Heldenklassen</strong> anlegen — sie
                     erscheinen als <em>Hausregel</em> markiert in den Auswahllisten.</li>
               </ul>
               <p>Der <strong>Spielleiter stellt die Regeln ein und schickt sie an die Runde</strong>;
               wer später beitritt, bekommt sie automatisch.</p>`
    },

    // ---------- Würfeln ----------

    'wuerfel': {
        gruppe: 'wuerfe',
        titel: 'Der Würfelkasten',
        text: `<p>Dungeonslayers würfelt <strong>1W20 unterwürfeln</strong>: Wurf ≤ Probenwert ist
               ein Erfolg. Je höher der gelungene Wurf, desto besser das Ergebnis.</p>
               <ul>
                 <li><strong>Immersieg</strong> bei natürlicher 1 — immer Erfolg, zählt als
                     bestmögliches Ergebnis (voller Probenwert).</li>
                 <li><strong>Patzer</strong> bei natürlicher 20 — immer Fehlschlag, im Kampf mit
                     Zusatzfolge (Waffe fällt, Zauber springt heraus, Charakter stürzt).</li>
                 <li><strong>Probenwerte über 20</strong> werden in Kettenwürfe zerlegt (20, dann
                     Rest). Es fallen erst alle Würfel, dann sucht der Bogen die beste Verteilung —
                     nur der erste Würfel kann patzen.</li>
               </ul>
               <p>Jeder Wurf landet im <strong>Logbuch</strong> und — im Multiplayer — beim
               Spielleiter.</p>`
    },
    'schwierigkeit': {
        gruppe: 'wuerfe',
        titel: 'Schwierigkeit',
        text: `<p>Der Modifikator des Spielleiters auf den Probenwert, von <strong>Routine
               (+8)</strong> bis <strong>Äußerst schwer (−8)</strong>.</p>
               <p>Er <strong>bleibt eingestellt</strong>, bis du ihn selbst wieder auf 0 setzt, und
               wird bei jedem Wurf im Log ausgewiesen — damit am Tisch nachvollziehbar bleibt,
               wogegen gewürfelt wurde. Für einen einmaligen Zuschlag ist das Feld
               <em>Bonus/Malus für den nächsten Wurf</em> darunter gedacht.</p>`
    },
    'wurfbonus': {
        gruppe: 'wuerfe',
        titel: 'Bonus/Malus für den nächsten Wurf',
        text: `<p>Ein Zuschlag oder Abzug, den der Bogen <strong>nicht selbst kennt</strong> —
               für alles Situative:</p>
               <ul>
                 <li>aktives <em>Parade</em>, <em>Blocker</em>, <em>Raserei</em> und andere
                     Talente, die nur unter Bedingungen greifen (sie stehen als Erinnerung unter
                     den Kampfwerten)</li>
                 <li>ein <em>Vertrauter</em> in Reichweite</li>
                 <li>ein Gegenstand mit begrenztem Effekt („1× Feuerstrahl pro Kampf")</li>
                 <li>eine Ansage des Spielleiters („+2, du stehst höher")</li>
               </ul>
               <p>Er zählt zusätzlich zur Schwierigkeit in den nächsten Wurf, erscheint im Log und
               <strong>stellt sich danach wieder auf 0</strong>. Solange er scharf ist, ist das
               Feld hervorgehoben. Die <strong>+</strong>/<strong>−</strong>-Knöpfe gehen in
               Einerschritten (gedrückt halten zählt weiter), größere Werte tippst du direkt ein.</p>`
    },
    'beliebige-wuerfel': {
        gruppe: 'wuerfe',
        titel: 'Beliebige Würfel',
        text: `<p>Für alles, was das Regelsystem nicht als Probe kennt — Zufallstabellen, Beute,
               Schaden fremder Effekte, ein schneller Entscheidungswurf.</p>
               <p>Eingabe als <strong>Formel</strong>: <code>2W6</code>, <code>1W100</code>,
               <code>3W8+2</code>. Ohne Anzahl heißt einer (<code>W20</code>), der Zuschlag am Ende
               ist optional. Erlaubt sind 1–50 Würfel mit 2–1000 Seiten.</p>
               <p>Das Feld <em>Bonus/Malus für den nächsten Wurf</em> zählt mit und wird danach
               geleert. Das Ergebnis mit allen Einzelwürfeln landet im Logbuch und — im Multiplayer —
               bei der ganzen Runde. Der Spielleiter kann seine beliebigen Würfe wie jeden anderen
               Wurf verdeckt oder nur an einen Spieler schicken.</p>`
    },
    'proben': {
        gruppe: 'wuerfe',
        titel: 'Proben würfeln',
        text: `<ul>
                 <li><strong>Typische Probe</strong> — 27 fertige Proben (Klettern, Schleichen,
                     Schlösser öffnen …) mit der passenden Attribut+Eigenschaft-Formel, inklusive
                     Sonderfällen wie dem Mindestwert 8 bei <em>Bemerken</em> oder dem elfischen
                     <em>Leichtfüßig</em>-Bonus aufs Schleichen.</li>
                 <li><strong>Freier Probenwert</strong> — für alles, was in keiner Liste steht:
                     Zahl eintragen, würfeln.</li>
                 <li><strong>Vergleichende Probe</strong> — beide Seiten würfeln, die höhere
                     gelungene Probe gewinnt. Misslingen beide, gibt es kein Ergebnis.</li>
                 <li><strong>Blanker 1W20</strong> — ein nackter Wurf ohne Probenlogik.</li>
               </ul>`
    },
    'kampfmods': {
        gruppe: 'wuerfe',
        titel: 'Kampfmodifikatoren',
        text: `<p>Die Zuschläge und Abzüge aus S.43–44. Sie greifen <strong>je nach Probenart
               unterschiedlich</strong>, deshalb zeigt das Feld drei getrennte Summen für
               Nahkampf, Fernkampf und Abwehr.</p>
               <ul>
                 <li><strong>Distanz</strong> −1 je volle 10 m (Schleuder und Wurfmesser: je 2 m)
                     und <strong>Zielen</strong> +2 je Runde (höchstens +10) — nur bei Schießen
                     und Zielzauber.</li>
                 <li><strong>Position und Größe des Ziels</strong> (liegt, von hinten, von der
                     Seite, Größenunterschied) — nur bei Angriffen.</li>
                 <li>Auf die <strong>Abwehr</strong> wirken nur „ich liege" und der
                     Zwei-Waffen-Malus (automatisch um deine Ränge im Talent <em>Zwei Waffen</em>
                     gemildert).</li>
                 <li><strong>Getümmel</strong> +1 je Individuum beim blinden Schuss in eine Menge,
                     <strong>Hindernisse</strong> −1 je Baum, Kamerad oder Wandstück dazwischen.</li>
               </ul>
               <p>Für gewöhnliche Fertigkeitsproben gelten sie gar nicht.
               <strong>Zurücksetzen</strong> räumt alles wieder ab.</p>`
    },
    'mehrere-gegner': {
        gruppe: 'wuerfe',
        titel: 'Mehrere Gegner',
        text: `<p>Regelwerk S.43: Du kannst deinen <strong>Schlagen-Wert auf bis zu vier
               angrenzende Gegner aufteilen</strong>. Jeder Teilwert ist ein eigener Angriff mit
               eigenem Wurf.</p>
               <p>Der Preis: <strong>−2 auf die Abwehr je Gegner</strong>, den du auf diese Weise
               angreifst. Der Dialog verteilt die Punkte und würfelt alle Angriffe hintereinander aus.</p>`
    },
    'logbuch': {
        gruppe: 'wuerfe',
        titel: 'Logbuch',
        text: `<p>Jeder Wurf mit Probenwert, Modifikator, Ergebnis und Bewertung — farbig nach
               Immersieg, Erfolg, Fehlschlag und Patzer.</p>
               <p>Im <strong>Multiplayer</strong> landen hier auch die Würfe der Mitspieler
               (mit Namen davor), die Kampfwürfe des Spielleiters und seine „an alle" gemachten
               Proben — dein Logbuch hat also den kompletten Mitschrieb der Runde.</p>
               <p>Praktisch, um am Tisch eine strittige Probe nachzuschlagen.
               <strong>Log leeren</strong> im Würfelkasten räumt auf.</p>`
    },
    'regeln': {
        gruppe: 'wuerfe',
        titel: 'Regel-Spickzettel',
        text: `<p>Die wichtigsten Regeln kompakt zum Nachschlagen: Probenmechanik, Kampfablauf,
               Zustände, Heilung und die Kampfmodifikatoren — mit Seitenverweisen ins Regelwerk.</p>
               <p>Das vollständige Regelwerk gibt es kostenlos auf
               <a href="https://www.dungeonslayers.net/" target="_blank" rel="noopener">dungeonslayers.net</a>.</p>`
    },

    // ---------- Zusammen spielen ----------

    'gruppe': {
        gruppe: 'runde',
        titel: 'Gruppe & Kampf',
        text: `<p>Der Kasten erscheint nur, solange du mit einem Spielleiter verbunden bist.</p>
               <p><strong>Läuft ein Kampf</strong>, steht hier die Runde und die vollständige
               Initiative-Reihenfolge — <strong>🛡️ Helden</strong> und <strong>👹 Gegner</strong>
               gemischt nach Initiative. Wer gerade dran ist, ist markiert; bist du es selbst,
               wird der Kasten hervorgehoben und du bekommst zusätzlich eine Einblendung samt Ton.
               Ohne Kampf steht dort schlicht, dass gerade keiner läuft.</p>
               <p><strong>Zustände</strong> (Vergiftet, Brennt, Liegend …), die der Spielleiter an
               Helden oder Gegner hängt, erscheinen als Marker neben dem Namen — mit Rundenzähler,
               wenn einer gesetzt ist. Deine eigenen stehen zusätzlich oben im Kasten
               (<em>„Du bist: …"</em>).</p>
               <p><strong>Deine Mitspieler</strong> stehen darunter mit Klasse, Stufe und ihrem
               Lebenskraft-Balken — praktisch, um zu sehen, wer dringend Heilung braucht.
               Bewusstlose und Tote sind ausgewiesen. Gegner-<strong>Werte</strong> siehst du
               bewusst nicht; in der Reihenfolge stehen sie nur mit Namen.</p>
               <p><strong>🤫 Flüstern</strong> schickt eine Nachricht, die nur der Spielleiter
               sieht — die Gegenrichtung zu seinem Flüstern an dich.</p>
               <p><strong>Heilzauber wirken auf Mitspieler:</strong> Wirkst du erfolgreich einen
               Zauber, den der Bogen als Heilung erkennt (z.B. <em>Heilende Hand</em>), fragt er
               sofort, wem die Lebenskraft gutkommt — dir selbst oder einem Mitspieler aus dieser
               Liste. Es gibt keine direkte Verbindung zwischen Spielern, deshalb läuft das über
               den Spielleiter — der muss dafür aber nichts tun, genau wie bei einem Angriff auch.
               Leer lassen überspringt die Zuteilung.</p>`
    },
    'multiplayer': {
        gruppe: 'runde',
        titel: 'Multiplayer',
        text: `<p>Direkte Peer-to-Peer-Verbindung über WebRTC — keine Accounts, kein Server, keine
               Kosten.</p>
               <ul>
                 <li><strong>Spielleiter:</strong> <em>Raum eröffnen</em> drücken. Du bekommst
                     einen vierstelligen Code und landest im Dashboard.</li>
                 <li><strong>Spieler:</strong> Code eintippen, <em>Beitreten</em>. Dein Bogen
                     überträgt ab dann laufend Werte, Lebenskraft und jeden Wurf.</li>
               </ul>
               <p>In der Kopfzeile zeigt eine Anzeige den Stand: grün verbunden, gelb pulsierend
               beim Verbinden, rot bei Abbruch. Ein Klick darauf öffnet dieses Menü wieder.</p>
               <p>Klappt keine Verbindung (striktes NAT, Firmennetz, Mobilfunk), hilft ein eigener
               <strong>TURN-Server</strong> unter „Erweitert".</p>`
    },
    'discord': {
        gruppe: 'runde',
        titel: 'Discord-Anbindung',
        text: `<p>Optional: Würfe und Ereignisse werden zusätzlich in einen Discord-Kanal gepostet,
               damit die ganze Gruppe mitliest und nicht nur der Spielleiter. Auch die
               <strong>Kampfwürfe des Spielleiters</strong> (Angriffe und Abwehr der Gegner) landen
               dort.</p>
               <p>Einzurichten unter <strong>📡 Verbindung</strong> (Dashboard) bzw.
               <strong>📡 Multiplayer</strong> (Spielerbogen) — geht jederzeit, auch bei laufendem
               Raum. In Discord unter <em>Kanal bearbeiten → Integrationen → Webhooks</em> einen
               Webhook anlegen und die URL einfügen. <strong>Test senden</strong> prüft die
               Einrichtung. Würfe und Ereignisse lassen sich getrennt abschalten.</p>
               <p>Die URL ist ein <strong>Zugangsschlüssel für den Kanal</strong>. Sie bleibt nur
               in diesem Browser und landet nicht in der exportierten Charakterdatei.</p>`
    },
    'karte': {
        gruppe: 'runde',
        titel: 'Die Karte',
        text: `<p><strong>Die Karte ist der Kampfplan des Spielleiters.</strong> Er lädt ein
               Hintergrundbild und stellt Figuren darauf — alle verbundenen Spieler sehen dasselbe
               Bild live mit. Ein Feld = <strong>1 Meter</strong> (Anhang B).</p>
               <p><strong>Allein am Charakterbogen bleibt die Karte leer</strong>, denn Bild, Figuren
               und Nebel kommen vom Spielleiter. Sinn ergibt sie im Zusammenspiel: Als Spieler
               siehst du sie und schlägst Züge vor. Als <strong>Spielleiter</strong> baust du sie im
               <strong>Dashboard</strong> auf — auch schon vor der Sitzung, ganz ohne verbundene
               Spieler, zum Vorbereiten. Die Werkzeugleiste dazu ist ein eigenes Hilfethema
               (<em>Karten-Werkzeuge</em>).</p>
               <ul>
                 <li><strong>Ansehen und bewegen</strong>: Mausrad zoomt, <strong>✋ Bewegen</strong>
                     oder die <strong>mittlere Maustaste</strong> schiebt die Karte,
                     <strong>Einpassen</strong> rückt alles wieder ins Bild. Wer mitten in der
                     Sitzung dazukommt, bekommt den aktuellen Stand automatisch nachgereicht.</li>
                 <li><strong>Deine Figur</strong> trägt dein Charakterbild in deiner Spielerfarbe.
                     Ziehst du sie, bleibt sie zunächst stehen und meldet den Zug mit Entfernung als
                     <strong>Vorschlag</strong> an den Spielleiter — er gibt ihn frei. Außerhalb des
                     Kampfes kann er die Züge auch generell freigeben, dann ziehst du direkt.</li>
                 <li><strong>Messen</strong> per <strong>📏 Messen</strong> oder <em>Umschalt+Ziehen</em>,
                     angezeigt in Feldern und Metern.</li>
                 <li><strong>⛶ Vollbild</strong> für den großen Blick; Spieleransicht, Dashboard und
                     Vollbild teilen sich dieselbe Leinwand. <strong>Einklappen</strong> schafft Platz,
                     ohne die Karte zu schließen.</li>
                 <li><strong>Markierungen</strong> (Freihand, Linie, Kreis, Rechteck) und den
                     <strong>Nebel des Krieges</strong> setzt der Spielleiter. Gegner im noch
                     verdeckten Nebel werden gar nicht erst an die Spieler übertragen.</li>
               </ul>`
    },
    'karte-werkzeuge': {
        gruppe: 'runde',
        titel: 'Karten-Werkzeuge (Spielleiter)',
        text: `<p>Die Leiste über der Karte. Jeder Knopf nennt beim Überfahren mit der Maus auch
               seine Aufgabe — auf dem Tablet gibt es diesen Tooltip nicht, deshalb hier alles der
               Reihe nach.</p>
               <p><strong>Karte und Figuren</strong></p>
               <ul>
                 <li><strong>🖼️ Karte</strong> lädt ein Bild; es wird verkleinert und in Stücken
                     an alle Spieler übertragen. <strong>📤 Senden</strong> schickt es erneut —
                     für alle, die später dazugekommen sind.</li>
                 <li><strong>👥 Aus Kampf</strong> setzt alle Kampfteilnehmer auf einmal.
                     <strong>➕ Figur</strong> setzt eine einzelne: einen verbundenen Spieler,
                     einen Gegner <em>aus dem Bestiarium</em> — der landet mit allen Werten
                     zugleich im Kampf-Tracker — oder einen reinen Marker ohne Werte.</li>
                 <li><strong>📏 Größe</strong> ändert die Feldzahl einer Figur (Drache, Riese …),
                     <strong>🙈</strong> verbirgt einzelne Gegner vor den Spielern.</li>
                 <li><strong>🗑️ Figur</strong> nimmt eine einzelne Figur von der Karte,
                     <strong>Figuren leeren</strong> räumt alle auf einmal ab.</li>
                 <li><strong>🔒 Züge prüfen / 🔓 Züge frei</strong> — normalerweise meldet ein
                     Spielerzug sich nur als Vorschlag an und du entscheidest. Außerhalb des
                     Kampfes nervt das; ein Klick gibt die Bewegung frei, die Spieler ziehen dann
                     direkt. Die Umstellung gilt sofort für alle und auch für später Beitretende.</li>
               </ul>
               <p><strong>Werkzeuge</strong> — jedes hat ein Tastenkürzel:
               <strong>H</strong> Hand, <strong>R</strong> Messen, <strong>M</strong> Malen,
               <strong>E</strong> Radieren, <strong>F</strong>/<strong>G</strong> Nebel auf/zu,
               <strong>Esc</strong> zurück zur Hand.</p>
               <ul>
                 <li><strong>✋</strong> bewegt Karte und Figuren, <strong>📏</strong> misst
                     (geht auch jederzeit mit <em>Umschalt+Ziehen</em>), <strong>✏️</strong> malt,
                     <strong>🧽</strong> radiert Markierungen weg. Das <strong>Mausrad zoomt</strong>,
                     die <strong>mittlere Maustaste schiebt die Karte</strong> — auch mitten im
                     Messen oder Zeichnen.</li>
                 <li><strong>↶</strong> nimmt die letzte Markierungs- oder Nebel-Aktion zurück
                     (auch <em>Strg+Z</em>) — bis zu 40 Schritte weit. Figuren-Positionen bleiben
                     unberührt, die wandern ja auch über Spieler-Vorschläge.</li>
                 <li>Bei ✏️ erscheint eine zweite Reihe: Freihand, Linie, Kreis, Rechteck und fünf
                     Farben. Der <strong>Kreis beschriftet sich mit seinem Radius in Metern</strong> —
                     gedacht für Zauberwirkungen.</li>
               </ul>
               <p><strong>Nebel des Krieges</strong></p>
               <ul>
                 <li><strong>🔦 Auf</strong> merkt einen Bereich zum Aufdecken <em>vor</em> — grün
                     gestrichelt und für die Spieler noch <strong>nicht</strong> sichtbar. Erst
                     <strong>Für Spieler freigeben</strong> in der Leiste darunter deckt ihn
                     wirklich auf; <em>Verwerfen</em> nimmt den Fehlgriff zurück.</li>
                 <li><strong>🌫️ Zu</strong> deckt wieder zu, ▭ und ⭕ wählen die Form des Bereichs
                     (rund z.B. für einen Lichtschein).</li>
                 <li><strong>Alles zu</strong> / <strong>Alles auf</strong> für die ganze Karte.</li>
               </ul>
               <p><strong>Raster</strong> — Ein Feld = 1 Meter. <em>Raster</em> blendet es ein,
               <em>Einrasten</em> lässt Figuren auf Feldmitten springen, die drei Zahlenfelder
               setzen Feldgröße (in Pixeln) und den Versatz waagerecht/senkrecht, damit das Raster
               auf das Bild passt — die <strong>−/+-Knöpfe kann man gedrückt halten</strong>. Die
               sechs Farbpunkte daneben stellen die <strong>Rasterfarbe</strong> um, falls Gold auf
               dem Kartenbild schlecht zu sehen ist. Das Mausrad zoomt.</p>`
    },
    'wizard': {
        gruppe: 'runde',
        titel: 'Charaktererschaffung',
        text: `<p>Sieben Schritte genau nach Regelwerk (S.3–7): Volk, Klasse, Attribute,
               Eigenschaften, Volks- &amp; Klassenbonus, Ausrüstung, Feinschliff.</p>
               <p>Die Budgets werden <strong>hart erzwungen</strong>: Der Weiter-Knopf bleibt
               gesperrt, solange nicht exakt verteilt ist, und die Plus-Knöpfe sperren an den
               Obergrenzen. Der Hinweistext in der Fußzeile sagt, woran es gerade hakt.</p>
               <p>Der Assistent startet immer von einem <strong>leeren Bogen</strong>, damit keine
               Talente oder Zauber des Vorgängers zurückbleiben.</p>`
    },
    'bestiarium': {
        gruppe: 'runde',
        titel: 'Bestiarium',
        text: `<p>78 Kreaturen aus dem Regelwerk, durchsuchbar und nach Gegnerhärte sortiert.</p>
               <ul>
                 <li>Ein Klick setzt die Kreatur in die <strong>Initiative-Reihenfolge</strong>.</li>
                 <li><strong>+ Karte</strong> setzt sie zugleich als Figur auf die Karte — in der
                     Größe ihrer Kategorie (groß = 2 Felder, riesig = 3, gewaltig = 4).</li>
                 <li>Mehrfach eingesetzte Gegner werden automatisch durchnummeriert.</li>
                 <li><strong>Heroisch</strong> und <strong>episch</strong> (S.105) skalieren
                     Lebenskraft, Abwehr, einen Angriffswert und die EP — jederzeit zurücknehmbar.</li>
               </ul>`
    },

    // ---------- Spielleiter ----------

    'gm-dashboard': {
        gruppe: 'sl',
        titel: 'Das Dashboard',
        text: `<p>Deine Sicht als Spielleiter. Oben steht der <strong>Raum-Code</strong>, den die
               Spieler brauchen, daneben die Verbindungsanzeige.</p>
               <p>Du siehst alle Helden live: Lebenskraft, Kampfwerte, Attribute, Ausrüstung,
               Talente, Zauber samt laufender Abklingzeiten, Inventar und EP/LP/TP — dazu jeden
               Wurf im Live-Log.</p>
               <p>In der Kopfzeile liegen <strong>🗺️ Karte</strong>, <strong>📡 Verbindung</strong>
               (Discord jederzeit ein- und ausrichtbar), <strong>Sitzung speichern/laden</strong>
               und die Hausregeln. Weiter unten der <strong>Kampf-Tracker</strong>, dein
               <strong>SL-Würfel</strong>, das <strong>🎵 Soundboard</strong> und die
               <strong>Spielerkarten</strong> — alle mit eigenem „?".</p>
               <p><strong>Dashboard verlassen</strong> bringt dich zurück auf den eigenen Bogen;
               der Raum wird dabei geschlossen.</p>`
    },
    'gm-kampf': {
        gruppe: 'sl',
        titel: 'Kampf & Initiative',
        text: `<p>Absteigend nach Initiative sortiert, bei Gleichstand mit einmaligem
               W20-„Stechen". Verbundene Spieler stehen mit Live-Werten in der Liste.</p>
               <ul>
                 <li>Der <strong>Rundenzähler</strong> wird an alle Spieler synchronisiert — daran
                     hängen die Abklingzeiten der Zauber.</li>
                 <li><strong>Abwartehandlung</strong> per Klick: +2 Initiative je Runde ohne Aktion
                     (höchstens +10); sobald der Charakter handelt, verfällt der Bonus.</li>
                 <li><strong>NSC-Angriffe</strong> per Klick: Gegen Spieler würfelt der Spieler
                     selbst seine Abwehr und bekommt den Restschaden angerechnet.</li>
                 <li>Beim Weiterschalten der Runde bekommt der Spieler, der jetzt dran ist,
                     automatisch eine Einblendung samt Ton. Zusätzlich stupst <strong>👉</strong>
                     einen trödelnden Spieler auf Knopfdruck an.</li>
                 <li><strong>Größenkategorien</strong> fließen automatisch ein — der Oger gegen den
                     Goblin bekommt seine −4 ohne dein Zutun.</li>
                 <li><strong>Gehört</strong> ordnet einen NSC einem verbundenen Spieler zu — praktisch
                     für Beschwörungen und Vertraute. Rein informativ (Namensschild in Spielerfarbe),
                     der Bogen rechnet daraus nichts automatisch aus.</li>
                 <li><strong>+ Zustand</strong> setzt einen Marker an jeden Teilnehmer, Gegner wie
                     Held (<em>Vergiftet</em>, <em>Brennt</em>, <em>Liegend</em> …). Mit
                     <em>„ / 3"</em> hinter dem Namen bekommt er eine Rundendauer, die beim
                     Rundenwechsel runterzählt und automatisch verfällt. Rein narrativ — der Bogen
                     zieht daraus keine Werte ab. Jede Änderung steht im SL-Log <strong>und</strong>
                     in den Logbüchern aller Spieler; Zustände auf einem Helden sieht dieser auch
                     oben in seinem Kampfkasten.</li>
               </ul>
               <p>Werte, die ein Statblock nicht nennt, setzt der Tracker als Platzhalter ein und
               sagt ausdrücklich dazu, dass sie nachgetragen gehören.</p>`
    },
    'gm-spieler': {
        gruppe: 'sl',
        titel: 'Spielerkarten',
        text: `<p>Je Held eine Karte mit allen Werten und geheimen SL-Notizen (die bleiben lokal
               bei dir).</p>
               <p>Von hier aus schickst du:</p>
               <ul>
                 <li><strong>Angriff</strong> — du gibst den <strong>Probenwert</strong> ein, das
                     Tool würfelt den Angriff aus (mit Patzer und Immersieg), der Spieler würfelt
                     automatisch seine Abwehr, und der Restschaden wird angerechnet und
                     zurückgemeldet. Für Fallen, Stürze und Umgebungsschaden, wo es keinen
                     Angriffswurf gibt, schreibst du ein <strong>=</strong> davor
                     (<em>=8</em>) — dann gilt der Wert unverändert als Schaden.</li>
                 <li><strong>Heilung</strong> und <strong>Schaden ohne Abwehrmöglichkeit</strong>.
                     Heilzauber zwischen Spielern (z.B. ein Heiler, der einen Kameraden heilt)
                     laufen automatisch über dich als Verteiler — im Log siehst du das als
                     <em>System</em>-Eintrag, ohne dass du etwas tun musst.</li>
                 <li><strong>🎲 Probe von allen</strong> — beim Spieler ist die passende Probe
                     direkt vorgewählt.</li>
                 <li><strong>✨ EP vergeben</strong> — nach S.88 die EP-Summe der besiegten Gegner
                     geteilt durch die Zahl der beteiligten Helden. Der Dialog nennt Summe, Teiler
                     und Ergebnis und schlägt das Viertel für ein erreichtes Abenteuerziel vor.</li>
                 <li><strong>👉 Anstupsen</strong> — ein Klick, und beim Spieler ploppt eine
                     Einblendung samt „du bist am Zug"-Ton auf. Für trödelnde Spieler oder um zu
                     zeigen: jetzt bist DU gemeint. (Beim Weiterschalten der Runde passiert das
                     ohnehin automatisch.)</li>
                 <li><strong>Flüstern</strong> an einzelne Spieler.</li>
               </ul>`
    },
    'gm-notizen': {
        gruppe: 'sl',
        titel: 'Kampagnen-Notizen & Ansagen',
        text: `<p>Freitext für die Runde — er wandert mit in die gespeicherte Sitzung.</p>
               <p><strong>📢 Ansage an alle</strong> schickt eine Nachricht in die Logbücher
               sämtlicher verbundener Spieler (und, falls eingerichtet, nach Discord).</p>`
    },
    'gm-wuerfel': {
        gruppe: 'sl',
        titel: 'SL-Würfel',
        text: `<p>Dein eigener Würfelkasten für NSC und Monster: Probenwert eintragen,
               <strong>Probe</strong> drücken. Dieselbe Mechanik wie beim Spieler, inklusive
               Immersieg, Patzer und Kettenwürfen über 20.</p>
               <p><strong>Wer sieht den Wurf?</strong> steuert, wohin das Ergebnis geht:</p>
               <ul>
                 <li><strong>alle Spieler</strong> — landet in jedem Logbuch (und, falls
                     eingerichtet, in Discord). So kann der Kampf-Mitschrieb den Bot ersetzen.</li>
                 <li><strong>verdeckt — nur ich</strong> — bleibt bei dir, auch nicht in Discord.
                     Für heimliche Proben (bemerkt der Dieb die Falle? lügt der NSC?).</li>
                 <li><strong>nur ein bestimmter Spieler</strong> (steht namentlich in der Liste,
                     sobald Spieler verbunden sind) — geht nur an diesen einen, sonst niemand.
                     Für Dinge, die nur eine Figur weiß.</li>
               </ul>
               <p>Auch die <strong>Kampfwürfe</strong> aus dem Tracker (NSC-Angriff und -Abwehr)
               wandern in die Logbücher aller Spieler — aber ohne Gegner-LK.</p>`
    },
    'gm-log': {
        gruppe: 'sl',
        titel: 'Live-Log',
        text: `<p>Jeder Wurf jedes verbundenen Spielers, dazu Ereignisse wie Schaden, Heilung,
               Bewusstlosigkeit, Stufenaufstieg und Kampfbeginn — in Echtzeit.</p>`
    },
    'gm-sitzung': {
        gruppe: 'sl',
        titel: 'Sitzung speichern & laden',
        text: `<p>Notizen, Gegner samt Lebenskraft und Position, Figurenplätze, Nebel,
               Markierungen und der Rundenzähler wandern in eine JSON-Datei — wahlweise mit oder
               ohne Kartenbild.</p>
               <p>Zusätzlich sichert das Tool laufend automatisch: Nach einem versehentlichen
               Neuladen bietet es an, die frühere Sitzung wiederherzustellen.</p>`
    }
};

// --- Popover ----------------------------------------------------------------

let hilfeAktiverKnopf = null;

function hilfePopover() {
    let pop = document.getElementById('help-pop');
    if (!pop) {
        pop = document.createElement('div');
        pop.id = 'help-pop';
        pop.className = 'help-pop';
        pop.setAttribute('role', 'dialog');
        document.body.appendChild(pop);
    }
    return pop;
}

function hilfeAnzeigen(id, knopf) {
    const thema = HILFE_THEMEN[id];
    if (!thema) return;

    // Zweiter Klick auf denselben Knopf schließt wieder.
    if (hilfeAktiverKnopf === knopf) { hilfeSchliessen(); return; }

    const pop = hilfePopover();
    pop.innerHTML = `
        <div class="help-pop-head">
            <span>❓ ${escapeHtml(thema.titel)}</span>
            <button class="btn btn-sm btn-ghost" onclick="hilfeSchliessen()" title="Schließen">✕</button>
        </div>
        <div class="help-pop-body">${thema.text}</div>
        <div class="help-pop-foot">
            <button class="btn btn-sm btn-ghost" onclick="openHilfe('${id}')">📖 Ganze Anleitung</button>
        </div>`;

    if (hilfeAktiverKnopf) hilfeAktiverKnopf.classList.remove('active');
    hilfeAktiverKnopf = knopf;
    knopf.classList.add('active');

    pop.style.display = 'block';
    hilfePositionieren(pop, knopf);
    requestAnimationFrame(() => pop.classList.add('active'));
}

// Popover unter dem Knopf ausrichten und im sichtbaren Bereich halten.
function hilfePositionieren(pop, knopf) {
    const r = knopf.getBoundingClientRect();
    const breite = pop.offsetWidth;
    const hoehe = pop.offsetHeight;
    const rand = 8;

    let left = r.left + r.width / 2 - breite / 2;
    left = Math.max(rand, Math.min(left, window.innerWidth - breite - rand));

    let top = r.bottom + 6;
    if (top + hoehe > window.innerHeight - rand) {
        const oben = r.top - hoehe - 6;
        top = oben >= rand ? oben : window.innerHeight - hoehe - rand;
    }
    // Egal was oben herauskam: sichtbar bleiben. Dank max-height passt es immer.
    top = Math.max(rand, Math.min(top, window.innerHeight - hoehe - rand));

    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
}

function hilfeSchliessen() {
    const pop = document.getElementById('help-pop');
    if (pop) {
        pop.classList.remove('active');
        setTimeout(() => { if (!pop.classList.contains('active')) pop.style.display = 'none'; }, 160);
    }
    if (hilfeAktiverKnopf) hilfeAktiverKnopf.classList.remove('active');
    hilfeAktiverKnopf = null;
}

// --- Gesamtanleitung --------------------------------------------------------

function openHilfe(aufklappen) {
    hilfeSchliessen();

    const nachGruppe = {};
    Object.entries(HILFE_THEMEN).forEach(([id, thema]) => {
        (nachGruppe[thema.gruppe] = nachGruppe[thema.gruppe] || []).push([id, thema]);
    });

    let html = `<p class="hint" style="margin-bottom:0.9rem">
        Die Kurzanleitung zum Tool. Dieselben Texte stecken hinter den
        <span class="help-btn help-btn-inline">?</span>-Symbolen überall im Bogen.
    </p>`;

    HILFE_GRUPPEN.forEach(gruppe => {
        const themen = nachGruppe[gruppe.id];
        if (!themen) return;
        html += `<h4 class="help-guide-group">${gruppe.titel}</h4>`;
        themen.forEach(([id, thema]) => {
            // Die ersten Schritte stehen offen, der Rest bleibt eingeklappt.
            const offen = (gruppe.id === 'start' || id === aufklappen) ? ' open' : '';
            html += `<details class="help-guide-item" id="hilfe-${id}"${offen}>
                        <summary>${escapeHtml(thema.titel)}</summary>
                        <div class="help-guide-body">${thema.text}</div>
                     </details>`;
        });
    });

    html += `<p class="hint-rule" style="margin-top:1.1rem">
        Etwas unklar geblieben oder ein Fehler aufgefallen? Auf dem
        <a href="https://discord.gg/DPk8QRSZ5W" target="_blank" rel="noopener">Discord-Server</a>
        werden diese Tools entwickelt — dort landen Fragen und Bug-Reports am schnellsten.
    </p>`;

    document.getElementById('hilfe-body').innerHTML = html;
    openModal('hilfe-modal');

    if (typeof aufklappen === 'string') {
        const ziel = document.getElementById('hilfe-' + aufklappen);
        if (ziel) setTimeout(() => ziel.scrollIntoView({ block: 'center' }), 80);
    }
}

// --- Verdrahtung ------------------------------------------------------------
// Delegation, damit auch Knöpfe in nachgerendertem Markup funktionieren.

document.addEventListener('click', e => {
    const knopf = e.target.closest('[data-hilfe]');
    if (knopf) {
        e.preventDefault();
        e.stopPropagation();
        hilfeAnzeigen(knopf.dataset.hilfe, knopf);
        return;
    }
    // Ein Klick daneben schließt das Popover.
    if (!e.target.closest('#help-pop')) hilfeSchliessen();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hilfeSchliessen();
});

// Beim Scrollen und Größenändern wandert das Popover mit seinem Knopf mit.
// Scrollt der Knopf aus dem Bild, schließt es sich.
function hilfeNachfuehren(e) {
    if (!hilfeAktiverKnopf) return;
    if (e && e.target && e.target.closest && e.target.closest('#help-pop')) return;

    const r = hilfeAktiverKnopf.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) { hilfeSchliessen(); return; }
    hilfePositionieren(document.getElementById('help-pop'), hilfeAktiverKnopf);
}

window.addEventListener('scroll', hilfeNachfuehren, true);
window.addEventListener('resize', hilfeNachfuehren);
