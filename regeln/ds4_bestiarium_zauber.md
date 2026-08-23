# Dungeonslayers 4 — Zaubersprüche & Bestiarium

Quelle: `regeln/Dungeonslayers4.pdf` (kostenloses Regelwerk, dungeonslayers.net).  
Seitenangaben als **PDF-Seite** (Buchseite = PDF-Seite − 10).  
Strukturierte Fassung: [`zauber.js`](../zauber.js) und [`bestiarium.js`](../bestiarium.js).  
Alle Effekt- und Fähigkeitstexte sind **kurz paraphrasiert** — Zahlenwerte sind exakt übernommen.

---

## 1. Zaubersprüche (PDF S. 58–87 / Buch S. 48–77)

129 Zaubersprüche. Zugangsstufen laut den Klassenlisten auf PDF S. 58–59.

* **Typ N** = normaler Zauber → Probe auf **Zaubern** (GEI + AU + ZB − PA)
* **Typ Z** = Zielzauber → Probe auf **Zielzauber** (GEI + GE + ZB − PA); das Probenergebnis ist der Schaden
* **G** = geistesbeeinflussend (im Buch gesondert markiert); Untote u.ä. sind immun, das Talent *Manipulator* gibt Bonus
* **Hei / Zau / Sch** = Zugangsstufe für Heiler / Zauberer / Schwarzmagier (– = kein Zugang)

| Spruch | Typ | G | Hei | Zau | Sch | Preis | ZB | Dauer | Distanz | Abklingzeit | Effekt (paraphrasiert) | PDF |
|---|:-:|:-:|--:|--:|--:|--:|---|---|---|---|---|--:|
| **Allheilung** | N |  | 10 | – | – | 650 | +0 | Augenblicklich | Berühren | 24 Stunden | Heilt sämtliche Verletzungen restlos und narbenfrei; abgetrennte Gliedmaßen lassen sich wieder anfügen, sofern sie höchstens W20 Stunden ab sind. | 60 |
| **Arkanes Schwert** | N |  | – | 10 | 8 | 920 | +0 | VE x 2 Kampfrunden | Radius von VE Meter | 24 Stunden | Ein selbstständig kämpfendes Lichtschwert erscheint im Radius von VE Metern und folgt gedanklichen Kampfbefehlen. Alle Kampfwerte = Stufe +10, Laufen = doppeltes Laufen des Zauberwirkers. | 60 |
| **Balancieren** | N |  | 2 | 3 | 6 | 45 | -2 | Bis Strecke zurückgelegt | Berühren | 10 Kampfrunden | Das Ziel balanciert mit vollem Laufen-Wert sicher über Seile u.ä., bis es die doppelte Laufen-Strecke zurückgelegt hat. | 60 |
| **Bannen** | N |  | 8 | 18 | 14 | 255 | -(KÖR+AU)/2 der Wesenheit | Augenblicklich | Radius von VE x 2 Meter | 100 Kampfrunden | Vernichtet feindliche Dämonen, Elementare und Untote im Radius, maximal Stufe/2 Wesenheiten. Jeder misslungene Bannversuch erschwert den nächsten um 2. | 60 |
| **Blenden** | Z |  | 1 | 5 | – | 10 | -(AGI+AU)/2 des Ziels | Probenergebnis in Kampfrunden | VE x 5 Meter | 5 Kampfrunden | Blendet ein Ziel (keine Abwehr erlaubt): -8 auf alle Handlungen, die Sehen erfordern. Wirkt auch auf augenlose Untote, nicht auf Blinde. | 61 |
| **Blitz** | Z |  | 10 | 7 | 7 | 310 | +3 | Augenblicklich | VE x 10 Meter | 1 Kampfrunde | Ein Blitz trifft einen Gegner; Schaden = Probenergebnis. Gegner in Metallrüstung dürfen keine Abwehr würfeln. | 61 |
| **Blut kochen** | Z |  | – | 17 | 13 | 1580 | -(KÖR+AU)/2 des Ziels | Augenblicklich | VE Meter | 24 Stunden | Das Blut des Ziels kocht: doppeltes Probenergebnis als Schaden, Abwehr ohne Panzerungsboni. Gegen blutlose Wesen nicht einsetzbar. | 61 |
| **Botschaft** | N |  | 8 | 6 | 8 | 510 | +0 | Bis ausformuliert | VE x 5 Kilometer | 24 Stunden | Ein geisterhaftes Abbild des Zaubernden erscheint bei einem bekannten Wesen in Reichweite und spricht bis zu VE x 2 Wortsilben. | 61 |
| **Duftnote** | N |  | 1 | 1 | 2 | 10 | +0 | Probenergebnis in Minuten | Berühren | 100 Kampfrunden | Versieht das Ziel mit einem angenehmen oder unangenehmen Geruch: +2 bzw. -2 auf dessen soziale Proben. | 63 |
| **Durchlässig** | N |  | – | 10 | 12 | 920 | -4 | VE/2 Kampfrunden | Selbst | 24 Stunden | Der Zauberwirker samt Ausrüstung wird für VE/2 Kampfrunden durchlässig und kann durch nichtmagische, unbelebte Objekte schreiten. | 63 |
| **Durchsicht** | N |  | 7 | 3 | 3 | 280 | -2 | VE Kampfrunden | Selbst | 24 Stunden | Der Zauberwirker sieht VE/2 Meter weit durch nichtmagische, unbelebte Objekte. | 63 |
| **Dämonen beschwören** | N |  | – | 17 | 10 | 1190 | -(KÖR+AU) des Dämonen und +BB | VE x 2 Stunden | Radius von VE Meter | 24 Stunden | Beschwört einen frei wählbaren Dämon (Flugfähigkeit erschwert die Probe). Er muss VE Aufträge erfüllen, bevor er zurückkehren darf, und kann nur auf Befehl angreifen. | 61 |
| **Ebenentor** | N |  | – | 18 | 16 | 2580 | -8 | VE Minuten | VE Meter | W20 Tage | Öffnet ein Tor zu einer namentlich genannten Existenzebene. Es schließt sich, sobald VE/2 Wesen hindurchgegangen sind oder die Dauer endet. | 63 |
| **Einschläfern** | N | ● | 2 | 5 | 5 | 45 | -(KÖR+VE)/2 des jeweiligen Ziels | Augenblicklich | Radius von VE x 2 Meter | 10 Kampfrunden | Versetzt bis zu Stufe viele Ziele in natürlichen Schlaf, aus dem sie durch Kampflärm u.ä. erwachen können. | 63 |
| **Elementar herbeirufen** | N |  | – | 10 | 16 | 920 | -Elementarstufe x 5 | VE Stunden | Radius von VE Meter | 24 Stunden | Ruft ein Elementar (Erde, Feuer, Luft oder Wasser — je ein eigener Spruch) der Elementarstufe I-III herbei; höhere Stufe senkt den ZB. Es muss VE Aufträge erfüllen. | 63 |
| **Erdspalt** | N |  | 10 | 10 | 14 | 325 | -4 | VE Kampfrunden | VE x 2 Meter | 100 Kampfrunden | Öffnet auf festem Boden einen Spalt (VE m breit, VE/2 m lang und tief). Betroffene dürfen sich mit AGI+BE aktionsfrei retten; wer beim Schließen darin ist, erleidet 2W20 nicht abwehrbaren Schaden. | 64 |
| **Federgleich** | N |  | 5 | 3 | 3 | 110 | +0 | 1 Minute und bis Distanz gefallen | Berühren | 0 Kampfrunden | Das Ziel gleitet aus bis zu doppeltem Probenergebnis in Metern sanft zu Boden (1m pro Kampfrunde). Der Fall muss binnen 1 Minute beginnen. | 64 |
| **Feueratem** | Z |  | – | 10 | 10 | 460 | +3 | Augenblicklich | VE Meter | 10 Kampfrunden | Eine Flammensäule aus dem Mund trifft alle Gegner in einer 1m breiten, geraden Schneise; nicht abwehrbarer Schaden in Höhe des Probenergebnisses. | 64 |
| **Feuerball** | Z |  | – | 10 | 10 | 460 | +3 | Augenblicklich | VE x 10 Meter | 10 Kampfrunden | Ein Feuerball explodiert im Radius von VE Metern; nicht abwehrbarer Schaden in Höhe des Probenergebnisses. | 65 |
| **Feuerlanze** | Z |  | – | 5 | 5 | 210 | +2 | Augenblicklich | VE x 10 Meter | 0 Kampfrunden | Mächtigere Variante des Feuerstrahls; Schaden = Probenergebnis. | 65 |
| **Feuerstrahl** | Z |  | – | 1 | 1 | 10 | +1 | Augenblicklich | VE x 5 Meter | 0 Kampfrunden | Ein Feuerstrahl trifft einen Feind; Schaden = Probenergebnis. | 65 |
| **Feuerwand** | N |  | – | 8 | 10 | 360 | -2 | VE Kampfrunden | VE x 2 Meter | 100 Kampfrunden | Erschafft eine Feuerwand von maximal 1m x VE m x VE m. Wer darin steht oder hindurchspringt, erleidet 2W20 abwehrbaren Schaden. | 65 |
| **Flackern** | N |  | 2 | 4 | 4 | 45 | -2 | Probenergebnis x 2 Kampfrunden | Selbst | 100 Kampfrunden | Der Zauberwirker flackert und erhöht seine Abwehr um GEI/2 (nicht gegen einhüllenden Flächenschaden). | 66 |
| **Flammeninferno** | Z |  | – | 15 | 15 | 1420 | +5 | VE Kampfrunden | VE x 10 Meter | 24 Stunden | Eine Kreisfläche mit Radius VE Meter steht in Flammen; jeder darin erleidet pro Kampfrunde nicht abwehrbaren Schaden in Höhe des Probenergebnisses. | 66 |
| **Flammenklinge** | Z |  | – | 4 | 4 | 160 | +0 | Probenergebnis in Kampfrunden | VE x 2m | 100 Kampfrunden | Hüllt eine Metallklinge in magisches Feuer: WB +1 und magischer Schaden. Ein Immersieg verdoppelt den erwürfelten Schaden dieser Kampfrunde. | 66 |
| **Fliegen** | N |  | 20 | 10 | 10 | 460 | +0 | Probenergebnis x 5 Kampfrunden | Berühren | 100 Kampfrunden | Das Ziel kann fliegen; die Fluggeschwindigkeit ist doppelt so hoch wie der Laufen-Wert am Boden (rennend nochmals verdoppelt). | 66 |
| **Fluch** | N |  | – | 6 | 2 | 150 | - (GEI+AU)/2 des Ziel | Probenergebnis Tage | Berühren | 24 Stunden | Benötigt einen Gegenstand des Ziels, der beim Zaubern zerstört wird. Das verfluchte Ziel erhält -2 auf alle Proben; jeder Fluch muss einzeln per Magie bannen entfernt werden. | 66 |
| **Freund** | N | ● | 6 | 7 | 8 | 370 | -(GEI+VE)/2 des Ziels | VE Minuten | VE x 2 Meter | 24 Stunden | Das Ziel hält den Zauberwirker für einen sehr guten Freund, vertraut ihm entsprechend und handelt entsprechend für ihn. | 67 |
| **Frostschock** | Z |  | – | 12 | 16 | 560 | +3 | Augenblicklich | VE x 10 Meter | 10 Kampfrunden | Ein Eisstrahl verursacht nicht abwehrbaren Schaden und friert das Ziel VE Kampfrunden ein oder bis es Schaden erhält. | 67 |
| **Frostwaffe** | Z |  | – | 4 | – | 160 | +0 | Probenergebnis in Kampfrunden | VE x 2 Meter | 100 Kampfrunden | Hüllt eine Waffe in eisige Kälte: WB +1 und magischer Schaden. Ein Immersieg friert den Gegner 1 Kampfrunde ein (wie Halt). Nicht mit Flammenklinge kombinierbar. | 67 |
| **Gasgestalt** | N |  | – | 15 | 18 | 1420 | +0 | Probenergebnis x 5 Kampfrunden | Berühren | 24 Stunden | Das Ziel wird samt Ausrüstung gasförmig (Laufen x 4) und passt durch kleinste Öffnungen; Zaubern, Sprechen und Angreifen sind unmöglich. Jederzeit als freie Aktion beendbar. | 67 |
| **Geben und Nehmen** | N |  | 4 | – | – | 115 | +0 | Probenergebnis in Kampfrunden | Berühren | 5 Kampfrunden | Das Ziel erhält 50% des von ihm im Nahkampf verursachten Schadens (nach Abwehr des Gegners) als Heilung auf die eigene Lebenskraft. | 68 |
| **Gehorche** | N | ● | – | 12 | 10 | 1120 | -(GEI+VE)/2 des Ziels | VE/2 Kampfrunden | VE x 2 Meter | 24 Stunden | Das Ziel wird hörig und führt jeden Befehl aus, außer Selbstmord oder Selbstverstümmelung; es greift sogar eigene Kameraden an. | 68 |
| **Giftbann** | N |  | 3 | 6 | 12 | 80 | +0 | Augenblicklich | Berühren | 10 Kampfrunden | Neutralisiert augenblicklich ein nichtmagisches Gift, sofern es nicht zu spät ist. | 68 |
| **Giftschutz** | N |  | 1 | 2 | 8 | 10 | +0 | VE Stunden | Berühren | 10 Kampfrunden | Das Ziel erhält einen Abwehr-Bonus gegen Gifte in Höhe der Stufe des Zauberwirkers; der Bonus allein wirkt auch, wo sonst keine Abwehr erlaubt ist. | 68 |
| **Glühender Glaube** | N |  | 6 | – | – | 185 | -2 | Probenergebnis in Kampfrunden | Berühren | 100 Kampfrunden | Die berührte Waffe verursacht magischen Schaden, ihr WB steigt um VE/2 und die Abwehr getroffener Gegner sinkt um VE/2. | 68 |
| **Halt** | Z |  | 2 | 6 | 6 | 45 | -(KÖR+AU)/2 des Ziels | VE Kampfrunden | VE x 5 Meter | 10 Kampfrunden | Das Ziel (keine Abwehr erlaubt) kann sich nicht mehr bewegen; die Starre endet vorzeitig bei Schaden. Atmen, Denken und Zauberwechsel bleiben möglich. | 68 |
| **Heilbeeren** | N |  | 1 | 10 | – | 20 | +0 | Augenblicklich | Berühren | 24 Stunden | Versieht Probenergebnis viele Beeren o.ä. mit Heilkraft (bei Druiden x 2); jede heilt 1 LK, bis zu 10 pro Aktion. Wirkung verfällt nach VE Tagen oder beim erneuten Wirken. | 68 |
| **Heilende Aura** | N |  | 1 | – | – | 10 | +0 | Probenergebnis x 2 Kampfrunden | Selbst | 100 Kampfrunden | Der Heiler und alle Gefährten im Radius von VE Metern werden jede Kampfrunde um 1 LK geheilt. | 69 |
| **Heilende Hand** | N |  | 1 | – | – | 10 | +1 | Augenblicklich | Berühren | 0 Kampfrunden | Heilt durch Handauflegen Lebenskraft in Höhe des Probenergebnisses. | 69 |
| **Heilende Strahlen** | Z |  | 12 | – | – | 395 | +0 | Augenblicklich | VE x 2 Meter | 2 Kampfrunden | Heilt bis zu VE/2 Gefährten um das Probenergebnis. Nur eine Probe; als Malus zählt nur der Distanzmalus des am weitesten entfernten Ziels. | 69 |
| **Heilendes Feld** | Z |  | 18 | – | – | 1210 | +2 | Augenblicklich | Radius von VE x 2 Meter | 24 Stunden | Heilt alle Gefährten im Wirkungsradius um das Probenergebnis. | 69 |
| **Heilendes Licht** | Z |  | 4 | – | – | 115 | +2 | Augenblicklich | VE x 2 Meter | 2 Kampfrunden | Ein Lichtstrahl heilt die Lebenskraft des Ziels in Höhe des Probenergebnisses. | 70 |
| **Heiliger Hammer** | N |  | 10 | – | – | 1325 | +0 | VE Kampfrunden | Radius von VE x 2 Meter | 100 Kampfrunden | Ein selbstständig kämpfender Lichthammer erscheint im Radius von VE Metern und folgt gedanklichen Kampfbefehlen; der Wirkungsbereich wandert mit dem Heiler mit. | 70 |
| **Kettenblitz** | Z |  | 16 | 10 | 10 | 460 | +3 | Augenblicklich | VE x 5 Meter | 5 Kampfrunden | Ein Blitz trifft einen Feind und springt auf bis zu VE weitere Gegner im Umkreis über. Getroffene in Metallrüstung dürfen keine Abwehr würfeln. | 70 |
| **Kleiner Terror** | N | ● | 2 | 6 | 4 | 45 | -(GEI+VE)/2 des Ziels | VE Kampfrunden | Radius von VE x 2 Meter | 100 Kampfrunden | Bis zu Stufe/2 Ziele fliehen panisch, bis die Zauberdauer endet. Der Effekt endet für jeden Fliehenden, der Schaden erleidet. | 70 |
| **Kontrollieren** | N |  | – | 8 | 4 | 205 | -(GEI+AU)/2 des Ziels | Bis erlöst | VE x 2 Meter | 10 Kampfrunden | Bringt bis zu Stufe viele Untote unter Kontrolle, auch fremd beherrschte; sie führen bedingungslos alle Befehle aus. | 70 |
| **Körperexplosion** | Z |  | – | – | 20 | 3735 | -(KÖR+AU)/2 des Ziels | Augenblicklich | VE Meter | W20 Tage | Das Ziel explodiert: vierfaches Probenergebnis als Schaden, Abwehr ohne Panzerungsboni. Gegen körperlose Wesen nicht einsetzbar. | 71 |
| **Lauschen** | N |  | 6 | 2 | 2 | 75 | -1 pro 10m Entfernung | VE x 2 Kampfrunden | Selbst | 100 Kampfrunden | Verlagert das Hörzentrum an einen bis zu VE x 5 Meter entfernten Punkt in Sichtlinie und hört alles, was dort zu hören ist. | 71 |
| **Licht** | N |  | 1 | 1 | 5 | 10 | +5 | Probenergebnis in Minuten | Berühren | 10 Kampfrunden | Ein berührtes, lebloses Objekt leuchtet fackelhell auf. | 71 |
| **Lichtlanze** | Z |  | 10 | 12 | – | 325 | +5 | Augenblicklich | VE x 5 Meter | 1 Kampfrunde | Mächtigere Variante des Lichtpfeils; Wesen der Dunkelheit erhalten -2 auf ihre Abwehr. Für Charaktere mit dem Talent Diener der Dunkelheit gesperrt. | 71 |
| **Lichtpfeil** | Z |  | 2 | 5 | – | 45 | +2 | Augenblicklich | VE x 5 Meter | 1 Kampfrunde | Zielzauber gegen dessen Schaden Wesen der Dunkelheit -2 auf ihre Abwehr erhalten. Für Charaktere mit dem Talent Diener der Dunkelheit gesperrt. | 72 |
| **Lichtsäule** | Z |  | 16 | 19 | – | 535 | +8 | Augenblicklich | VE x 10 Meter | 1 Kampfrunde | Mächtigere Variante der Lichtlanze; Wesen der Dunkelheit erhalten -2 auf ihre Abwehr. Das Talent Vergeltung addiert seinen Rang auf den PW; für Diener der Dunkelheit gesperrt. | 72 |
| **Magie bannen** | N |  | 12 | 7 | 12 | 620 | - Wirkerstufe bzw. -LK/2 | Augenblicklich | VE Meter | 24 Stunden | Bannt permanent einen Zauber oder magischen Effekt; Malus = Stufe des Wirkers bzw. LK/2 bei magischen Wesen. Gegen Wesen verursacht ein Erfolg nicht abwehrbaren Schaden statt Bannung. | 72 |
| **Magie entdecken** | N |  | 1 | 1 | 1 | 10 | +0 | Probenergebnis in Kampfrunden | Radius von VE x 2 Meter | 10 Kampfrunden | Lässt alle nicht verborgene Magie im Wirkungsbereich für den Zauberwirker kurz aufleuchten; je heller, desto mächtiger. | 72 |
| **Magie identifizieren** | N |  | 5 | 1 | 1 | 10 | +0 | Augenblicklich | Berühren | 1 Kampfrunde | Offenbart Quelle und/oder Funktion der Magie eines Objektes oder einer Örtlichkeit. | 72 |
| **Magische Barriere** | N |  | 14 | 10 | 12 | 920 | -2 | VE Minuten oder Konzentration | VE x 2 Meter | 24 Stunden | Erschafft ein unbewegliches Kraftfeld von maximal VE/2 m³, das sämtliche Magie nach innen wie außen blockt; per Konzentration verlängerbar. | 73 |
| **Magische Rüstung** | N |  | 4 | 8 | 8 | 230 | +0 | Augenblicklich | Selbst | 24 Stunden | Erhöht die Lebenskraft um das Wurfergebnis. Schaden zehrt zuerst diese (nicht heilbaren) LK auf; sie bleiben bis zum Verbrauch oder erneuten Wirken bestehen. | 73 |
| **Magische Waffe** | N |  | 1 | 1 | 1 | 10 | +0 | VE Minuten | Berühren | 1 Kampfrunde | Erhöht den WB einer Waffe um +1; ihr Schaden gilt als magisch und verletzt damit auch körperlose Wesen. | 73 |
| **Magisches Schloss** | N |  | 3 | 1 | 1 | 10 | +0 | Bis Schloss geöffnet | Berühren | 5 Kampfrunden | Verschließt Klappe, Truhe oder Tür magisch; das Probenergebnis ist die Erschwernis zum Öffnen. Auch auf mechanische Schlösser wirkend (erhöht den SW). | 73 |
| **Manabrot** | N |  | – | 5 | 5 | 420 | +0 | Augenblicklich | VE Meter | 24 Stunden | Erschafft bis zu Stufe/2 Laibe Manabrot; jeder entspricht einer vollen Mahlzeit (3 pro Tag und Person nötig). | 73 |
| **Nahrung zaubern** | N |  | 2 | 7 | – | 90 | +0 | Augenblicklich | VE Meter | 24 Stunden | Erschafft die Grundzutaten für bis zu Stufe viele einfache Mahlzeiten (3 pro Tag und Person nötig). | 74 |
| **Netz** | Z |  | 4 | 9 | 9 | 115 | -(AGI+ST)/2 des Ziels | Probenergebnis/2 Kampfrunden | VE x 5 Meter | 10 Kampfrunden | Ein klebriges Netz mit Radius VE/2 Meter erscheint; Getroffene (keine Abwehr) halbieren Initiative, Laufen und Schlagen. Wirkungslos gegen 2+ Größenkategorien größere Wesen. | 74 |
| **Niesanfall** | Z |  | 1 | 3 | 3 | 10 | -(KÖR+AU)/2 des Ziels | 1 Kampfrunde | VE x 2 Meter | 0 Kampfrunden | Das Ziel (keine Abwehr erlaubt) kann sich vor Niesen nur mit halbiertem Laufen-Wert bewegen, bis der Zauberwirker wieder an der Reihe ist; endet vorzeitig bei Schaden. | 74 |
| **Putzteufel** | N |  | – | 5 | 5 | 420 | +0 | bis zu VE/2 Stunden | VE x 2 Meter | 24 Stunden | Erschafft einen kleinen magischen Diener, der putzt, aufräumt und packt; er befolgt keine anderen Befehle und verpufft bei Schaden. | 74 |
| **Reinigen** | N |  | 3 | 7 | – | 80 | +0 | Augenblicklich | Berühren | 0 Kampfrunden | Reinigt eine Person, einen Gegenstand oder eine Mahlzeit (von Schmutz, Bakterien, Fäulnis und Gift). | 75 |
| **Rost** | Z |  | 5 | 7 | 8 | 150 | -WB der Waffe bzw. -PA der Rüstung | Augenblicklich | VE x 2 Meter | 10 Kampfrunden | Lässt eine nichtmagische Waffe oder ein nichtmagisches Rüstungsteil aus Metall augenblicklich zu Staub zerfallen. | 75 |
| **Schatten** | Z |  | – | 6 | 2 | 75 | -(AGI+AU)/2 des Ziels | Probenergebnis/2 in Kampfrunden | VE x 5 Meter | 5 Kampfrunden | Schatten umhüllen das Ziel (keine Abwehr erlaubt): -8 auf alle Handlungen, die Sehen erfordern. Wirkungslos gegen augenlose Untote und Blinde. | 75 |
| **Schatten erwecken** | N |  | – | – | 13 | 1580 | +0 | Augenblicklich | Radius von VE x 5 Meter | 24 Stunden | Erweckt bis zu Stufe viele Tote im Radius als Schatten. Sie erheben sich nach drei Kampfrunden und greifen den Erwecker an, wenn er sie nicht per Kontrollieren beherrscht. Für Diener des Lichts gesperrt. | 75 |
| **Schattenklinge** | Z |  | – | 8 | 7 | 360 | +0 | Probenergebnis in Kampfrunden | VE x 2 Meter | 100 Kampfrunden | Nur für Träger mit dem Talent Diener der Dunkelheit: WB +1, magischer Schaden, und jeder verursachte Schaden senkt die Abwehr des Ziels um 1. | 75 |
| **Schattenlanze** | Z |  | – | 15 | 10 | 595 | +5 | Augenblicklich | VE x 10 Meter | 0 Kampfrunden | Mächtigere Variante des Schattenpfeils; Wesen des Lichts erhalten -2 auf ihre Abwehr. Für Charaktere mit dem Talent Diener des Lichts gesperrt. | 75 |
| **Schattenpfeil** | Z |  | – | 6 | 2 | 75 | +2 | Augenblicklich | VE x 10 Meter | 0 Kampfrunden | Zielzauber gegen dessen Schaden Wesen des Lichts -2 auf ihre Abwehr erhalten. Für Charaktere mit dem Talent Diener des Lichts gesperrt. | 76 |
| **Schattensäule** | Z |  | – | 20 | 15 | 920 | +8 | Augenblicklich | VE x 10 Meter | 1 Kampfrunde | Mächtigere Variante der Schattenlanze; Wesen des Lichts erhalten -2 auf ihre Abwehr. Das Talent Vergeltung addiert seinen Rang auf den PW; für Diener des Lichts gesperrt. | 76 |
| **Schleudern** | Z |  | 18 | 12 | 10 | 535 | -(KÖR+AU)/2 des Ziels | Augenblicklich | VE/2 Meter | 10 Kampfrunden | Schleudert das Ziel (keine Abwehr) Probenergebnis/3 Meter weit fort; es erleidet abwehrbaren Sturzschaden für die Distanz und liegt danach am Boden. | 76 |
| **Schutzfeld** | N |  | 4 | 8 | 8 | 115 | +0 | Probenergebnis in Kampfrunden | Selbst | 100 Kampfrunden | Ein Schutzfeld mit Radius VE Meter lässt nichtmagische Geschosse von außen wirkungslos abprallen. | 76 |
| **Schutzkuppel** | N |  | 8 | 12 | 12 | 765 | +0 | Konzentration | Selbst | W20 Tage | Eine unbewegliche Kuppel mit Radius VE Meter ist von beiden Seiten unpassierbar für Angriffe, Personen und Zauber; hält nur bei ununterbrochener Konzentration. | 77 |
| **Schutzschild** | N |  | 4 | 8 | 8 | 115 | +0 | Probenergebnis in Kampfrunden | Berühren | 100 Kampfrunden | Das Ziel erhält das Probenergebnis als Bonus auf seine Abwehr, bis die Zauberdauer abläuft. | 77 |
| **Schutzschild dehnen** | N |  | 4 | – | – | 230 | +0 | Augenblicklich | Berühren | 24 Stunden | Verdoppelt die erwürfelte Dauer eines bereits auf das Ziel wirkenden Schutzschild-Zaubers. | 77 |
| **Schutzschild stärken** | N |  | 4 | – | – | 230 | +0 | Augenblicklich | Berühren | 24 Stunden | Verdoppelt den Abwehr-Bonus eines bereits auf das Ziel wirkenden Schutzschild-Zaubers. | 77 |
| **Schweben** | N |  | 7 | 5 | 5 | 210 | +0 | Probenergebnis in Kampfrunden | Berühren | 0 Kampfrunden | Das Ziel kann statt zu laufen lotrecht auf und ab schweben, mit demselben Laufen-Wert wie am Boden (kein Rennen). | 77 |
| **Schweig** | Z |  | 12 | 10 | 8 | 395 | -(GEI+AU)/2 des Ziels | VE/2 Kampfrunden | VE x 2 Meter | 100 Kampfrunden | Das Ziel (keine Abwehr erlaubt) verstummt; betroffene Zauberwirker können nur noch wortlos zaubern. | 77 |
| **Segen** | N |  | 2 | – | – | 90 | +0 | VE Stunden | Selbst | 24 Stunden | Der Zauberwirker und bis zu VE x 2 Kameraden im Umkreis von VE x 2 Metern erhalten +1 auf alle Proben. | 77 |
| **Skelette erwecken** | N |  | – | – | 6 | 670 | +0 | Augenblicklich | Radius von VE x 5 Meter | 24 Stunden | Erweckt bis zu Stufe viele Skelette im Radius. Sie erheben sich nach drei Kampfrunden und greifen den Erwecker an, wenn er sie nicht per Kontrollieren beherrscht. Für Diener des Lichts gesperrt. | 78 |
| **Spionage** | N |  | 8 | 6 | 4 | 205 | +0 | VE x 2 Kampfrunden | Selbst | 100 Kampfrunden | Der Zauberwirker löst seine Seh- und Hörsinne vom Körper; der unsichtbare Blick bewegt sich VE Meter pro Kampfrunde und dringt durch kleinste Öffnungen. | 78 |
| **Springen** | N |  | 5 | 2 | 3 | 60 | +0 | Augenblicklich | Selbst | 10 Kampfrunden | Der Zauberwirker springt bis zu Probenergebnis/2 Meter weit (alternativ hoch oder runter) und landet sicher. | 78 |
| **Spurt** | N |  | 7 | 7 | 7 | 220 | -2 | Probenergebnis in Kampfrunden | Berühren | 100 Kampfrunden | Verdoppelt den Laufen-Wert des Ziels für die Zauberdauer. | 78 |
| **Steinwand** | N |  | – | 10 | 14 | 920 | -2 | Augenblicklich | VE x 2 Meter | 24 Stunden | Erschafft eine bleibende Steinwand von bis zu 1m x VE m x VE m auf festem Boden; ihre Abwehr entspricht der dreifachen Stufe des Zauberwirkers. | 78 |
| **Stolpern** | Z |  | – | 4 | 3 | 140 | -(AGI+AU)/2 des Ziels | Augenblicklich | VE x 5 Meter | 100 Kampfrunden | Das Ziel (keine Abwehr erlaubt) stürzt zu Boden und lässt bei misslungener AGI+GE-Probe alles Gehaltene fallen. | 79 |
| **Stossgebet** | N |  | 5 | – | – | 150 | -(KÖR+AU)/2 des Ziels | Augenblicklich | Selbst | 100 Kampfrunden | Eine Druckwelle heiliger Macht bringt alle Gegner im Radius der doppelten Heiler-Stufe in Metern zu Fall. | 79 |
| **Tanz** | Z |  | – | 8 | 10 | 360 | -(GEI+AU)/2 des Ziels | VE/2 Minuten | VE x 5 Meter | 10 Kampfrunden | Das Ziel (keine Abwehr erlaubt) kann nur noch tanzen und höchstens 1m pro Kampfrunde laufen; endet vorzeitig bei Schaden. | 79 |
| **Tarnender Nebel** | N |  | – | 4 | 3 | 140 | -2 | VE x 2 Kampfrunden | VE x 5 Meter | 10 Kampfrunden | Eine Nebelwolke mit Radius bis VE Meter entsteht: Angriffe auf Ziele darin sind um 8 erschwert, und alle darin haben -8 auf Proben, die Sehen erfordern. Wind kann sie verwehen. | 79 |
| **Telekinese** | Z |  | – | 6 | 8 | 260 | -1 pro (Stufe x 5) kg Gewicht | Konzentration | VE x 5 Meter | 0 Kampfrunden | Lässt einen unbelebten Gegenstand mit 1m pro Kampfrunde schweben, solange der Zauberwirker sich ununterbrochen konzentriert (ganze Aktion). | 79 |
| **Teleport** | N |  | 20 | 10 | 10 | 920 | -1 pro Begleiter | Augenblicklich | Berühren | 24 Stunden | Teleportiert den Zauberwirker und bis zu VE Begleiter an einen bekannten Ort; bei nur flüchtiger Kenntnis wird der PW halbiert. Ein Patzer verursacht W20 (bzw. 2W20) nicht abwehrbaren Schaden. | 79 |
| **Terror** | N | ● | 5 | 9 | 7 | 300 | -(GEI+VE)/2 des Ziels | VE Minuten | Radius von VE x 5 Meter | 24 Stunden | Bis zu Stufe viele Ziele fliehen panisch, bis die Zauberdauer endet. Der Effekt endet für jeden Fliehenden, der Schaden erleidet. | 80 |
| **Tierbeherrschung** | N | ● | – | 9 | 8 | 410 | -LK/2 des Ziels | VE Stunden | VE x 2 Meter | 100 Kampfrunden | Macht ein Tier zum willenlosen Sklaven, der alle einsilbigen Befehle befolgt. Höchstens VE Tiere gleichzeitig beherrschbar. | 80 |
| **Tiere besänftigen** | N |  | 1 | 7 | – | 20 | -LK/5 des Ziels | VE Stunden | Radius von VE x 5 Meter | 24 Stunden | Besänftigt aggressive Tiere im Wirkungsradius. Magische Wesen und Tiere unter einem Kontrollzauber sind immun. | 80 |
| **Totengespräch** | N |  | – | – | 9 | 1590 | +0 | VE Fragen bzw. VE Minuten | Berühren | W20 Tage | Befragt den Geist eines Toten; er antwortet auf bis zu VE Fragen mit Ja oder Nein, jedoch nicht zwingend wahrheitsgemäß. | 80 |
| **Trugbild** | N | ● | – | 5 | 7 | 210 | -2 | VE/2 Stunden | VE Meter | 100 Kampfrunden | Erschafft eine rein optische, unbewegliche Illusion von maximal VE/2 Kubikmetern. Durchschaubar mit einer Bemerken-Probe abzüglich des halbierten Probenergebnisses. | 80 |
| **Unsichtbares sehen** | N |  | 10 | 12 | 12 | 325 | +0 | Probenergebnis in Kampfrunden | Berühren | 100 Kampfrunden | Das Ziel erkennt unsichtbare Objekte und Lebewesen normal. Magische Effekte (außer dem Zauber Unsichtbarkeit) und verborgene Fallen zählen nicht als unsichtbar. | 81 |
| **Unsichtbarkeit** | N |  | 20 | 12 | 12 | 1120 | +0 | Probenergebnis in Minuten | Berühren | 24 Stunden | Macht ein Lebewesen samt getragener Ausrüstung oder ein Objekt unsichtbar. Endet vorzeitig bei Angriff, Zaubern oder erlittenem Schaden. | 81 |
| **Verborgenes sehen** | N |  | 8 | 8 | 8 | 510 | +0 | Probenergebnis in Kampfrunden | Radius von VE x 2 Meter | 24 Stunden | Lässt verborgene oder versteckte unbelebte Dinge (Fallen, Geheimtüren) im Radius aufleuchten, auch hinter Verdeckungen. Wirkt nicht bei magischen oder unsichtbaren Objekten. | 81 |
| **Verdampfen** | Z |  | – | 20 | 18 | 2230 | -(KÖR+AU)/2 des Ziels | Augenblicklich | VE Meter | 24 Stunden | Das Ziel verdampft: dreifaches Probenergebnis als Schaden, Abwehr ohne Panzerungsboni. Gegen wasserlose Wesen nicht einsetzbar. | 81 |
| **Vergrößern** | N |  | – | 10 | 12 | 920 | -4 | Probenergebnis/2 in Kampfrunden | Berühren | 24 Stunden | Verdoppelt Körpergröße des freiwilligen Ziels samt Ausrüstung (Größenkategorie „groß“); KÖR, ST, HÄ und Laufen werden verdoppelt. | 81 |
| **Verkleinern** | N |  | – | 10 | 8 | 460 | -4 | Probenergebnis Minuten | Berühren | 24 Stunden | Verkleinert das freiwillige Ziel samt Ausrüstung auf ein Zehntel (Größenkategorie „winzig“); KÖR, ST und HÄ werden halbiert, Laufen durch 10 geteilt. | 81 |
| **Verlangsamen** | N |  | 3 | 8 | 8 | 80 | -(KÖR+AU)/2 des Ziels | VE Kampfrunden | Radius von VE x 5 Meter | 10 Kampfrunden | Halbiert den Laufen-Wert von bis zu Stufe/2 vielen Zielen. | 82 |
| **Versetzen** | N |  | 10 | 6 | 6 | 260 | +0 | Augenblicklich | Berühren | 10 Kampfrunden | Teleportiert das einwilligende Ziel bis zu Probenergebnis/2 Meter weit in Sichtlinie; reicht die Distanz nicht, geht es so weit wie möglich in die Zielrichtung. | 82 |
| **Versetzte Stimme** | N |  | – | 2 | 3 | 60 | -1 pro 10 Meter Entfernung | VE x 2 Kampfrunden | Selbst | 100 Kampfrunden | Verlagert das Gesagte an einen bis zu VE x 10 Meter entfernten Punkt in Sichtlinie; alle in Hörweite dieses Punktes hören den Zauberwirker. | 82 |
| **Verteidigung** | N |  | 1 | 4 | 4 | 10 | +0 | 1 Kampfrunde | VE x 2 Meter | 0 Kampfrunden | Das Ziel erhält das Probenergebnis als Abwehr-Bonus, bis der Zauberwirker in der nächsten Kampfrunde wieder an der Reihe ist. | 82 |
| **Vertreiben** | N |  | 1 | – | – | 10 | -(KÖR+AU)/2 des Ziels | Probenergebnis/2 Minuten | Radius von VE x 2 Meter | 100 Kampfrunden | Vertreibt bis zu Stufe/2 Untote im Wirkungsbereich auf Probenergebnis x 5 Meter Distanz; sie können solange niemanden im Wirkungsbereich angreifen. Endet bei jedem Untoten, der Schaden erleidet. | 83 |
| **Verwandlung** | N | ● | – | 5 | 10 | 420 | -2 | Probenergebnis/2 in Stunden | Selbst | 24 Stunden | Der Zauberwirker nimmt das Aussehen einer anderen Person des eigenen Volkes und Geschlechts an. Bei nur flüchtig bekannten Vorbildern durchschaubar per Bemerken-Probe. | 83 |
| **Verwirren** | N | ● | 8 | 5 | 5 | 210 | -(GEI+AU)/2 | Probenergebnis in Kampfrunden | Radius von VE x 2 Meter | 10 Kampfrunden | Das Ziel handelt jede Kampfrunde zufällig (W20-Tabelle): Angriff auf die Charaktere, ziellos umherlaufen, herumstehen oder Angriff auf die eigenen Verbündeten. | 84 |
| **Volksgestalt** | N |  | – | 5 | 5 | 420 | -4 | Probenergebnis in Stunden | VE Meter | 24 Stunden | Verwandelt bis zu VE einwilligende humanoide Ziele in ein anderes humanoides Volk gleicher Größenkategorie (nicht die Ausrüstung); Fähigkeiten bleiben erhalten. | 84 |
| **Waffe des Lichts** | Z |  | 7 | 8 | – | 220 | +0 | Probenergebnis in Kampfrunden | VE x 2 Meter | 100 Kampfrunden | Nur für Träger mit dem Talent Diener des Lichts: WB +1, magischer Schaden, und jeder verursachte Schaden erhöht die Abwehr des Waffenträgers um 1. | 84 |
| **Wahnsinn** | N |  | – | – | 15 | 2850 | -(GEI+AU)/2 des Ziels | Augenblicklich | Berühren | W20 Tage | Das Ziel wird wahnsinnig, sein Geist sinkt dauerhaft. Nur Allheilung kann den Effekt aufheben — je wiederherzustellendem Punkt einmal angewendet. | 85 |
| **Wandöffnung** | N |  | – | 6 | 14 | 260 | +0 | Probenergebnis/2 Kampfrunden | Berühren | 100 Kampfrunden | Öffnet ein rundes Loch von 1m Durchmesser in einer bis zu VE x 10 cm dicken, nichtmagischen Steinwand; es verschwindet spurlos, wenn der Zauber endet. | 84 |
| **Wasser teilen** | Z |  | 12 | – | – | 1185 | +0 | Konzentration | Berühren | W20 Tage | Teilt ein Gewässer auf 1m Breite bis zum Grund. Gegen flüssige Wesen eingesetzt verursacht das Wurfergebnis nicht abwehrbaren Schaden (Dauer dann augenblicklich). | 85 |
| **Wasser weihen** | N |  | 1 | – | – | 10 | +0 | VE Stunden | Berühren | 24 Stunden | Verwandelt berührtes reines Wasser in Weihwasser; pro Anwendung Probenergebnis/2 Einheiten (je etwa 1/2 Liter). | 85 |
| **Wasserwandeln** | N |  | 5 | 9 | 9 | 150 | +0 | VE Stunden | Berühren | 0 Kampfrunden | Das Ziel kann Probenergebnis viele Runden lang auf Wasser laufen wie auf festem Land. | 86 |
| **Wechselzauber** | N |  | 12 | 10 | 12 | 790 | +0 | Augenblicklich | Selbst | 24 Stunden | Präpariert einen Zauberspruch, zu dem einmalig aktionsfrei gewechselt werden kann. | 86 |
| **Wiederbelebung** | N |  | 10 | – | – | 650 | +0 | Augenblicklich | Berühren | 24 Stunden | Belebt einen nicht natürlich Gestorbenen (höchstens W20 Tage tot) mit 1 LK wieder; er verliert permanent 1 Punkt KÖR. Bei KÖR 1 nicht mehr möglich, Verletzungen bleiben. | 86 |
| **Wolke der Reue** | N |  | 1 | 6 | – | 10 | -2 | Probenergebnis in Kampfrunden | VE x 5 Meter | 100 Kampfrunden | Eine unsichtbare Wolke mit Radius bis VE Meter entsteht; jeder darin erhält -1 auf alle Proben. Wind kann sie verwehen. | 86 |
| **Wolke des Todes** | N |  | – | – | 13 | 790 | -4 | Probenergebnis x 2 Kampfrunden | VE x 5 Meter | 100 Kampfrunden | Eine schwarze Wolke mit Radius bis VE Meter entsteht: Angriffe auf Ziele darin -2, Sehproben darin -2, und jeder darin erleidet pro Runde 1 nicht abwehrbaren Schaden. | 86 |
| **Wächter** | N |  | 4 | 6 | 5 | 115 | +0 | VE Stunden | Berühren | 24 Stunden | Ein magischer Wächter alarmiert bzw. weckt den Zauberwirker, sobald sich ein Wesen dem Zielpunkt auf VE x 2 Meter nähert (nicht bei bereits Anwesenden). | 84 |
| **Zauberabklang** | N |  | 10 | 5 | 9 | 650 | - eigene Zugangsstufe für den Spruch | Augenblicklich | Selbst | 24 Stunden | Versucht die Abklingzeit eines in den letzten VE Kampfrunden erfolgreich gewirkten Zaubers auf Null zu senken. Bei Misserfolg erst nach erneutem Wirken jenes Zaubers wiederholbar. | 87 |
| **Zauberleiter** | N |  | 8 | 4 | 4 | 320 | +0 | Konzentration | VE Meter | 24 Stunden | Erschafft eine freistehende magische Leiter von bis zu VE x Stufe Metern Höhe; sie bleibt, solange der Zauberwirker sich konzentriert (ganze Aktion). | 87 |
| **Zaubertrick** | N |  | – | 1 | 1 | 10 | +0 | Probenergebnis in Kampfrunden | VE x 2 Meter | 10 Kampfrunden | Erzeugt kleine, unschädliche Illusionen wie schwebende Bälle oder ein Kaninchen aus dem Hut. | 87 |
| **Zeitstop** | N |  | – | 15 | 20 | 2130 | -5 | Probenergebnis in Kampfrunden | Selbst | W20 Tage | Hält die Zeit an, bis die Dauer endet oder der Zauberwirker Schaden verursacht bzw. erleidet. Andere Objekte und Lebewesen sind starr eingefroren und unbeweglich. | 87 |
| **Zombies erwecken** | N |  | – | – | 8 | 930 | +0 | Augenblicklich | Radius von VE x 5 Meter | 24 Stunden | Erweckt bis zu Stufe viele Leichen im Radius als Zombies. Sie erheben sich nach drei Kampfrunden und greifen den Erwecker an, wenn er sie nicht per Kontrollieren beherrscht. Für Diener des Lichts gesperrt. | 87 |
| **Öffnen** | N |  | 2 | 1 | 1 | 10 | - SW | Augenblicklich | Berühren | 10 Kampfrunden | Öffnet ein Schloss unbeschädigt; ZB = -Schlosswert. Jeder Folgeversuch an demselben Schloss senkt den PW kumulativ um 2. | 74 |

### Sprüche pro Klasse

| Klasse | Sprüche | davon Stufe 1 | höchste Zugangsstufe |
|---|--:|--:|--:|
| Heiler | 80 | 15 | 20 |
| Zauberer | 105 | 9 | 20 |
| Schwarzmagier | 101 | 7 | 20 |

---

## 2. Bestiarium (PDF S. 116–135 / Buch S. 106–125)

78 Kreaturen. Vorbemerkungen (Größenkategorien, Gegnerhärte, Skalierung) auf PDF S. 114–115.

### Felder des Statblocks

Der abgedruckte Statblock besteht aus: Kreaturengruppen-Symbol + Name · KÖR/AGI/GEI · ST/BE/VE und HÄ/GE/AU · einer Symbolreihe aus sechs Feldern (Herz = **LK**, Schild = **Abwehr**, Stern = **Initiative**, Stiefel = **Laufen**, gekreuzte Schwerter = **Schlagen**, gekreuzte Pfeile = **Schießen**; ausgegraute Symbole bedeuten „kein Wert“) · der Tabelle **Bewaffnung | Panzerung** · den besonderen Fähigkeiten · optional einem **Zauber**-Block (Buchsymbol = Zaubern-Wert, Strahlensymbol = Zielzauber-Wert) · und der Fußzeile **Beute / GH / GK / EP**.

> **Kreaturen haben keine Stufe.** Statt dessen nennt das Buch die **Gegnerhärte (GH)** — die Summe der Charakterstufen, die eine Gruppe zusammen haben sollte, um gegen ein Exemplar eine gute Chance zu haben (PDF S. 114). Sie ist eine Orientierungshilfe, keine Kreaturenstufe.

**Heroische / epische Gegner** (PDF S. 115): heroisch = LK ×5, Abwehr +2, ein Angriff +2; episch = LK ×10, Abwehr +4, ein Angriff +4. Die EP werden dabei zuerst um (4 + zusätzliche LK) erhöht und anschließend verdoppelt.

### Übersicht

| Kreatur | Gruppe | GH | GK | LK | Abwehr | Ini | Laufen | Schlagen | Schießen | Zaubern | Zielz. | PA | EP | PDF |
|---|---|--:|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| **Adler** | Tiere | 1 | klein | 7 | 4 | 11 | 5 | 5 | – | – | – | 1 | 52 | 116 |
| **Alligator** | Tiere | 10 | groß | 78 | 18 | 15 | 9 | 16 | – | – | – | 2 | 151 | 116 |
| **Augenball** | Magische Wesen | 23 | groß | 88 | 14 | 4 | 3 | – | – | 13 | 12 | 2 | 255 | 116 |
| **Bär** | Tiere | 9 | groß | 75 | 16 | 12 | 8 | 17 | – | – | – | 1 | 139 | 116 |
| **Basilisk** | Magische Wesen | 18 | groß | 168 | 20 | 10 | 7 | 19 | – | – | – | 2 | 206 | 117 |
| **Baumherr** | Pflanzenwesen | 23 | groß | 70 | 27 | 1 | 3.5 | 27 | – | – | – | 2 | 158 | 117 |
| **Niederer Dämon** | Magische Wesen | 1 | klein | 9 | 9 | 7 | 3.5 | 8 | – | – | – | 2 | 71 | 117 |
| **Hoher Dämon** | Magische Wesen | 4 | normal | 20 | 12 | 10 | 4.5 | 12 | – | – | – | 2 | 104 | 117 |
| **Kampfdämon** | Magische Wesen | 8 | groß | 46 | 15 | 12 | 6 | 16 | – | – | – | 2 | 152 | 117 |
| **Kriegsdämon** | Magische Wesen | 23 | riesig | 160 | 24 | 15 | 8 | 26 | – | – | – | 2 | 297 | 118 |
| **Dämonenfürst** | Magische Wesen | 42 | gewaltig | 400 | 32 | 30 | 16 | 35 | – | – | – | 2 | 579 | 118 |
| **Drachenwelpe** | Magische Wesen | 18 | groß | 63 | 14 | 14 | 10 | 14 | 17 | – | – | 3 | 255 | 118 |
| **Jungdrache** | Magische Wesen | 36 | riesig | 225 | 24 | 15 | 12.5 | 24 | 19 | – | – | 4 | 481 | 118 |
| **Erwachsener Drache** | Magische Wesen | 63 | gewaltig | 600 | 35 | 20 | 20 | 35 | 25 | – | – | 5 | 907 | 119 |
| **Echsenmensch** | Humanoide | 3 | normal | 21 | 14 | 8 | 5 | 14 | 11 | – | – | 1 | 71 | 119 |
| **Einhorn** | Magische Wesen | 9 | groß | 63 | 11 | 19 | 11 | 12 | – | – | – | – | 189 | 119 |
| **Erdelementar I** | Magische Wesen | 8 | klein | 13 | 20 | 3 | 2 | 19 | – | – | – | 4 | 44 | 120 |
| **Erdelementar II** | Magische Wesen | 15 | normal | 32 | 26 | 3 | 2 | 25 | – | – | – | 4 | 70 | 120 |
| **Erdelementar III** | Magische Wesen | 23 | groß | 78 | 33 | 3 | 2.5 | 31 | – | – | – | 4 | 124 | 120 |
| **Feuerelementar I** | Magische Wesen | 9 | klein | 12 | 22 | 5 | 3.5 | 14 | – | – | – | 8 | 70 | 120 |
| **Feuerelementar II** | Magische Wesen | 15 | normal | 29 | 27 | 6 | 4 | 18 | – | – | – | 8 | 95 | 120 |
| **Feuerelementar III** | Magische Wesen | 24 | groß | 70 | 33 | 6 | 4.5 | 28 | – | – | – | 8 | 145 | 121 |
| **Luftelementar I** | Magische Wesen | 4 | klein | 10 | 17 | 8 | 5 | 9 | 12 | – | – | 8 | 68 | 121 |
| **Luftelementar II** | Magische Wesen | 9 | normal | 25 | 23 | 9 | 5.5 | 14 | 14 | – | – | 8 | 92 | 121 |
| **Luftelementar III** | Magische Wesen | 16 | groß | 64 | 30 | 9 | 6 | 21 | 17 | – | – | 8 | 143 | 121 |
| **Wasserelementar I** | Magische Wesen | 3 | klein | 10 | 17 | 8 | 5 | 11 | 12 | – | – | 8 | 60 | 121 |
| **Wasserelementar II** | Magische Wesen | 9 | normal | 24 | 22 | 8 | 5 | 18 | 14 | – | – | 8 | 83 | 121 |
| **Wasserelementar III** | Magische Wesen | 16 | groß | 62 | 29 | 9 | 6 | 24 | 17 | – | – | 8 | 133 | 122 |
| **Eulerich** | Magische Wesen | 11 | groß | 54 | 18 | 9 | 4.5 | 20 | – | – | – | 1 | 115 | 122 |
| **Fliegendes Schwert** | Konstrukte | 8 | klein | 12 | 19 | 5 | 3.5 | 16 | – | – | – | 5 | 57 | 122 |
| **Gargyl** | Magische Wesen | 6 | klein | 10 | 13 | 8 | 4.5 | 11 | – | – | – | 4 | 91 | 122 |
| **Geist** | Untote | 17 | normal | 27 | 25 | 11 | 6.5 | 19 | – | 16 | – | 8 | 245 | 123 |
| **Goblin** | Humanoide | 1 | klein | 8 | 7 | 9 | 4.5 | 7 | – | – | – | 1 | 42 | 123 |
| **Golem, Eisen-** | Konstrukte | 27 | groß | 72 | 31 | 7 | 4 | 31 | – | – | – | 5 | 173 | 123 |
| **Golem, Knochen-** | Konstrukte | 11 | groß | 40 | 10 | 18 | 7.5 | 17 | – | – | – | – | 148 | 124 |
| **Golem, Kristall-** | Konstrukte | 10 | groß | 42 | 14 | 10 | 6.5 | 13 | – | – | 12 | 3 | 134 | 124 |
| **Golem, Lehm-** | Konstrukte | 8 | groß | 46 | 13 | 8 | 4.5 | 16 | – | – | – | – | 110 | 124 |
| **Golem, Stein-** | Konstrukte | 23 | groß | 66 | 28 | 6 | 3.5 | 26 | – | – | – | 4 | 160 | 124 |
| **Harpyie** | Magische Wesen | 10 | normal | 20 | 11 | 8 | 4 | 12 | – | 8 | – | 1 | 128 | 125 |
| **Hai** | Tiere | 9 | normal | 39 | 16 | 9 | 6 | 19 | – | – | – | – | 106 | 125 |
| **Hobgoblin** | Humanoide | 4 | normal | 24 | 18 | 5+1 | 3.5 | 15 | 10 | – | – | 4 | 71 | 125 |
| **Hund** | Tiere | 1 | klein | 11 | 6 | 9 | 6 | 9 | – | – | – | 1 | 31 | 125 |
| **Hydra** | Magische Wesen | 23 | groß | 90 | 22 | 12 | 10 | 21 | – | – | – | 2 | 246 | 126 |
| **Keiler** | Tiere | 6 | normal | 38 | 17 | 9 | 7 | 14 | – | – | – | 2 | 79 | 126 |
| **Kobold** | Humanoide | 1 | klein | 7 | 4 | 7 | 4 | 5 | – | – | – | – | 25 | 126 |
| **Kriegselefant** | Tiere | 16 | groß | 93 | 23 | 8 | 6.5 | 22 | – | – | – | 2 | 142 | 126 |
| **Lebende Rüstung** | Konstrukte | 8 | normal | 24 | 19 | 6 | 4 | 16 | – | – | – | 5 | 72 | 126 |
| **Leichnam** | Untote | 26 | normal | 39 | 31 | 6 | 4 | – | – | 17 | 18 | 3 | 299 | 127 |
| **Medusa** | Magische Wesen | 18 | normal | 36 | 15 | 6 | 7.5 | 16 | – | – | – | 1 | 205 | 127 |
| **Minotaurus** | Humanoide | 12 | groß | 54 | 18 | 8 | 5 | 20 | – | – | – | 1 | 138 | 127 |
| **Monsterspinne** | Tiere | 11 | groß | 72 | 15 | 11 | 8.5 | 17 | 15 | – | – | 1 | 165 | 127 |
| **Mumie** | Untote | 18 | normal | 32 | 23 | 4 | 3 | 24 | – | – | – | 1 | 124 | 128 |
| **Oger** | Humanoide | 10 | groß | 50 | 17 | 6 | 3.5 | 17 | – | – | – | 1 | 121 | 128 |
| **Ork** | Humanoide | 2 | normal | 23 | 14 | 7 | 4 | 13 | 10 | – | – | 1 | 63 | 128 |
| **Pferd** | Tiere | 4 | groß | 66 | 12 | 18 | 10 | 14 | – | – | – | – | 101 | 129 |
| **Pony** | Tiere | 3 | groß | 63 | 11 | 13 | 7.5 | 13 | – | – | – | – | 92 | 129 |
| **Ratte** | Tiere | 1 | winzig | 3 | 2 | 6 | 3 | 4 | – | – | – | – | 26 | 129 |
| **Raubkatze** | Tiere | 2 | normal | 27 | 9 | 15 | 9 | 12 | – | – | – | 1 | 84 | 129 |
| **Reitkeiler** | Tiere | 5 | normal | 35 | 15 | 11 | 8.5 | 13 | – | – | – | 2 | 76 | 129 |
| **Riese** | Humanoide | 30 | riesig | 220 | 35 | 6 | 8 | 38 | 13 | – | – | 1 | 387 | 130 |
| **Riesenechse** | Tiere | 25 | riesig | 218 | 21 | 17 | 11.5 | 24 | – | – | – | 2 | 316 | 130 |
| **Riesenkrake** | Tiere | 35 | riesig | 270 | 26 | 18 | 10 | 29 | – | – | – | – | 397 | 130 |
| **Riesenratte** | Tiere | 1 | klein | 11 | 5 | 8 | 6 | 8 | – | – | – | – | 41 | 130 |
| **Riesenschlange** | Tiere | 8 | groß | 66 | 14 | 15 | 10.5 | 16 | – | – | – | 2 | 143 | 131 |
| **Rostassel** | Tiere | 8 | normal | 33 | 15 | 7 | 7 | 13 | – | – | – | 3 | 111 | 131 |
| **Schatten** | Untote | 14 | normal | 25 | 23 | 11 | 6.5 | 18 | – | – | – | 8 | 126 | 131 |
| **Schimmerross** | Tiere | 4 | groß | 66 | 12 | 18 | 10.5 | 13 | – | – | – | – | 106 | 131 |
| **Schlachtross** | Tiere | 9 | groß | 75 | 15 | 14 | 9 | 18 | – | – | – | – | 121 | 132 |
| **Schlingwurzelbusch** | Pflanzenwesen | 7 | normal | 30 | 11 | 8 | 7.5 | 11 | – | – | – | 1 | 122 | 132 |
| **Schwarm** | Tiere | 5 | klein | SCW | SCW | 8 | 7.5 | SCW | – | – | – | – | 68 | 132 |
| **Skelett** | Untote | 4 | normal | 22 | 12 | 10 | 5 | 14 | – | – | – | – | 72 | 132 |
| **Tentakelhirn** | Magische Wesen | 7 | klein | 11 | 5 | 8 | 6 | – | – | – | 11 | – | 89 | 133 |
| **Todesfee** | Untote | 23 | normal | 35 | 33 | 9 | 5.5 | 27 | – | 19 | – | 8 | 284 | 133 |
| **Troll** | Humanoide | 14 | groß | 60 | 22 | 9 | 5 | 22 | 13 | – | – | 2 | 202 | 134 |
| **Unwolf** | Magische Wesen | 7 | klein | 35 | 14 | 10 | 7.5 | 17 | 12 | – | – | 1 | 115 | 134 |
| **Vampirfledermaus** | Tiere | 1 | winzig | 4 | 7 | 4 | 3 | 9 | – | – | – | – | 55 | 134 |
| **Wolf** | Tiere | 2 | normal | 29 | 10 | 11 | 7 | 13 | – | – | – | 1 | 81 | 135 |
| **Zombie** | Untote | 10 | normal | 28 | 20 | 3 | 2.5 | 18 | – | – | – | 2 | 78 | 135 |

### Attribute, Eigenschaften & Ausrüstung

| Kreatur | KÖR | AGI | GEI | ST | HÄ | BE | GE | VE | AU | Bewaffnung | Panzerung | Beute |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|---|---|---|
| **Adler** | 3 | 8 | 1 | 1 | 0 | 3 | 1 | 0 | 1 | Krallen (WB+1) | Federkleid (PA+1) | Trophäe (BW 1A:11) |
| **Alligator** | 12 | 10 | 1 | 2 | 4 | 5 | 0 | 0 | 0 | Großer Biss (WB+2; GA -2) | Schuppenpanzer (PA+2) | Trophäe (BW 1A:14) |
| **Augenball** | 8 | 4 | 10 | 0 | 4 | 0 | 2 | 2 | 3 | – | Warzenhaut (PA+2) | BW #5A:20, #5M:20 |
| **Bär** | 12 | 8 | 1 | 3 | 3 | 4 | 0 | 0 | 0 | Pranke (WB +2; GA -2) | Fell (PA+1) | Trophäe (BW 1A:16) |
| **Basilisk** | 14 | 7 | 1 | 3 | 4 | 3 | 0 | 0 | 1 | Großer Biss (WB+2; GA -2) | Schuppenpanzer (PA+2) | Trophäe (BW 2A:20) |
| **Baumherr** | 20 | 1 | 1 | 5 | 5 | 0 | 0 | 0 | 0 | Asthiebe (WB+2) | Dicke Rinde (PA+2) | Lediglich Brennholz |
| **Niederer Dämon** | 5 | 5 | 5 | 2 | 2 | 2 | 2 | 2 | 2 | Pranke (WB+1; GA -1) | Dämonenhaut (PA+2) | – |
| **Hoher Dämon** | 7 | 7 | 6 | 3 | 3 | 3 | 3 | 3 | 3 | Pranke (WB+2; GA -2) | Dämonenhaut (PA+2) | – |
| **Kampfdämon** | 9 | 8 | 8 | 4 | 4 | 4 | 4 | 4 | 4 | Pranke (WB+3; GA -3) | Dämonenhaut (PA+2) | – |
| **Kriegsdämon** | 15 | 10 | 10 | 7 | 7 | 5 | 5 | 5 | 5 | Pranke (WB+4; GA -4) | Dämonenhaut (PA+2) | – |
| **Dämonenfürst** | 20 | 20 | 10 | 10 | 10 | 10 | 10 | 5 | 5 | Pranke (WB+5; GA -5) | Dämonenhaut (PA+2) | – |
| **Drachenwelpe** | 9 | 11 | 5 | 2 | 2 | 3 | 3 | 1 | 2 | Mehrere Angriffe; WB+3; GA-2 | Drachenschuppen (PA+3) | Trophäe (BW 2A:W20+10) |
| **Jungdrache** | 16 | 12 | 7 | 4 | 4 | 3 | 3 | 2 | 2 | Mehrere Angriffe; WB+4; GA-4 | Drachenschuppen (PA+4) | Trophäe (BW 4A:W20+10), BW #(A:W20+10)x10, #8M:19 |
| **Erwachsener Drache** | 24 | 16 | 10 | 6 | 6 | 4 | 4 | 2 | 3 | Mehrere Angriffe; WB+5; GA-5 | Drachenschuppen (PA+5) | Trophäe (BW 8A:W20+10), BW #(A:W20+10)x10, #12M:20 |
| **Echsenmensch** | 9 | 8 | 3 | 4 | 2 | 0 | 2 | 2 | 0 | Speer (WB +1) | Schuppenpanzer (PA+1) | BW 1B:12, #2B:17 |
| **Einhorn** | 9 | 13 | 1 | 2 | 2 | 6 | 0 | 1 | 1 | Mehrere Angriffe; WB+1; GA-2 | – | BW 1B:12, #2B:17 |
| **Erdelementar I** | 12 | 2 | 1 | 3 | 4 | 1 | 0 | 0 | 0 | Steinpranke (WB+4) | Steinwesen (PA+4) | – |
| **Erdelementar II** | 17 | 2 | 1 | 4 | 5 | 1 | 0 | 0 | 0 | Steinpranke (WB+4) | Steinwesen (PA+4) | – |
| **Erdelementar III** | 22 | 2 | 1 | 5 | 7 | 1 | 0 | 0 | 0 | Steinpranke (WB+4) | Steinwesen (PA+4) | – |
| **Feuerelementar I** | 9 | 5 | 1 | 3 | 5 | 0 | 0 | 0 | 0 | Flammenhieb (WB+2) | Keine feste Gestalt (PA+8) | – |
| **Feuerelementar II** | 13 | 6 | 1 | 4 | 6 | 0 | 0 | 0 | 0 | Flammenhieb (WB+3) | Keine feste Gestalt (PA+8) | – |
| **Feuerelementar III** | 18 | 6 | 1 | 6 | 7 | 0 | 0 | 0 | 0 | Flammenhieb (WB+4) | Keine feste Gestalt (PA+8) | – |
| **Luftelementar I** | 6 | 8 | 1 | 2 | 3 | 0 | 3 | 0 | 0 | Luftstoß (WB+1; -1/2m) | Keine feste Gestalt (PA+8) | – |
| **Luftelementar II** | 10 | 9 | 1 | 2 | 5 | 0 | 3 | 0 | 0 | Luftstoß (WB+2; -1/2m) | Keine feste Gestalt (PA+8) | – |
| **Luftelementar III** | 15 | 9 | 1 | 2 | 7 | 0 | 4 | 0 | 0 | Luftstoß (WB+4; -1/2m) | Keine feste Gestalt (PA+8) | – |
| **Wasserelementar I** | 6 | 8 | 1 | 3 | 3 | 0 | 2 | 0 | 0 | Wasserstrahl (WB+2; -1/2m) | Keine feste Gestalt (PA+8) | – |
| **Wasserelementar II** | 11 | 8 | 1 | 4 | 3 | 0 | 3 | 0 | 0 | Wasserstrahl (WB+3; -1/2m) | Keine feste Gestalt (PA+8) | – |
| **Wasserelementar III** | 15 | 9 | 1 | 5 | 6 | 0 | 4 | 0 | 0 | Wasserstrahl (WB+4; -1/2m) | Keine feste Gestalt (PA+8) | – |
| **Eulerich** | 14 | 6 | 1 | 4 | 3 | 3 | 0 | 0 | 0 | Pranke (WB+2; GA-2) | Federkleid (PA+1) | Trophäe (BW 1A:14) |
| **Fliegendes Schwert** | 10 | 5 | 0 | 4 | 4 | 0 | 0 | 0 | 0 | Langschwert (WB+2) | Metallwesen (PA+5) | – |
| **Gargyl** | 7 | 7 | 1 | 2 | 2 | 1 | 2 | 0 | 1 | Steinklaue (WB+2) | Steinwesen (PA+4) | Trophäe (BW 1A:8) |
| **Geist** | 1 | 11 | 10 | 16 | 16 | 0 | 2 | 3 | 6 | Geisterklaue (WB+2; GA-2) | Körperlos (PA+8) | – |
| **Goblin** | 5 | 7 | 3 | 2 | 1 | 2 | 2 | 1 | 0 | Ast/Messer (WB+0) | Fellflicken (PA+1) | BW 1B:10 |
| **Golem, Eisen-** | 20 | 5 | 0 | 5 | 6 | 2 | 0 | 0 | 0 | Eisenpranke (WB+6) | Metallwesen (PA+5) | – |
| **Golem, Knochen-** | 10 | 12 | 0 | 5 | 0 | 6 | 0 | 0 | 0 | Knochenpranke (WB+2) | – | – |
| **Golem, Kristall-** | 8 | 10 | 4 | 3 | 3 | 0 | 5 | 0 | 0 | Kristallpranke (WB+2) | Kristallwesen (PA+3) | – |
| **Golem, Lehm-** | 10 | 6 | 4 | 3 | 3 | 2 | 0 | 0 | 0 | Lehmpranke (WB+3) | – | – |
| **Golem, Stein-** | 18 | 4 | 4 | 4 | 5 | 0 | 2 | 0 | 0 | Steinpranke (WB+4) | Steinwesen (PA+4) | – |
| **Harpyie** | 8 | 6 | 6 | 2 | 2 | 2 | 1 | 1 | 2 | Krallenklaue (WB+2) | Federkleid (PA+1) | Trophäe (BW 1A:8) |
| **Hai** | 13 | 6 | 1 | 4 | 3 | 3 | 0 | 0 | 0 | Großer Biss (WB+2; GA-2) | – | Trophäe (BW 1A:12) |
| **Hobgoblin** | 11 | 6 | 3 | 2 | 3 | 0 | 3 | 2 | 0 | Langschwert (WB+2); Kurzbogen (WB+1; I+1) | Kettenpanzer (PA+2; L-0,5); Helm (PA+1; I-1); Holzschild (PA+1) | BW 1B:18 |
| **Hund** | 5 | 6 | 1 | 3 | 0 | 3 | 0 | 0 | 0 | Biss (WB+1) | Fell (PA+1) | – |
| **Hydra** | 14 | 10 | 1 | 5 | 6 | 2 | 0 | 0 | 0 | Großer Biss (WB+2; GA-2) | Schuppenpanzer (PA+2) | Trophäe (BW 1A:20) |
| **Keiler** | 10 | 7 | 1 | 2 | 5 | 2 | 0 | 0 | 0 | Hauer (WB+2; GA-1) | Dicke Borstenhaut (PA+2) | Trophäe (BW 1A:10) |
| **Kobold** | 3 | 6 | 2 | 1 | 1 | 1 | 2 | 1 | 0 | Kleiner Knüppel (WB+1) | – | Trophäe (BW 1B:8) |
| **Kriegselefant** | 16 | 6 | 1 | 5 | 5 | 2 | 0 | 0 | 0 | Rammen (WB+2) | Dickhäuter (PA+2) | Trophäe (BW 1A:20) |
| **Lebende Rüstung** | 10 | 6 | 0 | 4 | 4 | 0 | 0 | 0 | 0 | Langschwert (WB+2) | Metallwesen (PA+5) | – |
| **Leichnam** | 7 | 6 | 9 | 17 | 21 | 0 | 4 | 8 | 8 | – | mag. Robe +3 (PA+3) | BW #(A:20)x10, #10M:20 |
| **Medusa** | 11 | 6 | 7 | 3 | 3 | 0 | 2 | 2 | 2 | Klauen/Schlangen (WB+2) | Schuppen (PA+1) | Trophäe (BW A:18), BW #5A:20, #5M:20 |
| **Minotaurus** | 14 | 6 | 4 | 4 | 3 | 2 | 1 | 1 | 1 | Massive Keule, Horn oder; Huf (alles WB+2; GA-2) | Fell (PA+1) | Trophäe (BW 1A:16), BW 2B:20 |
| **Monsterspinne** | 12 | 9 | 1 | 3 | 2 | 2 | 4 | 0 | 0 | Spinnenbiss (WB+2; GA-2); Netzflüssigkeit (WB+2) | Dicke Spinnenhaut (PA+1) | Trophäe (BW 1A:12) |
| **Mumie** | 12 | 4 | 4 | 10 | 10 | 0 | 0 | 0 | 2 | Fäulnispranke (WB+1) | Bandagen (PA+1) | BW #2A:18, #1M:16 |
| **Oger** | 12 | 4 | 2 | 3 | 3 | 2 | 0 | 1 | 0 | Massive Keule (WB+2; GA-2) | Felle (PA+1) | BW 1B:8, #1B18 |
| **Ork** | 10 | 6 | 2 | 2 | 3 | 0 | 3 | 1 | 0 | Speer (WB+1) | Lederpanzer (PA+1) | BW 1B:14, #1B16 |
| **Pferd** | 10 | 11 | 1 | 2 | 2 | 7 | 0 | 0 | 0 | Huf (WB+2; in Notwehr) | – | – |
| **Pony** | 9 | 8 | 1 | 2 | 2 | 5 | 0 | 0 | 0 | Huf (WB+2; in Notwehr) | – | – |
| **Ratte** | 2 | 4 | 1 | 1 | 0 | 2 | 0 | 0 | 0 | Spitze Zähne (WB+1) | – | – |
| **Raubkatze** | 7 | 10 | 1 | 3 | 1 | 5 | 0 | 0 | 0 | Pranke/Biss (WB+2; GA-1) | Fell (PA+1) | Trophäe (BW 1A:18) |
| **Reitkeiler** | 9 | 9 | 1 | 2 | 4 | 2 | 0 | 0 | 0 | Hauer (WB+2; GA-1) | Dicke Borstenhaut (PA+2) | Trophäe (BW 1A:10) |
| **Riese** | 27 | 6 | 2 | 7 | 7 | 3 | 0 | 1 | 0 | Baumstamm (WB+4; GA-4); Geworf. Fels (WB+4; GA-4) | Felle (PA+1) | Trophäe (BW 1A:20) |
| **Riesenechse** | 15 | 12 | 1 | 5 | 14 | 5 | 0 | 0 | 0 | Grausamer Biss (WB+4) | Schuppenpanzer (PA+2) | Trophäe (BW 2A:16) |
| **Riesenkrake** | 22 | 10 | 1 | 5 | 4 | 8 | 0 | 0 | 0 | Fangarme (WB+2) | – | Trophäe (BW 2A:18) |
| **Riesenratte** | 4 | 6 | 1 | 2 | 1 | 2 | 0 | 0 | 0 | Scharfe Zähne (WB+2) | – | – |
| **Riesenschlange** | 9 | 12 | 1 | 5 | 3 | 3 | 0 | 0 | 0 | Großer Biss (WB+2; GA-2) | Schuppenpanzer (PA+2) | Trophäe (BW 1A:18) |
| **Rostassel** | 8 | 7 | 1 | 4 | 4 | 0 | 0 | 0 | 0 | Tentakelfühler (WB+1) | Chitinpanzer (PA+3) | Trophäe (BW 1A:6) |
| **Schatten** | 11 | 11 | 0 | 5 | 4 | 0 | 2 | 0 | 0 | Geisterklaue (WB+2; GA-2) | Körperlos (PA+8) | – |
| **Schimmerross** | 9 | 12 | 1 | 2 | 3 | 6 | 0 | 0 | 0 | Huf (WB+2; in Notwehr) | – | – |
| **Schlachtross** | 12 | 10 | 1 | 4 | 3 | 4 | 0 | 0 | 0 | Huf/Rammen (WB+2) | – | – |
| **Schlingwurzelbusch** | 6 | 8 | 0 | 3 | 4 | 0 | 0 | 0 | 0 | Wurzelhiebe (WB+2) | Gehölz (PA+1) | Lediglich Brennholz |
| **Schwarm** | – | – | – | – | – | – | – | – | – | – | – | – |
| **Skelett** | 10 | 8 | 0 | 3 | 2 | 2 | 2 | 0 | 0 | Knochenklaue (WB+1) | – | – |
| **Tentakelhirn** | 4 | 6 | 1 | 2 | 1 | 2 | 0 | 0 | 0 | – | – | – |
| **Todesfee** | 6 | 9 | 10 | 19 | 19 | 0 | 0 | 3 | 9 | Geisterklaue (WB+2; GA-2) | Körperlos (PA+8) | – |
| **Troll** | 16 | 6 | 2 | 4 | 4 | 0 | 3 | 1 | 0 | Massive Keule (WB+2; GA-2); Geworf. Fels (WB+4; GA-4) | Warzenhaut (PA+2) | #BW 1B16 |
| **Unwolf** | 11 | 8 | 1 | 4 | 2 | 2 | 2 | 0 | 0 | Biss (WB+1) oder; Feuerodem (WB+2) | Brennendes Fell (PA+1) | Trophäe (BW 1A:16) |
| **Vampirfledermaus** | 5 | 4 | 1 | 3 | 2 | 0 | 0 | 0 | 0 | Krallen (WB+1) | – | – |
| **Wolf** | 8 | 7 | 1 | 3 | 1 | 4 | 0 | 0 | 0 | Kräftiger Biss (WB+2; GA-1) | Wolfspelz (PA+1) | Trophäe (BW 1A:10) |
| **Zombie** | 13 | 3 | 0 | 3 | 5 | 0 | 0 | 0 | 0 | Fäulnispranke (WB+2) | Merkt nichts (PA+2) | BW 1B:4 |

### Besondere Fähigkeiten je Kreatur

| Kreatur | Fähigkeiten |
|---|---|
| **Adler** | Fliegen, Natürliche Waffen, Sturzangriff |
| **Alligator** | Natürliche Waffen, Schwimmen, Sturmangriff |
| **Augenball** | Antimagie *(Radius 10m)*, Dunkelsicht, Mehrere Angriffe (+4) *(4 zusätzliche Zaubersprüche pro Runde (jeder nur einmal))*, Mehrere Angriffsglieder *(5 von 10 Augen greifen gleichzeitig an)*, Schweben, Wesen der Dunkelheit (Settingoption), Zauber<br>**Zauber:** Blenden, Einschläfern, Gehorche, Kettenblitz (Zielzauber 15), Schleudern, Schutzfeld, Schutzschild, Telekinese, Unsichtbarkeit, Verwirren |
| **Bär** | Natürliche Waffen, Sturmangriff |
| **Basilisk** | Blickangriff, Nachtsicht, Natürliche Waffen, Versteinern |
| **Baumherr** | Anfällig *(doppelter Schaden durch Feuer)*, Mehrere Angriffe (+3), Nachtsicht, Natürliche Waffen, Schleudern |
| **Niederer Dämon** | Dunkelsicht, Natürliche Waffen, Sturmangriff, Wesen der Dunkelheit (Settingoption) |
| **Hoher Dämon** | Dunkelsicht, Natürliche Waffen, Sturmangriff, Wesen der Dunkelheit (Settingoption) |
| **Kampfdämon** | Dunkelsicht, Natürliche Waffen, Sturmangriff, Wesen der Dunkelheit (Settingoption) |
| **Kriegsdämon** | Dunkelsicht, Natürliche Waffen, Sturmangriff, Wesen der Dunkelheit (Settingoption) |
| **Dämonenfürst** | Dunkelsicht, Natürliche Waffen, Sturmangriff, Wesen der Dunkelheit (Settingoption) |
| **Drachenwelpe** | Angst, Befreien, Dunkelsicht, Fliegen, Mehrere Angriffe (+1), Natürliche Waffen, Odem, Schleudern, Sturzangriff, Verschlingen, Wesen der Dunkelheit / Wesen des Lichts (Settingoption), Zerstampfen |
| **Jungdrache** | Angst, Befreien, Dunkelsicht, Fliegen, Mehrere Angriffe (+1), Natürliche Waffen, Odem, Schleudern, Sturzangriff, Verschlingen, Wesen der Dunkelheit / Wesen des Lichts (Settingoption), Zerstampfen |
| **Erwachsener Drache** | Angst, Befreien, Dunkelsicht, Fliegen, Mehrere Angriffe (+1), Natürliche Waffen, Odem, Schleudern, Sturzangriff, Verschlingen, Wesen der Dunkelheit / Wesen des Lichts (Settingoption), Zerstampfen |
| **Echsenmensch** | Nachtsicht, Schleudern |
| **Einhorn** | Angst, Geistesimmun, Mehrere Angriffe (+1), Nachtsicht, Schleudern, Sturmangriff, Wesen des Lichts (Settingoption), Zauber<br>**Zauber:** Spurt (jederzeit aktionsfrei und ohne Probe) |
| **Erdelementar I** | Anfällig *(doppelter Schaden durch Blitz-, Sturm- und Windangriffe)* |
| **Erdelementar II** | Anfällig *(doppelter Schaden durch Blitz-, Sturm- und Windangriffe)* |
| **Erdelementar III** | Anfällig *(doppelter Schaden durch Blitz-, Sturm- und Windangriffe)* |
| **Feuerelementar I** | Anfällig *(doppelter Schaden durch Eis-, Frost- und Wasserangriffe)*, Fliegen |
| **Feuerelementar II** | Anfällig *(doppelter Schaden durch Eis-, Frost- und Wasserangriffe)*, Fliegen |
| **Feuerelementar III** | Anfällig *(doppelter Schaden durch Eis-, Frost- und Wasserangriffe)*, Fliegen |
| **Luftelementar I** | Anfällig *(doppelter Schaden durch Erd-, Fels- und Steinangriffe)*, Fliegen |
| **Luftelementar II** | Anfällig *(doppelter Schaden durch Erd-, Fels- und Steinangriffe)*, Fliegen |
| **Luftelementar III** | Anfällig *(doppelter Schaden durch Erd-, Fels- und Steinangriffe)*, Fliegen |
| **Wasserelementar I** | Anfällig *(doppelter Schaden durch Feuerangriffe)*, Schwimmen |
| **Wasserelementar II** | Anfällig *(doppelter Schaden durch Feuerangriffe)*, Schwimmen |
| **Wasserelementar III** | Anfällig *(doppelter Schaden durch Feuerangriffe)*, Schwimmen |
| **Eulerich** | Dunkelsicht |
| **Fliegendes Schwert** | Fliegen<br>**Herstellung:** 1513 GM + Waffenschmied |
| **Gargyl** | Anfällig *(doppelter Schaden durch Feuer)*, Dunkelsicht, Fliegen, Geistesimmun, Kletterläufer, Natürliche Waffen, Sturzangriff |
| **Geist** | Alterung *(Ziel altert 1 Jahr pro erlittenem Schadenspunkt)*, Angst, Fliegen, Geistesimmun, Nur durch Magie verletzbar, Totenkraft, Wesen der Dunkelheit / Wesen des Lichts (Settingoption), Zauber<br>**Zauber:** Terror |
| **Goblin** | Nachtsicht, Wesen der Dunkelheit (Settingoption) |
| **Golem, Eisen-** | Zerstampfen<br>**Herstellung:** 3750 GM + Rüstungsschmied |
| **Golem, Knochen-** | Mehrere Angriffe (+3), Mehrere Angriffsglieder *(4 Arme)*<br>**Herstellung:** 2613 GM + Schreinern |
| **Golem, Kristall-** | Zauber<br>**Zauber:** Blitz<br>**Herstellung:** 2513 GM + Steinmetz |
| **Golem, Lehm-** | –**Herstellung:** 2338 GM + Steinmetz |
| **Golem, Stein-** | Zerstampfen<br>**Herstellung:** 3338 GM + Steinmetz |
| **Harpyie** | Bezaubern, Fliegen, Nachtsicht, Natürliche Waffen, Sturzangriff, Zauber<br>**Zauber:** Lockruf (wirkt wie Gehorche; Abklingzeit 10 Kampfrunden) |
| **Hai** | Natürliche Waffen, Schwimmen, Sturmangriff |
| **Hobgoblin** | Nachtsicht, Wesen der Dunkelheit (Settingoption) |
| **Hund** | Natürliche Waffen |
| **Hydra** | Mehrere Angriffe (+5), Mehrere Angriffsglieder *(6 Köpfe)*, Nachtsicht, Natürliche Waffen, Regeneration, Schleudern, Schwimmen |
| **Keiler** | Natürliche Waffen, Sturmangriff |
| **Kobold** | – |
| **Kriegselefant** | Natürliche Waffen, Sturmangriff |
| **Lebende Rüstung** | Dunkelsicht, Geistesimmun<br>**Herstellung:** 1875 GM + Rüstungsschmied |
| **Leichnam** | Angst, Geistesimmun, Totenkraft, Wesen der Dunkelheit (Settingoption), Zauber<br>**Zauber:** Arkanes Schwert, Ebenentor, Einschläfern, Flammeninferno, Frostschock, Gasgestalt, Gehorche, Kontrollieren, Magisches Schloss, Netz, Schatten, Schatten erwecken, Schattenlanze, Skelette erwecken, Springen, Stolpern, Trugbild, Unsichtbarkeit, Verwirren, Wandöffnung, Wolke des Todes, Zeitstop |
| **Medusa** | Blickangriff, Mehrere Angriffe (+5), Schleudern, Versteinern |
| **Minotaurus** | Sturmangriff, Zerstampfen |
| **Monsterspinne** | Kletterläufer, Lähmungseffekt *(Netzflüssigkeit, alle 10 Kampfrunden einsetzbar)*, Natürliche Waffen |
| **Mumie** | Anfällig *(doppelter Schaden durch Feuer)*, Angst, Geistesimmun, Natürliche Waffen, Totenkraft, Werteverlust *(KÖR -1 je Treffer (bei KÖR 0 tot))*, Wesen der Dunkelheit (Settingoption) |
| **Oger** | Befreien, Nachtsicht, Umschlingen *(3 Punkte abwehrbarer Schaden pro Runde)*, Wesen der Dunkelheit (Settingoption) |
| **Ork** | Nachtsicht, Wesen der Dunkelheit (Settingoption) |
| **Pferd** | Natürliche Waffen |
| **Pony** | Natürliche Waffen |
| **Ratte** | Dunkelsicht, Natürliche Waffen, Schwimmen |
| **Raubkatze** | Mehrere Angriffe (+1), Nachtsicht, Natürliche Waffen |
| **Reitkeiler** | Natürliche Waffen, Sturmangriff |
| **Riese** | Befreien, Umschlingen *(3 Punkte abwehrbarer Schaden pro Runde)*, Zerstampfen |
| **Riesenechse** | Befreien, Kletterläufer, Nachtsicht, Natürliche Waffen, Sturmangriff, Verschlingen |
| **Riesenkrake** | Befreien, Mehrere Angriffe (+5), Mehrere Angriffsglieder *(6 Fangarme)*, Natürliche Waffen, Schwimmen, Umschlingen *(5 Punkte abwehrbarer Schaden pro Runde)* |
| **Riesenratte** | Dunkelsicht, Natürliche Waffen, Schwimmen |
| **Riesenschlange** | Befreien, Gift *(W20 Kampfrunden lang 1 nicht abwehrbarer Schaden pro Runde)*, Natürliche Waffen, Umschlingen *(5 Punkte abwehrbarer Schaden pro Runde)* |
| **Rostassel** | Dunkelsicht, Mehrere Angriffe (+3), Mehrere Angriffsglieder *(4 Tentakelfühler)*, Natürliche Waffen, Rost |
| **Schatten** | Alterung *(Ziel altert 1 Jahr pro Treffer)*, Fliegen, Geistesimmun, Wesen der Dunkelheit (Settingoption) |
| **Schimmerross** | Nachtsicht, Natürliche Waffen |
| **Schlachtross** | Natürliche Waffen, Sturmangriff |
| **Schlingwurzelbusch** | Befreien, Geistesimmun, Mehrere Angriffe (+4), Natürliche Waffen, Umschlingen *(5 Punkte abwehrbarer Schaden pro Runde)* |
| **Schwarm** | Geistesimmun, Schwarm |
| **Skelett** | Geistesimmun, Wesen der Dunkelheit (Settingoption) |
| **Tentakelhirn** | Dunkelsicht, Schweben, Werteverlust *(GEI -1 je Treffer des Gedankenzehrerstrahls (bei GEI 0 wahnsinnig))*<br>**Zauber:** Gedankenzehrerstrahl (Zielzauber; senkt GEI um 1 je Treffer) |
| **Todesfee** | Alterung *(Ziel altert 1 Jahr pro Treffer)*, Angst, Fliegen, Geistesimmun, Nur durch Magie verletzbar, Totenkraft, Wesen der Dunkelheit (Settingoption), Zauber<br>**Zauber:** Wehklagen (ZB -(KÖR+AU)/2 des Ziels; Abklingzeit 10 Kampfrunden; nicht abwehrbarer Flächenschaden in Höhe des Probenergebnisses im Umkreis von 9m) |
| **Troll** | Anfällig *(doppelter Schaden durch Lichtangriffe)*, Befreien, Dunkelsicht, Regeneration, Umschlingen *(5 Punkte abwehrbarer Schaden pro Runde)*, Wesen der Dunkelheit (Settingoption) |
| **Unwolf** | Anfällig *(doppelter Schaden durch Lichtangriffe)*, Natürliche Waffen, Odem *(Feuerodem, Kegel GE x 5m lang)*, Sturmangriff, Wesen der Dunkelheit (Settingoption) |
| **Vampirfledermaus** | Fliegen, Natürliche Waffen, Sonar, Sturzangriff |
| **Wolf** | Nachtsicht, Natürliche Waffen, Sturmangriff |
| **Zombie** | Geistesimmun, Natürliche Waffen, Wesen der Dunkelheit (Settingoption) |

### Glossar der Kreaturenfähigkeiten (paraphrasiert)

| Fähigkeit | Wirkung |
|---|---|
| **Alterung** | Ein Treffer lässt das Ziel altern. |
| **Anfällig** | Erhält doppelten Schaden durch eine bestimmte Schadensart. |
| **Angst** | Erzeugt 1x pro Kampf aktionsfrei auf Sicht Angst; wem GEI+VE+Stufe misslingt, ist eingeschüchtert (Malus auf alle Proben), bei einem Patzer ergreift er die Flucht. |
| **Antimagie** | Sämtliche fremde Magie im Umkreis ist wirkungslos; die eigene Magie der Kreatur bleibt wirksam. |
| **Befreien** | Regelt, wie ein umschlungenes bzw. verschlungenes Opfer sich wieder befreien kann. |
| **Bezaubern** | Kann Gegner mit einem Lockruf bezaubern (siehe Zauber). |
| **Blickangriff** | Greift aktionsfrei jeden mit dem Blick an, dem GEI+AU misslingt. Wer den Blick meidet, erhält -4 auf alle Proben, ist aber kein Ziel mehr. |
| **Dunkelsicht** | Sieht auch in völliger Dunkelheit. |
| **Fliegen** | Kann statt zu laufen mit doppeltem Laufen-Wert fliegen (rennend Laufen x 4). |
| **Geistesimmun** | Immun gegen geistesbeeinflussende Effekte und entsprechend gekennzeichnete Zauber. |
| **Gift** | Verursachter Schaden zwingt das Ziel zu einer "Gift trotzen"-Probe, sonst wirkt das Gift nach. |
| **Kletterläufer** | Klettert aktionsfrei mit normaler Laufen-Geschwindigkeit an Wänden und Decken. |
| **Lähmungseffekt** | Ein Sonderangriff macht das Ziel bewegungsunfähig, sofern ihm KÖR+ST misslingt. |
| **Mehrere Angriffe** | Kann pro Runde zusätzliche Angriffe aktionsfrei ausführen (Anzahl in Klammern). |
| **Mehrere Angriffsglieder** | Greift mit mehreren Gliedern gleichzeitig an; ein gegnerischer Schlagen-Immersieg trennt eines ab und senkt die Angriffsanzahl. |
| **Nachtsicht** | Sieht bei einem Mindestmaß an Licht wie am hellen Tag. |
| **Natürliche Waffen** | Bei einem Schlagen-Patzer gegen einen Bewaffneten wird dessen Waffe getroffen; der Angegriffene erhält aktionsfrei einen Gegenangriff. |
| **Nur durch Magie verletzbar** | Nur magische Waffen und Zauber richten Schaden an (Anfälligkeiten ausgenommen). |
| **Odem** | Odemangriff (Schießen), nur alle W20 Runden einsetzbar; erzeugt nicht abwehrbaren Schaden in einem Kegel, gegen den nur magische Abwehrboni zählen. |
| **Regeneration** | Regeneriert jede Kampfrunde aktionsfrei LK (Probe mit PW = KÖR); Feuer- und Säureschaden ist nicht regenerierbar. |
| **Rost** | Jeder Treffer senkt die PA eines zufälligen metallischen, nichtmagischen Rüstungsteils um 1 (analog der WB treffender Metallwaffen). |
| **Schleudern** | Ein Schlagen-Immersieg schleudert ein gleich großes oder kleineres Ziel Schaden/3 Meter fort; es erleidet Sturzschaden und liegt danach am Boden. |
| **Schwarm** | Gilt als einzelner Gegner. Der Schwarmwert (SCW) = Mitgliederanzahl/10 (max. 20); pro 1 LK Schaden sterben 10 Mitglieder. Schlagen, Abwehr und LK entsprechen dem aktuellen SCW. |
| **Schweben** | Kann statt zu laufen schweben (rennend Laufen x 2). |
| **Schwimmen** | Kann schwimmen bzw. sich im Wasser normal fortbewegen. |
| **Sonar** | Orientiert sich per Sonar statt per Sicht. |
| **Sturmangriff** | Wird mindestens die Laufen-Distanz gerannt, ist in derselben Runde noch ein Angriff mit Schlagen + KÖR möglich. |
| **Sturzangriff** | Wird fliegend mindestens Laufen x 2 "rennend" zurückgelegt, ist während der Bewegung noch ein Angriff mit Schlagen + KÖR möglich. |
| **Totenkraft** | Erhält GEI+AU als Bonus auf Stärke und Härte. |
| **Umschlingen** | Ein Schlagen-Immersieg umschlingt ein kleineres Ziel: fester Schaden pro Runde, keine freie Bewegung, -2 auf alle Proben je Größenunterschied. |
| **Verschlingen** | Ein Schlagen-Immersieg verschlingt ein 2+ Kategorien kleineres Ziel: 1 nicht abwehrbarer Schaden pro Runde und -8 auf alle Proben. |
| **Versteinern** | Ein erfolgreicher Blickangriff versteinert das Ziel, sofern ihm KÖR+AU misslingt; nur der Zauber Allheilung hebt dies auf. |
| **Werteverlust** | Jeder schadensverursachende Treffer senkt ein Attribut des Opfers um 1; Allheilung stellt je 1 Punkt wieder her. |
| **Wesen der Dunkelheit (Settingoption)** | Gilt in den meisten Settings als Wesen der Dunkelheit; entsprechende Regeln greifen. |
| **Wesen der Dunkelheit / Wesen des Lichts (Settingoption)** | Gilt je nach Setting als Wesen der Dunkelheit oder des Lichts; entsprechende Regeln greifen. |
| **Wesen des Lichts (Settingoption)** | Gilt in den meisten Settings als Wesen des Lichts; entsprechende Regeln greifen. |
| **Zauber** | Beherrscht Zaubersprüche (siehe Feld "zauber"; Probenwerte in "zaubern"/"zielzauber"). |
| **Zerstampfen** | Ein Angriff pro Runde mit -6 (je Größenunterschied um 2 gemindert) gegen ein kleineres Ziel verursacht nicht abwehrbaren Schaden. |

---

## Anmerkungen zur Extraktion

* Die Zugangsstufen der Zaubersprüche stammen aus den Klassenlisten (PDF S. 58–59) und wurden gegen die Stufenzahlen im Spruchkopf gegengeprüft — 128 von 129 Sprüchen stimmen exakt überein; bei *Teleport* ist die Zahlenreihe im Spruchkopf nur durch Textüberlagerung schlecht auslesbar (20 / 10 / 10 laut Kopf **und** laut Klassenliste).
* Kreaturenwerte wurden exakt so übernommen, wie sie abgedruckt sind. Wo die Formel des Regelwerks abweicht, ist der abgedruckte Wert maßgeblich:
  * Abwehr ≠ KÖR + HÄ + PA bei Echsenmensch, Golem (Stein-), Oger, Riesenechse
  * Initiative ≠ AGI + BE bei Golem (Stein-), Ork, Riese, Troll
  * **Riesenechse** ist mit `HÄ: 14` abgedruckt; die Abwehr 21 (= KÖR 15 + 4 + PA 2) legt nahe, dass `HÄ: 4` gemeint ist. Der Wert wurde unverändert übernommen.
* **Schwarm** (PDF S. 132) hat keine Attribute; LK, Abwehr und Schlagen entsprechen dem aktuellen Schwarmwert (SCW) und stehen daher als String `"SCW"` in den Daten.
* **Hobgoblin** hat die Initiative als Rechenausdruck `5+1` abgedruckt (Kurzbogen +1, Helm −1) und steht daher als String.
