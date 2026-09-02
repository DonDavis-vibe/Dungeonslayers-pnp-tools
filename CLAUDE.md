# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Was das hier ist

**Slayer-Arsenal** — digitaler Charakterbogen und Spielleiter-Dashboard für das deutsche
Pen-&-Paper-Rollenspiel **Dungeonslayers 4**. Reines HTML/CSS/JavaScript, keine Abhängigkeiten,
kein `package.json`, kein lokaler Build-Schritt. Läuft direkt im Browser.
(Das GitHub-Repo heißt weiter `Dungeonslayers-pnp-tools` — die Pages-URL soll stabil bleiben.)

**Deployment: GitHub Actions**, nicht mehr „von `main`". `.github/workflows/deploy.yml` checkt aus,
setzt über `.github/inject-kontakt.py` den Impressums-Kontaktblock (Name, Anschrift, Telefon,
E-Mail) aus dem Repo-Secret `IMPRESSUM_KONTAKT` zwischen die `<!--KONTAKT:START-->` /
`<!--KONTAKT:END-->`-Marker in `imp/impressum.html` (zwei Vorkommen) und deployt das Ergebnis.
So stehen die personenbezogenen Pflichtangaben **nicht** im Repo, in Klons, Forks oder der
Git-History. Im Repo steht dort nur ein Platzhaltertext; lokal (`python -m http.server`) zeigt
die Impressumsseite entsprechend keinen Kontaktblock — das ist kein Fehler.

## Entwickeln und testen

```bash
python -m http.server 5178
```

Dann `http://localhost:5178` aufrufen. Ein Webserver ist nötig, weil `file://` das Nachladen der
Beispielcharaktere aus `beispiele/*.json` blockiert — der Rest liefe auch ohne.

Es gibt **keine Tests, keinen Linter, keinen Build**. Verifikation heißt: im Browser öffnen,
Konsole auf Fehler prüfen, die betroffene Funktion tatsächlich anklicken.

**Nach jeder Änderung an einer eingebundenen Datei die Versionsnummer hochzählen** — sonst
bekommen Besucher aus dem Browser-Cache die alte Fassung. Alle `<script>`- und
`<link rel="stylesheet">`-Tags in `index.html` tragen denselben `?v=YYYYMMDDx`-Parameter; bei einer
Änderung **alle** Vorkommen auf einmal hochzählen (nicht nur die geänderte Datei), sonst läuft die
Versionierung auseinander.

## Architektur

**Globaler Zustand, keine Frameworks.** `app.js` hält den Charakter in einem einzigen Objekt
(`appData`, siehe `blankCharacter()`), das komplett in `localStorage` unter `ds4_character`
gespiegelt wird. Jede Änderung ruft `renderAll()` (app.js) auf, das eine feste Kette von
`render*()`-Funktionen abarbeitet — kein Reactivity-System, keine Diffs, einfach neu rendern und
`innerHTML` ersetzen.

**Drei Schichten, sauber getrennt:**
- **Reine Regeldaten** (`data.js`, `talents.js`, `zauber.js`, `bestiarium.js`) — Arrays/Objekte
  ohne Logik. Werte korrigieren heißt: nur hier ändern.
- **Regel-Engine** (`rules.js`) — reine Funktionen, die aus `appData` + den Datendateien
  Kampfwerte und Probenergebnisse ableiten. Referenziert `regeln/ds4_rules_summary.md`.
  Kein DOM-Zugriff, kein globaler State außer den Datendateien.
- **Darstellung & Interaktion** (`app.js`, `talentPicker.js`, `spellPicker.js`, `wizard.js`,
  `combat.js`, `hausregeln.js`) — liest `appData`, ruft `rules.js` auf, schreibt ins DOM.

**Das Karten-Modul ist bewusst framework- und regelsystem-unabhängig.** `battlemap.js` kennt weder
Dungeonslayers noch Netzwerkcode; es verwaltet nur Canvas, Raster, Figuren, Markierungen und Nebel
des Krieges und meldet jede Änderung über einen `onChange`-Callback. Die Kopplung an Charakterbogen,
GM-Dashboard und WebRTC-Verbindung passiert ausschließlich in `mapui.js`. Wer `battlemap.js` anfasst,
darf keine DS4- oder multiplayer-spezifischen Annahmen einbauen.

**Zwei Ansichten in einem Dokument.** `#player-view` und `#gm-dashboard` liegen beide in
`index.html` und werden per `style.display` umgeschaltet, nicht geroutet. Die Karte
(`#map-widget`) ist ein einzelnes DOM-Element, das zwischen Spieleransicht, Dashboard und
Vollbild-Overlay *verschoben* wird (`appendChild`) — es existiert nur eine Canvas-Instanz.

**Mehrere Karten hält `mapui.js`, nicht `battlemap.js`.** Der Spielleiter kann mehrere benannte
Karten führen (`karten[]` in `mapui.js`); nur die aktive (`aktiveKarteId`) liegt in der einen
`BattleMap`-Instanz, die übrigen als gespeicherter `getState()`-Zustand plus Bild (im RAM und je
Karten-ID in IndexedDB). `kartenZuweisung` (Spielername → Karten-ID) gibt einzelnen Spielern eine
eigene Karte, wenn sich die Gruppe aufteilt; `verteileKarteFuerPeer` schickt jedem Peer die für
ihn geltende Karte, `peerBildSignatur` verhindert unnötiges Nachschicken des Bildes. Züge auf
einer nicht-aktiven Karte werden direkt in deren gespeicherten Zustand geschrieben. `battlemap.js`
weiß von all dem nichts — es bekam nur die reine Hilfsfunktion `BattleMap.fuerSpieler(zustand)`,
die einen gespeicherten Zustand für die Spieler filtert, ohne ihn in die Leinwand zu laden.

**Multiplayer ist WebRTC/PeerJS, kein Server.** `multiplayer.js` verbindet Spieler und Spielleiter
direkt; der Spielleiter-Client hält den maßgeblichen Zustand (Kampf, Karte, Nebel) und pusht ihn an
alle Spieler. `session.js` sichert diesen SL-Zustand zusätzlich lokal und bietet Wiederherstellung
nach einem versehentlichen Reload. `discord.js` ist ein optionaler, unabhängiger Broadcast-Kanal
per Webhook — ohne Verbindung zu WebRTC.

**Hilfesystem ist ein eigenständiges Verzeichnis.** `hilfe.js` enthält `HILFE_THEMEN` (ein Eintrag
pro Thema) und verdrahtet sich per Event-Delegation auf `[data-hilfe="…"]`-Knöpfe — auch auf
Markup, das andere Module erst zur Laufzeit erzeugen (z.B. die Karten-Werkzeugleiste in `mapui.js`,
der Slayerpunkte-Kasten in `app.js`). Ein neues Thema braucht nur einen Eintrag in `HILFE_THEMEN`
plus `data-hilfe="…"` am Element — keine zusätzliche Verdrahtung.

**Hausregeln sind ein Overlay auf der Engine.** `hausregeln.js` hält ein `hausregeln`-Objekt
(Steigerungskosten, Talentpunkte-Verteilung, Slayerpunkte/Slayende Würfel an/aus,
`heldenklassenFrueh` für das Fanwerk „Heldenklassen neu", eigene Talente/Zauber/Heldenklassen)
und wird vom Spielleiter gesetzt und an die Runde synchronisiert. Die Picker (`talentPicker.js`,
`spellPicker.js`) und `app.js` fragen dieses Objekt ab, statt Regelwerks-Standardwerte hart zu
codieren — `rules.js` selbst bleibt rein und bekommt den Modus als Argument gereicht (z.B.
`stufeFuerEp(ep, 'frueh')` für die langsamere EP-Spalte `epHeldFrueh`).

## Commit-Nachrichten

Commit-Texte sind deutsch, aber **ohne Umlaute und ß** (ue/oe/ae/ss statt ü/ö/ä/ß) — anders als
Code-Kommentare, UI-Texte und README, die ganz normal Umlaute verwenden. Betreffzeile knapp, Body
erklärt das **Warum** (oft mit Regelwerks-Seitenzahl oder Quelle wie „aus dem Forum" / „beim
Abgleich mit X aufgefallen"), nicht nur eine Liste des Diffs.

## Eigenheiten, die man kennen sollte

- **Skript-Ladereihenfolge in `index.html` ist eine echte Abhängigkeitskette**: Datendateien vor
  `rules.js` vor `app.js` vor den Pickern vor `multiplayer.js`/`mapui.js`. Beim Hinzufügen einer
  neuen Datei die Position entsprechend wählen, nicht einfach ans Ende hängen.
- **Kettenwürfe über 20** (`rules.js`) folgen S.40 des Regelwerks: erst werden alle Teilwürfel
  geworfen, danach wird die beste Zuordnung gesucht — nicht der Reihe nach zugewiesen.
- **Klassenfremde Rüstung** wird nicht nur gemeldet, sondern in Zaubern/Zielzauber/Initiative
  eingerechnet (S.41) — das ist absichtlich mehr als eine reine Regelwarnung.
- Bei Regelfragen ist `regeln/ds4_rules_summary.md` die schnelle Referenz, die PDFs in `regeln/`
  die verbindliche Quelle. Die PDFs selbst sind gitignored (Lizenzgründe, siehe `.gitignore`).
