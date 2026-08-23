<div align="center">
  <h1>⚔️ Dungeonslayers 4 — Charakterbogen &amp; Spielleiter-Dashboard</h1>
  <p>
    <strong>Ein interaktiver, regelkonformer Charakterbogen mit Live-Multiplayer und Kampf-Tracker
    für das kostenlose Pen-&amp;-Paper-Rollenspiel <em>Dungeonslayers 4</em>.</strong><br>
    <em>Kein Server, keine Accounts, kein Build-Schritt.</em>
  </p>

  <p>
    <a href="https://dondavis-vibe.github.io/Dungeonslayers-pnp-tools/"><strong>🎲 Tool direkt öffnen</strong></a>
  </p>

  <p>
    <a href="LICENSE"><img alt="Code: MIT" src="https://img.shields.io/badge/Code-MIT-yellow.svg"></a>
    <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de"><img alt="Regeldaten: CC BY-NC-SA 4.0" src="https://img.shields.io/badge/Regeldaten-CC%20BY--NC--SA%204.0-blue.svg"></a>
    <img alt="Keine Abhängigkeiten" src="https://img.shields.io/badge/Abh%C3%A4ngigkeiten-keine-brightgreen.svg">
  </p>
</div>

---

<div align="center">
  <img src="screenshots/charakterbogen-wuerfeln.png" alt="Der Charakterbogen mit automatisch berechneten Kampfwerten, Würfelbereich und Logbuch" width="90%">
  <p><em>Der Charakterbogen: alle Kampfwerte live berechnet, Proben per Klick, jeder Wurf im Logbuch.</em></p>
</div>

---

## Warum?

Dungeonslayers ist ein minimalistisches deutsches OSR-System, das komplett **kostenlos** als PDF
erhältlich ist ([dungeonslayers.net](https://www.dungeonslayers.net/downloads/)) — aber praktisch
keine digitalen Werkzeuge hat. Dieses Projekt schließt die Lücke.

## Schnellstart

**Einfach benutzen:** [dondavis-vibe.github.io/Dungeonslayers-pnp-tools](https://dondavis-vibe.github.io/Dungeonslayers-pnp-tools/)
öffnen — mehr braucht es nicht. Beim ersten Aufruf startet der Erschaffungs-Assistent; über
**👤 Beispiel** lädt man einen fertigen Charakter zum Ausprobieren.

**Lokal weiterentwickeln:**

```bash
git clone https://github.com/DonDavis-vibe/Dungeonslayers-pnp-tools.git
cd Dungeonslayers-pnp-tools
python -m http.server 5178
```

Dann `http://localhost:5178` aufrufen. Kein npm, kein Build-Schritt, keine Abhängigkeiten —
reines HTML, CSS und JavaScript.

> Ein kleiner Webserver ist nötig, weil Browser beim direkten Öffnen per `file://` das Nachladen
> der Beispielcharaktere blockieren. Der Rest des Tools funktioniert auch so.

---

## Features

### 🧙 Charaktererschaffung (7 Schritte)
Führt exakt durch den Ablauf aus dem Regelwerk (S.3–7):

1. **Volk** — Elf, Mensch oder Zwerg, mit Volksfähigkeiten
2. **Klasse** — Krieger, Späher oder Zauberwirker (Heiler / Zauberer / Schwarzmagier)
3. **Attribute** — 20 Punkte auf Körper/Agilität/Geist, keines über 8
4. **Eigenschaften** — 8 Punkte auf die sechs Eigenschaften, keine über 4
5. **Volks- &amp; Klassenbonus** — je +1, erst hier darf über 4 gestiegen werden
6. **Ausrüstung** — Waffen und Rüstung mit Live-Warnungen bei Regelverstößen
7. **Feinschliff** — Name und Vorschau aller Kampfwerte

Die Punktebudgets werden hart erzwungen: Der „Weiter"-Knopf bleibt gesperrt, solange nicht exakt
verteilt ist, und die Plus-Knöpfe sperren an den Obergrenzen.

### 📋 Der Charakterbogen
- **Alle Kampfwerte live berechnet** — Lebenskraft, Abwehr, Initiative, Laufen, Schlagen, Schießen,
  Zaubern, Zielzauber. Ausrüstung fließt automatisch ein (Waffenbonus, Panzerung, Initiative-Malus
  schwerer Rüstung, Laufen-Abzüge, Aura-Bonus der Runenrobe).
- **Regelprüfungen** — warnt, wenn ein Zwerg zum Bihänder greift, ein Zauberer Kettenrüstung anlegt
  oder ein Schild neben einer Zweihandwaffe hängt.
- **Höchstwerte** — die Eigenschafts-Obergrenze (12, +1 je durch Volk/Klasse begünstigter
  Eigenschaft) wird pro Eigenschaft berechnet und angezeigt.
- **Stufenaufstieg** — eigener Dialog mit den klassenabhängigen Lernpunkt-Kosten
  (günstige Eigenschaften 2 LP, übrige 3 LP, Lebenskraft 1 LP, Talentpunkt 3 LP).
- **Rasten** — *Verschnaufen* (halbe im Kampf verlorene LK zurück) und *Nachtruhe*
  (1W20/2 LK, +1 je 4 Stunden Bettruhe) als Ein-Klick-Aktionen.
- Inventar, Münzen und Notizen.

### ✨ Zaubersprüche (129 Stück, vollständig aus dem Regelwerk)
- Die Auswahl zeigt **nur Zauber, die dein Zauberwirker-Typ auf deiner Stufe lernen darf** —
  Heiler, Zauberer und Schwarzmagier haben unterschiedliche Zugangsstufen für denselben Spruch.
- Jeder Eintrag bringt Zauberbonus, Dauer, Distanz, Abklingzeit, Preis und Wirkung mit.
- Der **Zauberbonus des vorbereiteten Zaubers fließt automatisch** in Zaubern/Zielzauber ein.
- **Abklingzeiten** laufen am synchronisierten Rundenzähler mit; ein Patzer lässt den Zauber
  regelkonform „herausspringen".

### ⭐ Talente (125 Stück, vollständig aus dem Regelwerk)
Kein Freitextfeld, sondern eine echte Auswahl mit Regelprüfung:

- Die Liste zeigt **nur Talente, die deine Klasse auf deiner Stufe lernen darf**. Wer will, blendet
  die noch gesperrten mit ein — dort steht dann, ab welcher Stufe sie verfügbar werden.
- **Höchstränge werden erzwungen** — jedes Talent hat je Klasse einen eigenen Maximalrang (I–X).
- **Talentpunkte werden verrechnet**: 1 TP je Rang, beim Entfernen gibt es sie zurück, und ein
  Budget-Zähler warnt, wenn mehr Punkte verteilt sind als die Stufe hergibt.
- Wirkung und Steigerung pro Rang stehen direkt am Talent.
- **Dauerhafte Talentboni fließen automatisch in die Kampfwerte** — etwa *Kämpfer* (Schlagen +1
  je Rang), *Schütze* (Schießen und Zielzauber +1), *Einstecker* (LK +3), *Schnelle Reflexe*
  (Initiative +2), *Flink* (Laufen +1m) oder *Standhaft* (Bewusstlosigkeitsgrenze −3 LK).
  Die betroffene Karte weist den Bonus aus und nennt im Tooltip die Quelle.
- **Situative Talente** wie *Parade* oder *Blocker* werden bewusst **nicht** automatisch
  eingerechnet — sie stehen mit ihrer Bedingung als Erinnerung unter den Kampfwerten.
- **Heldenklassen** (ab Stufe 10, alle 15 mit ihren exklusiven Talentlisten) schalten zusätzliche
  Talente frei und heben teils den Höchstrang bereits bekannter Talente an.
- **Volksfähigkeiten** mit exakter Spielwirkung (z.B. Zwergen-*Zäh*: Abwehr +1, wird automatisch
  in die Kampfwerte eingerechnet).

### 🎲 Die Probenmechanik
Vollständig nach Regelwerk S.38–39 umgesetzt:

- **1W20 unterwürfeln** gegen den Probenwert. Wurf ≤ PW = Erfolg.
- **Immersieg** bei natürlicher 1 — immer Erfolg, zählt als bestmögliches Ergebnis (voller PW).
- **Patzer** bei natürlicher 20 — immer Fehlschlag, im Kampf mit der jeweiligen Zusatzfolge
  (Waffe fällt, Zauber springt heraus, Charakter stürzt).
- **Probenwerte über 20** werden korrekt in Kettenwürfe zerlegt (20, dann Rest). Nur der erste
  Würfel kann patzen, erfolgreiche Teilergebnisse werden summiert.
- **Angriffe:** das Wurfergebnis *ist* der Schaden — wird direkt so ausgewiesen.
- Schwierigkeitsmodifikatoren von Routine (+8) bis Äußerst schwer (−8).
- **Vergleichende Proben** — beide Seiten würfeln, die höhere gelungene Probe gewinnt;
  misslingen beide, gibt es kein Ergebnis.
- **Kampfmodifikatoren** als aufklappbares Feld: Entfernung (−1 je 10m), Zielen (+2 je Runde,
  max. +10), liegend, von hinten/der Seite, Größenunterschied und der Zwei-Waffen-Malus
  (automatisch um deine Ränge im Talent *Zwei Waffen* gemildert). Gilt nur für Kampfproben,
  nicht für gewöhnliche Fertigkeitsproben.
- **Gegnerabwehr** der geführten Waffe (Langschwert −2, Bihänder −4, waffenlos +5) fließt in die
  Abwehr des Ziels ein — beim Spieler automatisch, beim Spielleiter über die Schadenseingabe.
- 24 typische Proben (Klettern, Schleichen, Schlösser öffnen …) mit automatisch passender
  Attribut+Eigenschaft-Formel, inklusive Sonderfällen wie dem Mindestwert 8 bei *Bemerken*
  und dem elfischen *Leichtfüßig*-Bonus auf Schleichen.

### 📡 Live-Multiplayer (WebRTC, serverlos)
Der Spielleiter eröffnet einen Raum und erhält einen 4-stelligen Code; die Spieler treten damit bei.
Verbindung läuft direkt Peer-to-Peer über PeerJS — **keine Registrierung, keine Serverkosten**.

<div align="center">
  <img src="screenshots/spielleiter-dashboard.png" alt="Das Spielleiter-Dashboard mit zwei verbundenen Spielern, Kampf-Tracker und Live-Log" width="90%">
  <p><em>Das Spielleiter-Dashboard: alle Helden live im Blick, jeder Wurf im Protokoll.</em></p>
</div>

**Der Spielleiter sieht live:** Lebenskraft-Balken aller Helden, Kampfwerte, Attribute,
Eigenschaften, Ausrüstung, Talente, bekannte Zauber (inkl. laufender Abklingzeiten), das
**Inventar** und EP/LP/TP — dazu ein Live-Log jedes Wurfs. Pro Charakter gibt es geheime
SL-Notizen (lokal gespeichert).

**Der Spielleiter kann senden:**
- **Angriff** → der Spieler würfelt automatisch seine Abwehr, der Restschaden wird angerechnet
  und zurückgemeldet (genau der Ablauf aus dem Regelwerk)
- **Heilung** und **Schaden ohne Abwehrmöglichkeit**
- **Probe fordern** — einzeln oder von der ganzen Gruppe; beim Spieler wird die passende Probe
  direkt vorgewählt
- **Erfahrungspunkte** einzeln oder an alle. Die EP der besiegten Gegner werden aus dem
  Bestiarium vorgeschlagen, und ein dadurch ausgelöster Stufenaufstieg schreibt Lern- und
  Talentpunkte automatisch gut
- **Flüstern** an einzelne Spieler und **Ansagen an alle**
- die **aktuelle Kampfrunde**, an der die Abklingzeiten der Zauber hängen

**Verbindungsanzeige:** Sobald ein Spieler Multiplayer nutzt, erscheint in der Kopfzeile eine
dauerhafte Statusanzeige — grün bei bestehender Verbindung (mit Raum-Code), pulsierend gelb beim
Verbinden, rot bei Abbruch. Ohne Multiplayer bleibt sie unsichtbar. Ein Klick öffnet das Menü mit
bereits vorausgefülltem Raum-Code.

Robustheit ist eingebaut: Reconnect mit Backoff, wenn der Signalling-Server die Verbindung kappt,
Wiederherstellung nach einem Reload, und eine Fehlerdiagnose, die bei gescheiterten Verbindungen
die ICE-Kandidaten auswertet und konkret sagt, woran es lag (blockiertes WebRTC, striktes NAT …).
Für harte NAT-Fälle lässt sich ein eigener TURN-Server hinterlegen.

### 🤖 Discord-Anbindung (optional)
Damit die ganze Gruppe die Würfe mitliest und nicht nur der Spielleiter: Im Discord-Kanal unter
*Kanal bearbeiten → Integrationen → Webhooks* einen Webhook anlegen und die URL im Multiplayer-Menü
eintragen. Danach landen Würfe (mit Probenwert, Wurf, Ergebnis und farbcodiert nach Immersieg /
Erfolg / Fehlschlag / Patzer) und Ereignisse (Schaden, Heilung, Bewusstlosigkeit, Stufenaufstieg,
Kampfbeginn, EP-Vergabe, Ansagen des Spielleiters) als Discord-Nachricht im Kanal — mit dem
Charakternamen als Absender.

Würfe und Ereignisse lassen sich getrennt an- und abschalten, ein Testknopf prüft die Einrichtung.
Die Anfragen sind gedrosselt, damit Discord nichts verwirft, und ein Netzwerkausfall blockiert
das Tool nie.

> Die Webhook-URL ist ein Zugangsschlüssel für den Kanal. Sie liegt ausschließlich im
> `localStorage` dieses Browsers und wird bewusst **nicht** in die exportierte Charakterdatei
> geschrieben — geteilte Charaktere verraten den Webhook also nicht.

### 🗺️ Karte mit Raster, Figuren und Nebel des Krieges
Direkt in Bogen und Dashboard eingebettet, ein- und ausklappbar, dazu ein Vollbildmodus.
Nach Anhang B des Regelwerks gilt: **ein Feld = 1 Meter**.

- **Karte laden** — ein beliebiges Bild; es wird verkleinert und in Stücken an alle Spieler
  übertragen. Raster, Feldgröße und Versatz sind frei einstellbar.
- **Figuren** kommen per Klick aus dem Kampf-Tracker oder werden einzeln gesetzt. Spieler
  erscheinen mit ihrem **Charakterbild**, umrandet in ihrer Farbe.
- **Bewegung mit Bestätigung:** Zieht ein Spieler seine Figur, bleibt sie stehen und meldet den
  Zug als Vorschlag an — mit Entfernung in Feldern und Metern. Der Spielleiter sieht ihn neben
  dem *Laufen*-Wert des Helden, bekommt eine Warnung bei zu weiten Zügen und entscheidet.
  Der Spielleiter selbst versetzt Figuren jederzeit direkt.
- **Messen** per Werkzeug oder Umschalt+Ziehen, in Feldern und Metern.
- **Markierungen** als Freihand, Linie, Kreis oder Rechteck in fünf Farben. Der Kreis beschriftet
  sich mit seinem Radius in Metern — praktisch für Zauberwirkungen.
- **Nebel des Krieges** mit rechteckigen oder runden Bereichen. Aufgedeckte Bereiche werden erst
  **vorgemerkt** (grün gestrichelt, für Spieler unsichtbar) und auf Knopfdruck freigegeben, damit
  man Fehlgriffe korrigieren kann. Der Spielleiter sieht den Nebel halbdurchsichtig, die Spieler
  deckend; Gegner in ungedecktem Nebel werden gar nicht erst übertragen.

### ⚙️ Hausregeln
Dungeonslayers lebt von Fanwerken und Hausregeln — deshalb sind die wichtigsten Stellschrauben
einstellbar, ohne die Regeldateien anzufassen:

- **Steigerungskosten**: nach Regelwerk (günstige Eigenschaften 2 LP, übrige 3), **einheitlich**
  (die häufigste Hausregel: jede Eigenschaft gleich teuer) oder je Posten frei einstellbar.
- **Talentpunkte je Stufe** frei wählbar, dazu optional ein **zweiter, getrennt geführter Topf**
  (z.B. für Talente außerhalb des Kampfes). Name und Anzahl bestimmt ihr; beim Lernen wählt man,
  aus welchem Topf bezahlt wird, und beim Entfernen fließt der Punkt dorthin zurück.
- **Eigene Talente, Zauber und Heldenklassen** anlegen — sie erscheinen in den Auswahllisten neben
  den offiziellen, sind als *Hausregel* gekennzeichnet und unterliegen derselben Zugangsprüfung.

Der **Spielleiter stellt die Regeln ein und schickt sie an die Runde**; wer später beitritt,
bekommt sie automatisch. Zusätzlich lassen sie sich als Datei speichern und weitergeben.

### 💾 Sitzung speichern und laden (Spielleiter)
Notizen, Gegner samt Lebenskraft und Position, Figurenplätze auf der Karte, Nebel, Markierungen
und der Rundenzähler wandern in eine JSON-Datei — wahlweise mit oder ohne Kartenbild. Zusätzlich
sichert das Tool laufend automatisch: Nach einem versehentlichen Neuladen bietet es an, die
frühere Sitzung wiederherzustellen.

### ⚔️ Kampf-Tracker (Spielleiter)
- **Initiative-Reihenfolge** absteigend sortiert, mit einmaligem W20-„Stechen" bei Gleichstand
- **Rundenzähler**, der automatisch an alle Spieler synchronisiert wird
- **Bestiarium mit 78 Kreaturen** aus dem Regelwerk — durchsuchbar, nach Gegnerhärte sortiert,
  per Klick direkt in die Initiative-Reihenfolge. Mehrfach eingesetzte Gegner werden automatisch
  durchnummeriert. Eigene Gegner lassen sich daneben frei anlegen.
- **NSC-Angriffe** per Klick: gegen Spieler würfelt der Spieler selbst die Abwehr, gegen andere
  NSC wird sie direkt mit ausgewürfelt
- Verbundene Spieler werden mit Live-Werten in die Reihenfolge übernommen

---

## Beispielcharaktere

Im Ordner [`beispiele/`](beispiele/) liegen zwei fertige Helden zum Ausprobieren (über
„📂 Laden" einlesen):

| Charakter | Volk / Klasse | Profil |
|---|---|---|
| **Thorin Steinfaust** | Zwerg Krieger | Nahkampf-Brocken: LK 26, Abwehr 18, Schlagen 17 — dafür träge (Initiative 3) |
| **Elaria Mondweberin** | Elfin Zauberin | Zerbrechlich (LK 17, Abwehr 7), aber Zaubern 12 dank runenbestickter Robe |

<div align="center">
  <img src="screenshots/charakterbogen-zauberin.png" alt="Der Bogen einer Zauberin mit Zaubern- und Zielzauber-Werten sowie der Verbindungsanzeige" width="90%">
  <p><em>Zauberwirker bekommen zusätzlich Zaubern und Zielzauber; oben links zeigt die Anzeige die bestehende Verbindung zum Spielleiter.</em></p>
</div>

---

## Projektstruktur

| Datei | Inhalt |
|---|---|
| `index.html` | Aufbau von Spieleransicht, SL-Dashboard und Dialogen |
| `style.css` | Gesamtes Design |
| `data.js` | Regeldaten: Völker, Klassen, Waffen, Rüstungen, EP-Tabelle, typische Proben |
| `talents.js` | 125 Talente, 15 Heldenklassen, Volksfähigkeiten — aus dem Regelwerk extrahiert |
| `zauber.js` | 129 Zaubersprüche mit Zugangsstufen je Zauberwirker-Typ |
| `bestiarium.js` | 78 Kreaturen mit vollständigen Statblocks |
| `rules.js` | Regel-Engine: Kampfwert-Berechnung und Probenauflösung |
| `app.js` | Charakterbogen: Zustand, Darstellung, Würfeln, Stufenaufstieg |
| `talentPicker.js` | Talent-Auswahl mit Zugangs- und Rangprüfung |
| `spellPicker.js` | Zauber-Auswahl mit Zugangsprüfung |
| `wizard.js` | Charaktererschaffung |
| `combat.js` | Kampf- und Initiative-Tracker samt Bestiarium |
| `battlemap.js` | **Eigenständiges Karten-Modul** — kennt kein Regelsystem, frei wiederverwendbar |
| `mapui.js` | Anbindung der Karte an Bogen, Dashboard und Verbindung |
| `hausregeln.js` | Einstellbare Hausregeln und eigene Talente, Zauber und Heldenklassen |
| `session.js` | Sitzung des Spielleiters sichern, laden und nach einem Reload retten |
| `multiplayer.js` | WebRTC-Verbindung und SL-Dashboard |
| `discord.js` | Optionale Discord-Webhook-Anbindung |
| `regeln/` | Die offiziellen PDFs plus aufbereitete Regel-Referenzen |
| `beispiele/` | Fertige Charaktere als JSON |

Charaktere werden automatisch im `localStorage` gesichert und lassen sich als `.json`
exportieren und wieder einlesen.

---

## Regelwerk

Das Grundregelwerk (172 Seiten) und der Schnelleinstieg *First Slay* stehen kostenlos auf
[dungeonslayers.net](https://www.dungeonslayers.net/downloads/) zum Download bereit.

Aufbereitete Referenzen für die Entwicklung liegen unter [`regeln/`](regeln/) als Markdown — die
Mechanik-Zusammenfassung nennt zu jedem Abschnitt die Seitenzahl im PDF.

> **Hinweis für eine Veröffentlichung:** Die PDFs selbst gehören *nicht* in ein öffentliches
> Repository. Zwar stehen Texte und Regelmechaniken unter CC BY-NC-SA, die enthaltenen
> Illustrationen, das Covermotiv und die Logos aber ausdrücklich **nicht** — eine Weitergabe der
> kompletten PDF-Datei würde diese mitverbreiten. Stattdessen auf die offizielle Downloadseite
> verlinken. Siehe [`.gitignore`](.gitignore).

## Mitmachen

Mitstreiter sind sehr willkommen — das Projekt ist bewusst niedrigschwellig gehalten: reines HTML,
CSS und JavaScript, kein Framework, kein Build-Schritt. Repository klonen, Datei öffnen, loslegen.

Besonders hilfreich wäre:

- **Regelkorrekturen.** Das Tool ist aus dem PDF heraus entstanden, nicht aus Spielpraxis. Wenn eine
  Mechanik falsch umgesetzt ist, ist das die wertvollste Rückmeldung überhaupt — gerne als Issue.
- **Berichte aus dem Spiel.** Was fehlt am Tisch, was nervt, was wird nie benutzt?
- **Die optionalen Regeln** (Slayerpunkte, Slayende Würfel) als abschaltbare Erweiterung.
- **Fehlermeldungen**, gerne mit Browser und Schritten zum Nachstellen.

Wer keinen Code beisteuern möchte: Issues und Rückmeldungen sind genauso viel wert.

### Wo was steckt

Die Regeldaten (`talents.js`, `zauber.js`, `bestiarium.js`, `data.js`) sind reine Datendateien ohne
Logik — dort lassen sich Werte korrigieren, ohne den Rest anzufassen. Die eigentliche Regelmechanik
steckt kompakt in `rules.js`, alles Sichtbare in `app.js` und den Picker-Dateien.

**Das Karten-Modul ist bewusst systemunabhängig.** `battlemap.js` kennt weder Dungeonslayers noch
die Netzwerkverbindung — es zeichnet Karte, Raster, Figuren, Markierungen und Nebel, verwaltet Zoom
und Verschiebung und meldet jede Änderung über einen Rückruf. Für ein anderes Projekt reichen ein
paar Zeilen:

```js
const map = BattleMap.create(canvasElement, {
    onChange: zustand => verbindung.send(zustand),
    einheit: 1.5, einheitName: 'm'          // z.B. 1 Feld = 1,5 Meter
});
map.setBild(dataUrl);
map.addFigur({ id: 'p1', name: 'Thorin', farbe: '#d4a24c', x: 3, y: 4 });
map.applyState(vomNetzwerkEmpfangenerZustand);
```

Koordinaten sind immer Rasterfelder, nie Pixel — dadurch bleibt der Zustand unabhängig von
Bildschirmgröße und Zoomstufe und ist klein genug, um ihn bei jeder Bewegung zu übertragen.

### Nach einer Änderung: Versionsnummer hochzählen

Alle eigenen Dateien werden mit einem Versionsparameter eingebunden (`app.js?v=20260823c`). Wer
etwas ändert, zählt die Version in `index.html` hoch — sonst behalten Besucher die alte Fassung
aus dem Browser-Cache.

## Lizenz

**Programmcode** (`app.js`, `rules.js`, `wizard.js`, `combat.js`, `multiplayer.js`, `discord.js`,
`talentPicker.js`, `spellPicker.js`, `index.html`, `style.css`): MIT-Lizenz.

**Regeldaten** (`data.js`, `talents.js`, `zauber.js`, `bestiarium.js` sowie die Referenzen in
`regeln/`): abgeleitet aus dem Dungeonslayers-Regelwerk und daher unter
**[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de)** — dieselbe Lizenz,
unter der Christian Kennig Texte und Regelmechaniken freigegeben hat. Wirkungstexte sind
zusammengefasst, nicht wörtlich übernommen.

*Dungeonslayers* wurde von **Christian Kennig** geschaffen (Copyright © 2011, Burning Books, Berlin).
Dieses Tool ist ein nicht-kommerzielles Fan-Projekt und steht in keiner Verbindung zum Autor
oder zum Verlag.
