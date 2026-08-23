// Dungeonslayers 4 (DS4) — Talente, Heldenklassen & Volksfähigkeiten
// Quelle: regeln/Dungeonslayers4.pdf (kostenloses Regelwerk, dungeonslayers.net)
//   - Talenttabelle der drei Grundklassen: PDF S. 28 (Buch S. 18)
//   - Talentbeschreibungen (alphabetisch):  PDF S. 27-47 (Buch S. 17-37)
//   - Heldenklassen:                        PDF S. 20-26 (Buch S. 10-16)
//   - Volksfähigkeiten:                     PDF S. 13 (Buch S. 3) + PDF S. 93 (Buch S. 83)
//   - Erwerbsregeln (TP/Ränge):             PDF S. 19 (Buch S. 9), PDF S. 27 (Buch S. 17)
//
// Alle Effekttexte sind KURZ PARAPHRASIERT (keine Volltext-Übernahme aus dem Regelwerk).
// Siehe regeln/ds4_talente_referenz.md für die lesbare deutsche Fassung.
//
// Dungeonslayers wurde geschaffen von Christian Kennig (© 2011, Burning Books, Berlin).
// Texte und Regelmechaniken stehen unter CC BY-NC-SA 4.0 — diese abgeleitete Datei
// daher ebenfalls: https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de

// ---------------------------------------------------------------------------
// Klassenkürzel wie im Regelwerk (PDF S. 27, "VERWENDETE ABKÜRZUNGEN")
// ---------------------------------------------------------------------------

// Grundklassen-Kürzel -> Klassenschlüssel aus data.js.
// 'ZAW' (Zauberwirker) gilt für ALLE drei Zauberwirker-Untertypen.
const DS4_CLASS_CODES = {
    KRI: ['krieger'],
    'SPÄ': ['spaeher'],
    ZAW: ['heiler', 'zauberer', 'schwarzmagier'],
    Hei: ['heiler'],
    Zau: ['zauberer'],
    Sch: ['schwarzmagier']
};

// Heldenklassen-Kürzel -> Name der Heldenklasse (Schlüssel in DS4_HELDENKLASSEN)
const DS4_HELDENKLASSE_CODES = {
    ATT: 'Attentäter',
    BER: 'Berserker',
    BLU: 'Blutmagier',
    'DÄM': 'Dämonologe',
    DRU: 'Druide',
    ELE: 'Elementarist',
    ERZ: 'Erzmagier',
    'KMÖ': 'Kampfmönch',
    KLE: 'Kleriker',
    KRZ: 'Kriegszauberer',
    MDB: 'Meisterdieb',
    NEK: 'Nekromant',
    PAL: 'Paladin',
    WAM: 'Waffenmeister',
    WDL: 'Waldläufer'
};

// Römische Talentränge -> Zahl (I-X)
const DS4_RANG_ROEMISCH = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };

// ---------------------------------------------------------------------------
// DS4_TALENTS
//   name         : Talentname
//   access       : Zugang über die GRUNDKLASSE — [{ klasse, minStufe, maxRang }]
//                  klasse ist einer von 'krieger' | 'spaeher' | 'heiler' | 'zauberer' | 'schwarzmagier'
//                  ('ZAW x (R)' aus dem Buch ist hier auf die drei Zauberwirker aufgelöst;
//                   ein untertyp-spezifischer Eintrag wie 'Sch 1 (V)' überschreibt den ZAW-Wert)
//   heldenZugang : Zugang über eine HELDENKLASSE — [{ heldenklasse, minStufe, maxRang }]
//   effekt       : kurze mechanische Beschreibung
//   proRang      : was ein zusätzlicher Talentrang bewirkt
//
// VALIDIERUNG: Ein Charakter darf ein Talent erlernen, wenn seine Grundklasse ODER seine
// Heldenklasse gelistet ist und seine Stufe >= minStufe ist. Der erreichbare Höchstrang ist
// das MAXIMUM der maxRang-Werte aller für ihn zutreffenden Einträge (Heldenklassen behalten
// den Zugang ihrer Grundklasse, PDF S. 20/27). Nicht gelistete Klassen können das Talent gar
// nicht erlernen (PDF S. 19).
// ---------------------------------------------------------------------------

const DS4_TALENTS = [
    {
        name: 'Abklingen',
        access: [
            { klasse: 'heiler', minStufe: 4, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 4, maxRang: 5 },
            { klasse: 'schwarzmagier', minStufe: 4, maxRang: 5 }
        ],
        heldenZugang: [{ heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 10 }],
        effekt: 'Senkt die Abklingzeit jedes Zauberspruchs; nie unter Null.',
        proRang: 'Abklingzeit −1 Runde'
    },
    {
        name: 'Abklingendes Blut',
        access: [],
        heldenZugang: [{ heldenklasse: 'Blutmagier', minStufe: 12, maxRang: 5 }],
        effekt: 'Opfert LK (freie Aktion), um die Abklingzeit eines gerade abklingenden Zaubers zu senken; mit Abklingen kombinierbar.',
        proRang: '1 weiterer LK opferbar = 1 weitere Runde Abklingzeit weniger'
    },
    {
        name: 'Aderschlitzer',
        access: [
            { klasse: 'krieger', minStufe: 12, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Bei Angriff mit Messer, Dolch, Einhandschwert oder Schusswaffe: Ist das Würfelergebnis kleiner/gleich dem Talentrang, sinkt die Abwehr des Gegners gegen diesen Angriff.',
        proRang: 'Gegnerabwehr −5 (und Trefferfenster: Wurf ≤ Talentrang)'
    },
    {
        name: 'Adlergestalt',
        access: [],
        heldenZugang: [{ heldenklasse: 'Druide', minStufe: 16, maxRang: 5 }],
        effekt: 'Verwandlung in einen flugfähigen Adler (o. kleineren Vogel) samt Ausrüstung; Dauer 1 Runde Verwandlungszeit, endet auf Wunsch oder bei Tod. GEI/VE/AU bleiben, alle anderen Werte werden die des Adlers. Kein Sprechen/Zaubern.',
        proRang: '1 weitere Verwandlung pro 24 Stunden'
    },
    {
        name: 'Akrobat',
        access: [
            { klasse: 'krieger', minStufe: 4, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 4, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 4, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 4, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kampfmönch', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Bonus auf alle Proben für athletisches Geschick, Balancieren und Klettern.',
        proRang: '+2'
    },
    {
        name: 'Alchemie',
        access: [
            { klasse: 'heiler', minStufe: 1, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 5 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 5 }
        ],
        heldenZugang: [{ heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 10 }],
        effekt: 'Voraussetzung, um magische Tränke zu brauen (PDF S. 111).',
        proRang: 'Zubereitungsdauer sinkt; +1 auf Proben zum Herstellen/Identifizieren von Tränken'
    },
    {
        name: 'Arkane Explosion',
        access: [
            { klasse: 'zauberer', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [{ heldenklasse: 'Erzmagier', minStufe: 12, maxRang: 5 }],
        effekt: 'Kugelförmige Explosion um den Charakter, Durchmesser Stufe/2 Meter, nicht abwehrbarer Schaden. Gefährten im Radius können je mit GEI+VE verschont werden; Explosionskontrolle ist anwendbar.',
        proRang: '1 Einsatz pro 24 Stunden; Probenwert des Schadens +10'
    },
    {
        name: 'Ausweichen',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kampfmönch', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Einen gegen ihn gerichteten Nahkampfangriff komplett ignorieren (freie Aktion, muss vor dem Trefferwurf angesagt werden). Wirkungslos gegen Gegner, die 2+ Größenkategorien größer sind.',
        proRang: '1 Einsatz pro Kampf'
    },
    {
        name: 'Bändiger',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Dämonologe', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Elementarist', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Erzmagier', minStufe: 16, maxRang: 3 }
        ],
        effekt: 'Mit GEI+AU (ganze Aktion) einer selbst beschworenen Wesenheit doch noch den Willen aufzwingen, nachdem die Zaubern-Probe misslang. Bei Erfolg kann in derselben Runde eine weitere Wesenheit gebändigt werden (dann freie Aktion).',
        proRang: '1 Versuch mehr; max. zusätzliche Wesen pro Runde = Talentrang'
    },
    {
        name: 'Bärengestalt',
        access: [],
        heldenZugang: [{ heldenklasse: 'Druide', minStufe: 14, maxRang: 5 }],
        effekt: 'Verwandlung in einen Bären (alternativ ein anderes "großes" Tier nach SL-Absprache) samt Ausrüstung. GEI/VE/AU bleiben, alle anderen Werte werden die des Tieres. Kein Sprechen/Zaubern.',
        proRang: '1 weitere Verwandlung pro 24 Stunden'
    },
    {
        name: 'Beschwörer',
        access: [{ klasse: 'schwarzmagier', minStufe: 12, maxRang: 3 }],
        heldenZugang: [
            { heldenklasse: 'Dämonologe', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Erzmagier', minStufe: 16, maxRang: 3 }
        ],
        effekt: 'Bonus auf alle Versuche, Dämonen zu beschwören und zu kontrollieren.',
        proRang: '+2'
    },
    {
        name: 'Beute schätzen',
        access: [],
        heldenZugang: [{ heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 5 }],
        effekt: 'Bonus beim Schätzen des Wertes eines Gegenstandes; mit demselben Bonus kann er per GEI+AU auch spüren, ob dieser magisch ist (nicht aber dessen Funktion erkennen).',
        proRang: '+3'
    },
    {
        name: 'Bildung',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 5 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 5 },
            { klasse: 'heiler', minStufe: 1, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 5 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 5 }
        ],
        heldenZugang: [],
        effekt: 'Bonus auf alle Proben zu Allgemeinwissen und zum Lösen von Rätseln (im Gegensatz zu Wissensgebiet nicht themenbeschränkt).',
        proRang: '+2'
    },
    {
        name: 'Blitzmacher',
        access: [
            { klasse: 'heiler', minStufe: 12, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Elementarist', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 12, maxRang: 5 }
        ],
        effekt: 'Bonus auf alle Zauber, die Blitzschaden verursachen.',
        proRang: '+1'
    },
    {
        name: 'Blocker',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 4, maxRang: 3 },
            { klasse: 'heiler', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Kleriker', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Paladin', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'In jeder Runde ohne offensive Handlung, mit Schild und ohne Bewegung: Bonus auf Abwehr gegen bewusste Angriffe, die nicht von hinten kommen. Derselbe Bonus gilt aktionsfrei auf KÖR+HÄ gegen Zurückdrängen.',
        proRang: '+2 Abwehr; zusätzlich 1× pro Kampf einen Abwehr-Patzer wiederholen'
    },
    {
        name: 'Blutige Heilung',
        access: [],
        heldenZugang: [{ heldenklasse: 'Blutmagier', minStufe: 12, maxRang: 3 }],
        effekt: 'Selbstheilung mit eigenem Blut (freie Aktion, max. 1× pro Runde): Probe mit PW = eigene Stufe. Erfolg heilt das doppelte Probenergebnis, Misserfolg verursacht nicht abwehrbaren Schaden in Höhe des doppelten Talentrangs; bei Patzer W20 Stunden gesperrt.',
        proRang: '1 Einsatz pro Kampf (außerhalb des Kampfes beliebig oft)'
    },
    {
        name: 'Blutschild',
        access: [],
        heldenZugang: [{ heldenklasse: 'Blutmagier', minStufe: 10, maxRang: 5 }],
        effekt: 'Opfert 2 LK (freie Aktion) und erhöht dafür die Abwehr für W20 Runden.',
        proRang: '2 weitere LK opferbar für weitere +2 Abwehr'
    },
    {
        name: 'Brutaler Hieb',
        access: [
            { klasse: 'krieger', minStufe: 4, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Berserker', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kampfmönch', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Kleriker', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Kriegszauberer', minStufe: 16, maxRang: 3 }
        ],
        effekt: 'Erhöht den Wert in Schlagen für einen einzelnen Angriff um den Wert von KÖR. Mehrere Ränge sind in einem Schlag kombinierbar.',
        proRang: '1 Einsatz pro Kampf'
    },
    {
        name: 'Charmant',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Bonus auf soziale Interaktion (sympathisch auftreten, glaubhaft erzählen). Settingoption: In vielen Settings ist Zwergen dieses Talent verwehrt.',
        proRang: '+2 (+3 bei Vertretern des anderen Geschlechts)'
    },
    {
        name: 'Dämonen zerschmettern',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Kampfmönch', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Kleriker', minStufe: 12, maxRang: 3 },
            { heldenklasse: 'Paladin', minStufe: 12, maxRang: 3 }
        ],
        effekt: 'Nahkampfangriff gegen einen Dämon, der nicht abgewehrt werden kann; vor dem Angriffswurf anzusagen, mit Brutaler Hieb / Vergeltung kombinierbar.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Dämonenbrut',
        access: [],
        heldenZugang: [{ heldenklasse: 'Dämonologe', minStufe: 16, maxRang: 3 }],
        effekt: 'Bei einer Beschwörung zusätzliche Dämonen gleichen Typs ohne weiteren Beschwörungskreis und ohne weitere Probe. Misslingt die Beschwörung, wendet sich die gesamte Brut gegen den Beschwörer.',
        proRang: '1 weiterer Dämon pro Beschwörung'
    },
    {
        name: 'Dämonenzauber',
        access: [],
        heldenZugang: [{ heldenklasse: 'Dämonologe', minStufe: 16, maxRang: 3 }],
        effekt: 'Bringt einem beschworenen Dämon einen eigenen Zauberspruch bei (dauert eine Aktion; nicht "Dämonen beschwören"). Der Dämon hat den Zauber für die Dauer der Beschwörung aktiv.',
        proRang: '1 weiterer Dämon kann so einen Zauber erhalten'
    },
    {
        name: 'Diebeskunst',
        access: [
            { klasse: 'krieger', minStufe: 8, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 8, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [{ heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 5 }],
        effekt: 'Bonus auf Fallen entdecken/entschärfen, Taschendiebstahl, Schlösser öffnen und das Manipulieren von Glücksspielen.',
        proRang: '+2'
    },
    {
        name: 'Diener der Dunkelheit',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 5 }
        ],
        heldenZugang: [
            { heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Bonus auf alle Angriffe gegen Wesen/Diener des Lichts sowie auf die Abwehr gegen Schaden von Lichtzaubern. Schließt das Talent Diener des Lichts aus.',
        proRang: '+1'
    },
    {
        name: 'Diener des Lichts',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Paladin', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Bonus auf die Abwehr gegen Angriffe von Wesen/Dienern der Dunkelheit sowie gegen Schaden von Schattenzaubern. Verstöße gegen die Prinzipien des Lichts kosten Talentränge ersatzlos. Schließt das Talent Diener der Dunkelheit aus.',
        proRang: '+1'
    },
    {
        name: 'Einbetten',
        access: [
            { klasse: 'heiler', minStufe: 10, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 10, maxRang: 5 },
            { klasse: 'schwarzmagier', minStufe: 10, maxRang: 5 }
        ],
        heldenZugang: [{ heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 10 }],
        effekt: 'Voraussetzung, um magische Gegenstände herzustellen (PDF S. 111). Hilft auch bei Tränken/Schriftrollen, ersetzt dort aber nicht Alchemie bzw. Runenkunde.',
        proRang: 'Herstellungsdauer sinkt; +1 auf Einbetten-Proben'
    },
    {
        name: 'Einstecker',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 5 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 4 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Berserker', minStufe: 10, maxRang: 10 },
            { heldenklasse: 'Blutmagier', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Erhöht die Lebenskraft (LK).',
        proRang: 'LK +3'
    },
    {
        name: 'Elementare bündeln',
        access: [],
        heldenZugang: [{ heldenklasse: 'Elementarist', minStufe: 10, maxRang: 10 }],
        effekt: 'Ruft bei einer Herbeirufung zusätzliche Elementare der Stufe I herbei — einzeln oder gebündelt (Stufen addieren sich bis max. III), vorab festzulegen. Kein weiteres Portal und keine weitere Probe nötig, aber der ZB sinkt entsprechend. Misslingt die Herbeirufung, wenden sich alle Elementare gegen den Elementaristen.',
        proRang: '1 weiterer Elementar (Stufe I)'
    },
    {
        name: 'Elementen trotzen',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Elementarist', minStufe: 10, maxRang: 10 },
            { heldenklasse: 'Erzmagier', minStufe: 16, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 14, maxRang: 5 }
        ],
        effekt: 'Ignoriert erlittenen Elementarschaden jeder Art (Blitz, Eis, Feuer …), auch nicht abwehrbaren. Auslösen ist eine freie Aktion.',
        proRang: '1 Einsatz pro 24 Stunden; Wirkungsdauer = 3 × Talentrang Runden'
    },
    {
        name: 'Explosionskontrolle',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Elementarist', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Erzmagier', minStufe: 16, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Verschont eine Person (auch sich selbst) vor der Wirkung eines eigenen Flächenzaubers.',
        proRang: '1 verschonte Person und 1 Einsatz pro Kampf'
    },
    {
        name: 'Feuermagier',
        access: [
            { klasse: 'zauberer', minStufe: 4, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Elementarist', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 12, maxRang: 5 }
        ],
        effekt: 'Bonus auf alle Zauber mit Feuereffekt.',
        proRang: '+1'
    },
    {
        name: 'Fieser Schuß',
        access: [{ klasse: 'spaeher', minStufe: 4, maxRang: 3 }],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Waldläufer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Erhöht den Wert in Schießen für einen Angriff um den Wert von Agilität. Mehrere Ränge sind in einem Schuß kombinierbar; Zielzauber profitieren nicht.',
        proRang: '1 Einsatz pro Kampf'
    },
    {
        name: 'Flink',
        access: [
            { klasse: 'krieger', minStufe: 8, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 4, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 4, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 4, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Erhöht den Wert für Laufen.',
        proRang: 'Laufen +1m'
    },
    {
        name: 'Friedvoller Hieb',
        access: [],
        heldenZugang: [{ heldenklasse: 'Kampfmönch', minStufe: 16, maxRang: 3 }],
        effekt: 'Waffenloser Angriff, der keinen Schaden erzeugt, sondern das Opfer pro letztendlich erhaltenem Schadenspunkt 1 Runde lähmt (Abwehr wird normal abgezogen). Ein anderweitiger Angriff auf das Ziel beendet die Wirkung.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Frontheiler',
        access: [{ klasse: 'heiler', minStufe: 12, maxRang: 5 }],
        heldenZugang: [],
        effekt: 'Ignoriert die Abklingzeit eines Heilzaubers (auch Wiederbelebung).',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Fürsorger',
        access: [{ klasse: 'heiler', minStufe: 1, maxRang: 3 }],
        heldenZugang: [{ heldenklasse: 'Paladin', minStufe: 10, maxRang: 3 }],
        effekt: 'Bonus auf alle Heil- und Schutzzauber.',
        proRang: '+1'
    },
    {
        name: 'Genesung',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 5 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 5 },
            { klasse: 'heiler', minStufe: 1, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 5 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 5 }
        ],
        heldenZugang: [],
        effekt: 'Stellt KÖR-Punkte wieder her, die durch eine Wiederbelebung verloren gingen. KÖR kann nicht über den ursprünglichen Wert gesteigert werden.',
        proRang: 'KÖR +1 (nur als Wiederherstellung)'
    },
    {
        name: 'Gerüstet',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Kleriker', minStufe: 10, maxRang: 2 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 3 }
        ],
        effekt: 'Erlaubt das Tragen der jeweils nächsten Rüstungsklasse (Stoff → Leder → Kette → Platte). Die normalen PA-Mali (z.B. beim Zaubern) bleiben bestehen — dafür wird Rüstzauberer benötigt.',
        proRang: '1 Rüstungsklasse höher'
    },
    {
        name: 'Gezieltes Gift',
        access: [],
        heldenZugang: [{ heldenklasse: 'Attentäter', minStufe: 14, maxRang: 3 }],
        effekt: 'Verstärkt Waffengifte bei eigenen Angriffen.',
        proRang: 'Schadensgifte +2 Schaden, Betäubungsgifte +2 Minuten, Lähmungsgifte +2 Runden'
    },
    {
        name: 'Glückspilz',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [{ heldenklasse: 'Meisterdieb', minStufe: 16, maxRang: 5 }],
        effekt: 'Ignoriert einen Patzer und wiederholt den Wurf. Ist auch der neue Wurf ein Patzer, kann ein weiterer Talentrang ihn ebenfalls ausgleichen.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Handwerk',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Wird für jede Handwerksart (Bogenbauer, Schreiner, Steinmetz, Waffenschmied …) EINZELN erlernt, kann also mehrfach bis je Höchstrang III erworben werden. Gilt für Herstellung und Reparatur.',
        proRang: '+3 auf Proben des jeweiligen Handwerks',
        mehrfach: 'pro Handwerksart'
    },
    {
        name: 'Heimlichkeit',
        access: [
            { klasse: 'krieger', minStufe: 4, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 4, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 4, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 4, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kampfmönch', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Bonus auf alle Proben, leise zu sein, sich zu verbergen, nicht bemerkt zu werden oder etwas heimlich zu tun (z.B. Taschendiebstahl).',
        proRang: '+2'
    },
    {
        name: 'Heldenglück',
        access: [
            { klasse: 'krieger', minStufe: 10, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 10, maxRang: 3 },
            { klasse: 'heiler', minStufe: 10, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 10, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 10, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Wiederholt einen beliebigen Würfelwurf (nicht nur Patzer). Weitere Talentränge erlauben weitere Wiederholungen desselben Wurfs.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Herausforderer der Elemente',
        access: [],
        heldenZugang: [{ heldenklasse: 'Elementarist', minStufe: 14, maxRang: 3 }],
        effekt: 'Ignoriert die Abklingzeit des Zauberspruchs "Elementar herbeirufen" — alternativ die eines Zaubers, der Elementarschaden verursacht.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Herr der Elemente',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Elementarist', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 14, maxRang: 5 }
        ],
        effekt: 'Bonus auf alle Zauber, deren Schaden auf Erde, Feuer, Luft (inkl. Blitz) oder Wasser (inkl. Eis) basiert.',
        proRang: '+1'
    },
    {
        name: 'Hinterhältiger Angriff',
        access: [],
        heldenZugang: [{ heldenklasse: 'Attentäter', minStufe: 10, maxRang: 3 }],
        effekt: 'Einmal pro Kampf: Nahkampfangriff mit Dolch, Messer oder Würgewaffe gegen ein ahnungsloses Ziel. Schlagen wird um GE × Talentrang erhöht. Wird damit der Kampf eröffnet und der Angriff gelingt, kann das Ziel in dieser Runde nicht mehr agieren.',
        proRang: 'Schlagen-Bonus +1 × GE (Multiplikator = Talentrang)'
    },
    {
        name: 'Homunkulus',
        access: [],
        heldenZugang: [{ heldenklasse: 'Erzmagier', minStufe: 14, maxRang: 3 }],
        effekt: 'Erschafft einen kleinen magischen Begleiter (KÖR/AGI/GEI je 4, 6 frei verteilbare Eigenschaftspunkte, klein: halbe LK, −2 zu treffen). Vertrauter/Vertrautenband sind nicht anwendbar. Stirbt er, kann binnen W20 Stunden mit Alchimistenlabor ein neuer erschaffen werden.',
        proRang: 'aufteilbarer Bonus von +2 auf VE und/oder AU (innerhalb AU × 5 Meter)'
    },
    {
        name: 'Ich muss weg!',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Kampfmönch', minStufe: 12, maxRang: 3 },
            { heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 3 }
        ],
        effekt: 'Ignoriert für je eine Runde sämtliche gegen ihn gerichteten Nahkampfangriffe. Er darf dabei nicht angreifen und muss sich mindestens 2m von den Gegnern entfernen.',
        proRang: '1 weitere Runde pro Kampf'
    },
    {
        name: 'In Deckung',
        access: [
            { klasse: 'krieger', minStufe: 8, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 8, maxRang: 3 },
            { klasse: 'heiler', minStufe: 8, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kampfmönch', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'In jeder Kampfrunde ohne offensive Handlung werden alle Angriffe gegen ihn gesenkt, sofern er sich ihrer bewusst ist.',
        proRang: 'Angriffe gegen ihn −2'
    },
    {
        name: 'Instrument',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Wird für jedes Instrument (Flöte, Mandoline, Harfe, Trommel …) EINZELN erlernt, kann also mehrfach bis je Höchstrang III erworben werden.',
        proRang: '+3 auf Proben mit dem jeweiligen Instrument',
        mehrfach: 'pro Instrument'
    },
    {
        name: 'Jäger',
        access: [
            { klasse: 'krieger', minStufe: 8, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 12, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 12, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 12, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Druide', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Waldläufer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Bonus auf Proben zum Spuren lesen, Wild jagen und Wiederfinden der Marschrichtung.',
        proRang: '+2; zusätzlich 1 Mahlzeit pro Rang problemlos beschaffbar (3 Mahlzeiten = 1 Tagesration)'
    },
    {
        name: 'Kämpfer',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 8, maxRang: 3 },
            { klasse: 'heiler', minStufe: 8, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Berserker', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kleriker', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Paladin', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Waffenmeister', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Erhöht den Wert in Schlagen dauerhaft.',
        proRang: 'Schlagen +1'
    },
    {
        name: 'Kann ich mal vorbei?',
        access: [],
        heldenZugang: [{ heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 3 }],
        effekt: 'Lenkt eine Zielperson so ab, dass deren Bemerken-Proben gegen Taschendiebstahl u.ä. für (Talentrang) Runden um die Stufe des Meisterdiebs erschwert sind.',
        proRang: '1 Einsatz pro 24 Stunden; Wirkungsdauer +1 Runde'
    },
    {
        name: 'Kletterass',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 12, maxRang: 3 },
            { heldenklasse: 'Meisterdieb', minStufe: 12, maxRang: 3 },
            { heldenklasse: 'Waldläufer', minStufe: 14, maxRang: 3 }
        ],
        effekt: 'Bonus auf Klettern-Proben; erhöht die Klettergeschwindigkeit (normal Laufen/2). Zudem kann er an Überhängen und kopfüber an Decken normal klettern, sofern diese Griffe bieten.',
        proRang: '+2 auf Klettern; Klettergeschwindigkeit +1m'
    },
    {
        name: 'Knechtschaft',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Dämonologe', minStufe: 16, maxRang: 5 },
            { heldenklasse: 'Elementarist', minStufe: 16, maxRang: 5 }
        ],
        effekt: 'Stellt selbst beschworenen/herbeigerufenen Wesenheiten zusätzliche Fragen bzw. erteilt weitere Aufträge und verlängert deren Dienstzeit.',
        proRang: '+1 Frage/Auftrag und +1 Stunde Dienstzeit'
    },
    {
        name: 'Kraft der Bestie',
        access: [],
        heldenZugang: [{ heldenklasse: 'Druide', minStufe: 10, maxRang: 5 }],
        effekt: 'Erhöht alle verfügbaren Kampfwerte in Adler-, Bären- oder Tiergestalt.',
        proRang: 'alle Kampfwerte der Tiergestalt +2'
    },
    {
        name: 'Kreiszeichner',
        access: [],
        heldenZugang: [{ heldenklasse: 'Dämonologe', minStufe: 12, maxRang: 3 }],
        effekt: 'Meister im Zeichnen von Beschwörungskreisen. Wirkt auch bei improvisierten Kreisen.',
        proRang: '2 weitere Stunden Arbeit investierbar; −15 Minuten Zeitaufwand je Stunde; +1 auf Beschwören'
    },
    {
        name: 'Langfinger',
        access: [],
        heldenZugang: [{ heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 3 }],
        effekt: 'Addiert AGI zur Probe auf Taschendiebstahl. Mehrere Ränge sind in einer Probe kombinierbar, ebenso mit Diebeskunst.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Macht des Blutes',
        access: [],
        heldenZugang: [{ heldenklasse: 'Blutmagier', minStufe: 14, maxRang: 3 }],
        effekt: 'Erhöht den Probenwert einer beliebigen Probe um den Wert des darin enthaltenen Attributs (z.B. Klettern AGI+ST um AGI). Ränge sind in einer Probe kombinierbar. Kostet 2 nicht abwehrbaren Schaden pro eingesetztem Rang. Mit Zaubermacht kombinierbar (deren Ränge verursachen keinen Schaden).',
        proRang: '1 Einsatz pro Tag; Kosten 2 nicht abwehrbarer Schaden pro eingesetztem Rang'
    },
    {
        name: 'Mächtige Beschwörung',
        access: [],
        heldenZugang: [{ heldenklasse: 'Dämonologe', minStufe: 16, maxRang: 3 }],
        effekt: 'Verteilt Punkte in Höhe des eigenen GEI-Wertes frei auf die Kampfwerte jedes beschworenen Dämons.',
        proRang: 'weitere GEI Punkte verteilbar'
    },
    {
        name: 'Mächtige Erweckung',
        access: [],
        heldenZugang: [{ heldenklasse: 'Nekromant', minStufe: 16, maxRang: 3 }],
        effekt: 'Verteilt Punkte in Höhe von GEI/2 frei auf die Kampfwerte jedes erweckten Untoten.',
        proRang: 'weitere GEI/2 Punkte verteilbar'
    },
    {
        name: 'Mächtige Herbeirufung',
        access: [],
        heldenZugang: [{ heldenklasse: 'Elementarist', minStufe: 16, maxRang: 3 }],
        effekt: 'Verteilt Punkte in Höhe des eigenen GEI-Wertes frei auf die Kampfwerte jedes herbeigerufenen Elementars.',
        proRang: 'weitere GEI Punkte verteilbar'
    },
    {
        name: 'Magieresistent',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [{ heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 5 }],
        effekt: 'Gegen den Charakter gerichtete Zauber werden erschwert. Gilt NICHT für Zauber, die Elementarschaden (Blitz, Eis, Feuer …) verursachen.',
        proRang: 'gegnerische Zauber −2'
    },
    {
        name: 'Manipulator',
        access: [
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Erzmagier', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Kampfmönch', minStufe: 14, maxRang: 5 }
        ],
        effekt: 'Bonus auf alle geistesbeeinflussenden Zauber (im Regelwerk entsprechend gekennzeichnet).',
        proRang: '+1'
    },
    {
        name: 'Meister aller Klassen',
        access: [
            { klasse: 'krieger', minStufe: 20, maxRang: 1 },
            { klasse: 'spaeher', minStufe: 20, maxRang: 1 },
            { klasse: 'heiler', minStufe: 20, maxRang: 1 },
            { klasse: 'zauberer', minStufe: 20, maxRang: 1 },
            { klasse: 'schwarzmagier', minStufe: 20, maxRang: 1 }
        ],
        heldenZugang: [],
        effekt: 'Steigert eines der drei Attribute (KÖR, AGI oder GEI) um +1.',
        proRang: 'nur 1 Rang möglich: ein Attribut +1'
    },
    {
        name: 'Meister seiner Klasse',
        access: [
            { klasse: 'krieger', minStufe: 15, maxRang: 1 },
            { klasse: 'spaeher', minStufe: 15, maxRang: 1 },
            { klasse: 'heiler', minStufe: 15, maxRang: 1 },
            { klasse: 'zauberer', minStufe: 15, maxRang: 1 },
            { klasse: 'schwarzmagier', minStufe: 15, maxRang: 1 }
        ],
        heldenZugang: [],
        effekt: 'Steigert das primäre Attribut der Klasse um +1: Krieger KÖR, Späher AGI, Zauberwirker GEI.',
        proRang: 'nur 1 Rang möglich: Primärattribut +1'
    },
    {
        name: 'Meucheln',
        access: [],
        heldenZugang: [{ heldenklasse: 'Attentäter', minStufe: 14, maxRang: 3 }],
        effekt: 'Senkt die Abwehr des Gegners gegen Schaden durch das Talent Hinterhältiger Angriff. Wirkungslos gegen Ziele, die 2+ Größenkategorien größer sind.',
        proRang: 'Gegnerabwehr −5'
    },
    {
        name: 'Nekromantie',
        access: [
            { klasse: 'heiler', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [{ heldenklasse: 'Nekromant', minStufe: 10, maxRang: 5 }],
        effekt: 'Bonus auf alle Zauber, die Untote bannen, erwecken oder kontrollieren.',
        proRang: '+2'
    },
    {
        name: 'Panzerung zerschmettern',
        access: [{ klasse: 'krieger', minStufe: 8, maxRang: 3 }],
        heldenZugang: [{ heldenklasse: 'Berserker', minStufe: 12, maxRang: 5 }],
        effekt: 'Jedes Mal, wenn der Charakter im Nahkampf Schaden verursacht, sinkt der PA-Wert eines zufällig ermittelten Rüstungsteils des Opfers. Bei PA ≤ 0 gilt das Teil als zerstört (reparierbar). Wirkungslos gegen magische und natürliche Rüstungen.',
        proRang: 'PA des getroffenen Rüstungsteils −1'
    },
    {
        name: 'Parade',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 8, maxRang: 3 },
            { klasse: 'heiler', minStufe: 12, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 12, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 12, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Waffenmeister', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Mit gezogener Nahkampfwaffe: Bonus auf Abwehr gegen jeden bewussten Nahkampfangriff, der nicht von hinten erfolgt.',
        proRang: 'Abwehr +1'
    },
    {
        name: 'Perfektion',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Waffenmeister', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Steigert die Boni (Schlagen und Gegnerabwehr) eines BEREITS ERWORBENEN Waffenkenner-Talents für eine einzelne Waffenart.',
        proRang: 'Schlagen +1 und Gegnerabwehr −1 zusätzlich für diese Waffenart',
        voraussetzung: 'benötigt das Talent Waffenkenner für die betreffende Waffenart'
    },
    {
        name: 'Präziser Schuß',
        access: [{ klasse: 'spaeher', minStufe: 15, maxRang: 3 }],
        heldenZugang: [],
        effekt: 'Fernkampfangriff, gegen den keine Abwehr gewürfelt wird. Muss vor der Schießen-Probe angesagt werden; pro Talentrang mit je einem Talentrang eines anderen Talents (z.B. Fieser Schuß) kombinierbar.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Prügler',
        access: [{ klasse: 'krieger', minStufe: 8, maxRang: 3 }],
        heldenZugang: [],
        effekt: 'Bei einem Immersieg mit stumpfen Waffen, Äxten oder Zweihandwaffen sinkt die Abwehr des Gegners gegen diesen Angriff.',
        proRang: 'Gegnerabwehr −5'
    },
    {
        name: 'Raserei',
        access: [],
        heldenZugang: [{ heldenklasse: 'Berserker', minStufe: 10, maxRang: 5 }],
        effekt: 'Tauscht Abwehr gegen Angriffskraft. Die Umschichtung kann jede Runde als freie Aktion geändert werden.',
        proRang: 'Abwehr −1 für Schlagen +2'
    },
    {
        name: 'Reiten',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Druide', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Paladin', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Waldläufer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Der Charakter kann reiten: Richtung/Geschwindigkeit des Reittiers um einen Schritt ändern und vom Pferderücken angreifen.',
        proRang: '+2 auf Sprünge und auf Wechsel um mehr als einen Schritt; +1 auf Schlagen gegen unberittene Gegner im berittenen Kampf'
    },
    {
        name: 'Ritual der Narben',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Blutmagier', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Dämonologe', minStufe: 12, maxRang: 3 },
            { heldenklasse: 'Nekromant', minStufe: 14, maxRang: 3 }
        ],
        effekt: 'Permanenter magischer Abwehrbonus durch vernarbte Runen — um den Preis sozialer Mali und dauerhaft verlorener Lebenskraft.',
        proRang: 'Abwehr +2 permanent; −1 auf soziale Interaktion; LK −1 permanent'
    },
    {
        name: 'Rundumschlag',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Berserker', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Kampfmönch', minStufe: 16, maxRang: 3 }
        ],
        effekt: 'Trifft mit einer Zweihandwaffe zusätzliche angrenzende Gegner (nur EINE Schlagen-Probe für den ganzen Rundumschlag). Je zusätzlichem Feind: Schlagen −1 und Abwehr −2 bis zum nächsten eigenen Zug.',
        proRang: '1 weiterer angrenzender Gegner',
        voraussetzung: 'Kampfmönche nur waffenlos in Verbindung mit Waffenloser Meister; Rang nie höher als Waffenloser Meister'
    },
    {
        name: 'Runenkunde',
        access: [
            { klasse: 'heiler', minStufe: 1, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 5 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 5 }
        ],
        heldenZugang: [{ heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 10 }],
        effekt: 'Voraussetzung, um Schriftrollen herzustellen (PDF S. 111).',
        proRang: 'Zubereitungsdauer sinkt; +1 auf Proben zum Fertigen/Identifizieren von Schriftrollen'
    },
    {
        name: 'Rüstträger',
        access: [
            { klasse: 'krieger', minStufe: 4, maxRang: 5 },
            { klasse: 'spaeher', minStufe: 8, maxRang: 5 }
        ],
        heldenZugang: [
            { heldenklasse: 'Kleriker', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Mindert den durch Rüstung verursachten Malus auf Laufen.',
        proRang: 'Laufen-Malus um 0,5m gemindert'
    },
    {
        name: 'Rüstzauberer',
        access: [{ klasse: 'heiler', minStufe: 1, maxRang: 1 }],
        heldenZugang: [
            { heldenklasse: 'Kleriker', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Paladin', minStufe: 10, maxRang: 3 }
        ],
        effekt: 'Ignoriert Panzerungsmalus (PA) beim Zaubern/Zielzaubern. Beispiel: 2 Ränge erlauben ungehindertes Zaubern in Plattenpanzer (PA 3) + Metallhelm (PA 1).',
        proRang: '2 Punkte PA-Malus ignoriert'
    },
    {
        name: 'Salve',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Waffenmeister', minStufe: 16, maxRang: 3 },
            { heldenklasse: 'Waldläufer', minStufe: 12, maxRang: 5 }
        ],
        effekt: 'Zusätzliche Fernkampfschüsse, gebündelt in einer Runde oder auf mehrere Runden verteilt. Jeder Schuss ist ein eigenständiger Angriff (Fieser Schuß greift also nicht mehrfach).',
        proRang: '1 zusätzlicher Schuss pro Kampf'
    },
    {
        name: 'Sattelschütze',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Waldläufer', minStufe: 10, maxRang: 3 }
        ],
        effekt: 'Erlaubt das Schießen mit einer zweihändig geführten Schusswaffe vom Reittier aus. Grundmalus: −5 im Trab, −10 im Galopp.',
        proRang: 'Rang 1 schaltet die Fähigkeit frei; Rang 2 und 3 mindern den Malus um je 5',
        voraussetzung: 'benötigt mindestens 1 Talentrang in Reiten'
    },
    {
        name: 'Scharfschütze',
        access: [
            { klasse: 'krieger', minStufe: 12, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 8, maxRang: 3 },
            { klasse: 'heiler', minStufe: 12, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 12, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 12, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Waffenmeister', minStufe: 14, maxRang: 5 },
            { heldenklasse: 'Waldläufer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Senkt die Abwehr des Gegners gegen die eigenen Fernkampfangriffe (Schießen).',
        proRang: 'Gegnerabwehr −1'
    },
    {
        name: 'Schlachtruf',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Berserker', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Paladin', minStufe: 12, maxRang: 3 }
        ],
        effekt: 'Freie Aktion: Schlachtruf, der auf ihn und Kameraden in Hörweite wirkt — für W20/2 Runden Bonus auf alle Angriffe. Ein Charakter kann immer nur von einem Schlachtruf profitieren.',
        proRang: '1 Einsatz pro Kampf; +3 betroffene Kameraden; Bonus +1 auf alle Angriffe'
    },
    {
        name: 'Schlitzohr',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [{ heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 5 }],
        effekt: 'Bonus auf alle sozialen Proben, bei denen geblufft, gefeilscht oder verhandelt wird.',
        proRang: '+3'
    },
    {
        name: 'Schlossknacker',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Bonus auf Schlösser öffnen; zusätzlich weitere malusfreie Versuche am selben Schloss. Mit Diebeskunst kombinierbar.',
        proRang: '+2 auf Schlösser öffnen; 1 weiterer Versuch ohne Malus'
    },
    {
        name: 'Schmerzhafter Wechsel',
        access: [],
        heldenZugang: [{ heldenklasse: 'Blutmagier', minStufe: 12, maxRang: 3 }],
        effekt: 'Wechselt als freie Aktion zu einem beliebigen, nicht aktiven Zauber und erleidet dabei augenblicklich W20/2 abwehrbaren Schaden.',
        proRang: '1 Einsatz pro Kampf'
    },
    {
        name: 'Schnelle Reflexe',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Berserker', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Waffenmeister', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Erhöht die Initiative und erlaubt schnelles Waffenhandling.',
        proRang: 'Initiative +2; zusätzlich 1× pro Kampf eine Waffe als freie Aktion ziehen, wechseln oder aufheben'
    },
    {
        name: 'Schutz vor Elementen',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Druide', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Elementarist', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kampfmönch', minStufe: 12, maxRang: 3 },
            { heldenklasse: 'Kriegszauberer', minStufe: 14, maxRang: 5 }
        ],
        effekt: 'Variiert die gefühlte Außentemperatur und schützt zeitweise vor Elementarschaden (nur gegen Schaden, gegen den ein Abwehrwurf zulässig ist).',
        proRang: 'Temperaturwirkung ±15°; Ausdehnung auf 2 weitere Gefährten im Umkreis von VE Metern; 1× pro 24 Stunden Abwehr gegen Elementarschaden +5 (freie Aktion)'
    },
    {
        name: 'Schütze',
        access: [
            { klasse: 'krieger', minStufe: 8, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 8, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Elementarist', minStufe: 16, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Meisterdieb', minStufe: 14, maxRang: 5 },
            { heldenklasse: 'Waffenmeister', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Waldläufer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Erhöht Schießen und Zielzauber dauerhaft.',
        proRang: 'Schießen +1 und Zielzauber +1'
    },
    {
        name: 'Schwimmen',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Der Charakter kann schwimmen und erhält einen Bonus auf alle diesbezüglichen Proben.',
        proRang: '+3'
    },
    {
        name: 'Sehnenschneider',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 12, maxRang: 3 },
            { heldenklasse: 'Waffenmeister', minStufe: 16, maxRang: 3 }
        ],
        effekt: 'Vor dem Nahkampfangriff anzusagen: die eigene Abwehr wird bis zum nächsten eigenen Zug halbiert. Der erzielte Schaden wird halbiert, dafür sinkt der Laufen-Wert des Gegners. Ohne Schaden gilt der Einsatz nicht als verbraucht. Die Verletzung ist nur magisch heilbar.',
        proRang: '1 Einsatz pro Kampf; Laufen des Gegners −0,5m'
    },
    {
        name: 'Sensenspötter',
        access: [],
        heldenZugang: [{ heldenklasse: 'Nekromant', minStufe: 16, maxRang: 3 }],
        effekt: 'Nach dem regeltechnischen Tod noch weiter handeln, als wäre er am Leben (nicht bei Enthauptung, Explosion, Zerstampfen o.ä.). War er bei Todeseintritt bewusstlos, bleibt er es, kann in dieser Zeit aber verarztet und geheilt werden.',
        proRang: '1 weitere Runde'
    },
    {
        name: 'Spruchmeister',
        access: [
            { klasse: 'heiler', minStufe: 15, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 15, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 15, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Ignoriert 1× pro 24 Stunden die Abklingzeit eines bei Rangerwerb festgelegten Zauberspruchs. Zauber mit regulärer Abklingzeit über 24 Stunden sind nicht wählbar.',
        proRang: '1 weiterer Zauber wählbar; mehrere Ränge im selben Zauber = entsprechend häufigeres Ignorieren pro 24 Stunden'
    },
    {
        name: 'Stabbindung',
        access: [],
        heldenZugang: [{ heldenklasse: 'Erzmagier', minStufe: 12, maxRang: 5 }],
        effekt: 'Ränge werden einzeln an bestimmte Kampfstäbe gebunden (verteilbar auf mehrere Stäbe). Der Stab wird dadurch magisch und zerbricht nicht bei einem Schlagen-Patzer. Wird ein Stab zerstört, sind die Ränge nicht verloren und nach W20 Wochen neu bindbar.',
        proRang: '+1 auf Zielzauber (zusätzlich zum normalen +1 des Kampfstabs), solange er den Stab hält; 1 Zauber an den Stab gebunden (Stab wirkt dafür wie ein Zauberstab)'
    },
    {
        name: 'Standhaft',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 4, maxRang: 3 },
            { klasse: 'heiler', minStufe: 8, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Senkt die LK-Grenze, ab der ein Charakter bewusstlos wird (Standhaft III: erst bei −9 LK statt bei 0).',
        proRang: 'Bewusstlosigkeitsgrenze −3 LK'
    },
    {
        name: 'Teufelchen',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Dämonologe', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Erzmagier', minStufe: 12, maxRang: 3 }
        ],
        effekt: 'Kleines fliegendes Teufelchen als Kampfbegleiter. Es gibt drei Typen (I–III), die durch weitere Ränge freigeschaltet werden; bei Rangerwerb wird der Typ festgelegt (ein niedrigerer Typ ist erneut wählbar). Bei unter 1 LK oder auf Befehl kehrt es zurück und ist frühestens nach W20 Stunden erneut rufbar. Vertrauter/Vertrautenband sind nicht anwendbar.',
        proRang: '1 weiteres Teufelchen; Zugang zum nächsthöheren Teufelchen-Typ'
    },
    {
        name: 'Tiergestalt',
        access: [],
        heldenZugang: [{ heldenklasse: 'Druide', minStufe: 10, maxRang: 5 }],
        effekt: 'Verwandlung in ein Tier der Größenkategorie "normal" oder kleiner (keine magischen, giftigen oder flugfähigen Tiere) samt Ausrüstung; jederzeit rückgängig machbar. GEI/VE/AU bleiben, alle anderen Werte werden die des Tieres (ohne Spezialangriffe). Kein Sprechen/Zaubern.',
        proRang: '1 weitere Verwandlung pro 24 Stunden'
    },
    {
        name: 'Tiermeister',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Druide', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Waldläufer', minStufe: 12, maxRang: 3 },
            { heldenklasse: 'Kampfmönch', minStufe: 14, maxRang: 3 }
        ],
        effekt: 'Bonus von +3 auf alle Proben im Umgang mit Tieren (auch auf Reiten-Proben für Tempo-/Richtungswechsel). Zusätzlich kann er wilde oder ausgehungerte Tiere dazu bringen, ihn und Begleiter zu verschonen; bei tollwütigen/kontrollierten Tieren mit Probe GEI+AU+Talentrang (ganze Aktion).',
        proRang: '1 Einsatz pro 24 Stunden; +2 verschonte Begleiter'
    },
    {
        name: 'Tod entrinnen',
        access: [{ klasse: 'heiler', minStufe: 12, maxRang: 3 }],
        heldenZugang: [{ heldenklasse: 'Paladin', minStufe: 16, maxRang: 3 }],
        effekt: 'Bei weniger als 1 LK, aber noch lebend, heilt der Charakter automatisch. Sobald die LK wieder positiv sind, endet der Effekt und er ist voll einsatzfähig.',
        proRang: 'Wartezeit 5 Runden −1 Runde; +1 LK Heilung pro Runde'
    },
    {
        name: 'Todeskraft',
        access: [],
        heldenZugang: [{ heldenklasse: 'Nekromant', minStufe: 10, maxRang: 5 }],
        effekt: 'Stirbt in Reichweite (2 + Talentrang Meter) ein Lebewesen mindestens der Größenkategorie "klein", regeneriert der Nekromant Lebenskraft.',
        proRang: 'Reichweite +1m; +2 LK Regeneration'
    },
    {
        name: 'Totenrufer',
        access: [],
        heldenZugang: [{ heldenklasse: 'Nekromant', minStufe: 12, maxRang: 5 }],
        effekt: 'Ignoriert die Abklingzeit eines Zaubers zum Erwecken von Untoten.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Umdenken',
        access: [
            { klasse: 'heiler', minStufe: 1, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 5 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 5 }
        ],
        heldenZugang: [
            { heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 10 },
            { heldenklasse: 'Paladin', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Verlernt Zauberstufen in Höhe der eigenen Stufe und ersetzt sie durch andere Zaubersprüche gleicher Stufensumme.',
        proRang: '1 weiterer einmaliger Umbau des Zauberrepertoires'
    },
    {
        name: 'Unersättliches Beschwören',
        access: [],
        heldenZugang: [{ heldenklasse: 'Dämonologe', minStufe: 14, maxRang: 3 }],
        effekt: 'Ignoriert die Abklingzeit des Zauberspruchs "Dämonen beschwören".',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Untote Horden',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Nekromant', minStufe: 10, maxRang: 10 },
            { heldenklasse: 'Erzmagier', minStufe: 16, maxRang: 5 }
        ],
        effekt: 'Erhöht die Anzahl der erweckbaren und kontrollierbaren Untoten (Grundwert = Stufe des Charakters).',
        proRang: '+3 Untote'
    },
    {
        name: 'Untote zerschmettern',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Kampfmönch', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Kleriker', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Paladin', minStufe: 12, maxRang: 3 }
        ],
        effekt: 'Nahkampfangriff gegen einen Untoten, der nicht abgewehrt werden kann.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Verdrücken',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Kampfmönch', minStufe: 12, maxRang: 3 },
            { heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 3 }
        ],
        effekt: 'Bewegt sich bei den Aktionen Aufstehen und Rennen zusätzlich weiter; kann sich zudem mit AGI+BE aus Fesseln oder Schellen winden (je Hand eine erfolgreiche Probe).',
        proRang: '+1m Bewegung; 2 weitere Befreiungsversuche'
    },
    {
        name: 'Vergeltung',
        access: [{ klasse: 'heiler', minStufe: 12, maxRang: 3 }],
        heldenZugang: [
            { heldenklasse: 'Kleriker', minStufe: 16, maxRang: 5 },
            { heldenklasse: 'Paladin', minStufe: 16, maxRang: 3 }
        ],
        effekt: 'Erhöht den Wert in Schlagen für eine Runde um den VIERFACHEN Talentrang in Diener der Dunkelheit bzw. Diener des Lichts. Mehrere Vergeltungs-Ränge sind NICHT in einer Probe kombinierbar; mit z.B. Brutaler Hieb aber schon.',
        proRang: '1 Einsatz pro Kampf',
        voraussetzung: 'wirkt nur zusammen mit Rängen in Diener der Dunkelheit bzw. Diener des Lichts'
    },
    {
        name: 'Verheerer',
        access: [
            { klasse: 'heiler', minStufe: 8, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 8, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 8, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Elementarist', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Kleriker', minStufe: 16, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Paladin', minStufe: 14, maxRang: 3 }
        ],
        effekt: 'Senkt die Abwehr des Gegners gegen Schaden durch die eigenen Zauberangriffe (Zaubern oder Zielzaubern).',
        proRang: 'Gegnerabwehr −1'
    },
    {
        name: 'Verletzen',
        access: [
            { klasse: 'krieger', minStufe: 4, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 8, maxRang: 3 },
            { klasse: 'heiler', minStufe: 12, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 12, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 12, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Berserker', minStufe: 14, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 16, maxRang: 5 },
            { heldenklasse: 'Waffenmeister', minStufe: 14, maxRang: 5 }
        ],
        effekt: 'Senkt die Abwehr des Gegners gegen die eigenen Nahkampfangriffe (Schlagen).',
        proRang: 'Gegnerabwehr −1'
    },
    {
        name: 'Vernichtender Schlag',
        access: [{ klasse: 'krieger', minStufe: 15, maxRang: 3 }],
        heldenZugang: [],
        effekt: 'Nahkampfangriff, gegen den keine Abwehr gewürfelt wird. Muss vor der Schlagen-Probe angekündigt werden; pro Talentrang mit maximal einem Talentrang eines anderen Talents (z.B. Brutaler Hieb) kombinierbar.',
        proRang: '1 Einsatz pro 24 Stunden'
    },
    {
        name: 'Vertrautenband',
        access: [],
        heldenZugang: [
            { heldenklasse: 'Druide', minStufe: 10, maxRang: 10 },
            { heldenklasse: 'Erzmagier', minStufe: 14, maxRang: 3 },
            { heldenklasse: 'Paladin', minStufe: 12, maxRang: 5 },
            { heldenklasse: 'Waldläufer', minStufe: 12, maxRang: 5 }
        ],
        effekt: 'Telepathisches Band zu einem einzelnen Vertrauten (einfache Kommunikation). Das Tier erhält bei jedem Stufenaufstieg des Charakters +1 auf eine beliebige Eigenschaft. Stirbt das Tier, erlischt das Band; die Ränge sind nicht verloren und für einen neuen Vertrauten einsetzbar.',
        proRang: '+3 auf die Eigenschaften des Vertrauten (frei verteilbar)',
        voraussetzung: 'benötigt einen Vertrauten (Talent Vertrauter); nicht auf Homunkuli oder Teufelchen anwendbar'
    },
    {
        name: 'Vertrauter',
        access: [
            { klasse: 'spaeher', minStufe: 8, maxRang: 3 },
            { klasse: 'heiler', minStufe: 4, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 4, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 4, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Druide', minStufe: 10, maxRang: 10 },
            { heldenklasse: 'Paladin', minStufe: 10, maxRang: 1 },
            { heldenklasse: 'Waldläufer', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Ein treues Tier schließt sich an (Späher: Falke/Hund/Pferd/Wolf; Zauberwirker: Kleintier; Paladin: Schlachtross; Druide: jedes Tier bis Größenkategorie "groß"). Innerhalb von AU × 5 Metern gewährt es +1 auf einen bei Erhalt gewählten Kampfwert — Späher: Initiative oder Schießen; Zauberwirker: Zaubern oder Zielzauber; Paladin: Abwehr oder Schlagen. Stirbt der Vertraute: W20/2 nicht abwehrbarer Schaden, Bonus erlischt, temporär KÖR−1 bis ein neuer gewählt werden kann (frühestens nach W20 Wochen).',
        proRang: '1 weiterer Vertrauter'
    },
    {
        name: 'Waffenkenner',
        access: [
            { klasse: 'krieger', minStufe: 8, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 12, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 3 },
            { heldenklasse: 'Waffenmeister', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Besondere Kenntnis im Umgang mit EINER bestimmten Nahkampfwaffenart (z.B. Dolche, Langschwerter, Streitäxte). Nicht mehrfach für dieselbe Waffenart erwerbbar — dafür gibt es Perfektion.',
        proRang: '1 weitere Waffenart: mit ihr Schlagen +1 und Gegnerabwehr −1',
        mehrfach: 'jeder Rang gilt einer anderen Waffenart'
    },
    {
        name: 'Waffenloser Meister',
        access: [],
        heldenZugang: [{ heldenklasse: 'Kampfmönch', minStufe: 10, maxRang: 5 }],
        effekt: 'Meister des waffenlosen Kampfes. Gegner verlieren den normalen +5-Abwehrbonus gegen waffenlose Angriffe.',
        proRang: 'WB waffenloser Angriffe +1; Gegnerabwehr zusätzlich −1; +1 Abwehr und +1 Initiative, solange er keinen Schild und keine Rüstung über Stoff trägt'
    },
    {
        name: 'Wahrnehmung',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 5 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 5 },
            { klasse: 'heiler', minStufe: 1, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 5 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 5 }
        ],
        heldenZugang: [
            { heldenklasse: 'Attentäter', minStufe: 10, maxRang: 10 },
            { heldenklasse: 'Meisterdieb', minStufe: 10, maxRang: 10 },
            { heldenklasse: 'Waldläufer', minStufe: 10, maxRang: 10 }
        ],
        effekt: 'Bonus auf alle Bemerken-Proben.',
        proRang: '+2'
    },
    {
        name: 'Wechsler',
        access: [
            { klasse: 'heiler', minStufe: 1, maxRang: 5 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 5 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 5 }
        ],
        heldenZugang: [
            { heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 10 },
            { heldenklasse: 'Paladin', minStufe: 10, maxRang: 5 }
        ],
        effekt: 'Bonus auf Proben, den aktiven Zauber zu wechseln.',
        proRang: '+2'
    },
    {
        name: 'Wissensgebiet',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 3 },
            { klasse: 'spaeher', minStufe: 1, maxRang: 3 },
            { klasse: 'heiler', minStufe: 1, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 1, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 1, maxRang: 3 }
        ],
        heldenZugang: [],
        effekt: 'Wird für jedes Wissensgebiet (Alte Sagen, Mathematik, Naturkunde, Sternenkunde, Zwergische Religion …) EINZELN erlernt, kann also mehrfach bis je Höchstrang III erworben werden.',
        proRang: '+3 auf Proben des jeweiligen Wissensgebiets',
        mehrfach: 'pro Wissensgebiet'
    },
    {
        name: 'Zauber auslösen',
        access: [],
        heldenZugang: [{ heldenklasse: 'Meisterdieb', minStufe: 12, maxRang: 3 }],
        effekt: 'Der Meisterdieb kann wie ein Zauberwirker Zaubersprüche von Schriftrollen oder aus Zauberbüchern ablesen und auslösen (die Schrift verblasst dabei).',
        proRang: '1 weitere Zauberklasse (Heiler, Zauberer oder Schwarzmagier) freigeschaltet — deren Zauber sind unabhängig von der eigenen Stufe auslösbar'
    },
    {
        name: 'Zaubermacht',
        access: [
            { klasse: 'heiler', minStufe: 4, maxRang: 3 },
            { klasse: 'zauberer', minStufe: 4, maxRang: 3 },
            { klasse: 'schwarzmagier', minStufe: 4, maxRang: 3 }
        ],
        heldenZugang: [
            { heldenklasse: 'Elementarist', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Erzmagier', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Kriegszauberer', minStufe: 10, maxRang: 5 },
            { heldenklasse: 'Paladin', minStufe: 12, maxRang: 3 }
        ],
        effekt: 'Erhöht Zaubern oder Zielzauber für eine Runde um den Wert von Geist — nur bei Zaubern, die andere schädigen oder heilen. Mehrere Ränge sind in einem Zauber kombinierbar.',
        proRang: '1 Einsatz pro Kampf'
    },
    {
        name: 'Zauberqual',
        access: [],
        heldenZugang: [{ heldenklasse: 'Blutmagier', minStufe: 10, maxRang: 3 }],
        effekt: 'Erleidet Lebenskraftverlust (freie Aktion), um Zaubern oder Zielzauber für 1 Runde zu erhöhen.',
        proRang: '1 weiterer LK Kosten für weitere +2 auf Zaubern/Zielzauber'
    },
    {
        name: 'Zauberroutine',
        access: [],
        heldenZugang: [{ heldenklasse: 'Erzmagier', minStufe: 16, maxRang: 3 }],
        effekt: 'Hält einen bei Rangerwerb festgelegten Zauber zusätzlich aktiv (wie mit einem Zauberstab) — ohne Wechselprobe und ohne Rundenverlust.',
        proRang: '1 weiterer dauerhaft aktiver Zauber'
    },
    {
        name: 'Zauberwaffe',
        access: [],
        heldenZugang: [{ heldenklasse: 'Kriegszauberer', minStufe: 12, maxRang: 3 }],
        effekt: 'Ränge werden einzeln an bestimmte Nahkampfwaffen gebunden (verteilbar auf mehrere Waffen). Wird eine Zauberwaffe zerstört, sind die Ränge nicht verloren und nach W20 Wochen neu bindbar.',
        proRang: '+1 auf Zielzaubern, solange er die Waffe hält; 1 Zauber an die Waffe gebunden (wirkt dafür wie ein Zauberstab)'
    },
    {
        name: 'Zehrender Spurt',
        access: [],
        heldenZugang: [{ heldenklasse: 'Blutmagier', minStufe: 10, maxRang: 3 }],
        effekt: 'Opfert 1 LK (freie Aktion) und erhöht dafür den Wert in Laufen für W20/2 Runden.',
        proRang: '1 weiterer LK opferbar für weitere +2m Laufen'
    },
    {
        name: 'Zwei Waffen',
        access: [
            { klasse: 'krieger', minStufe: 1, maxRang: 5 },
            { klasse: 'spaeher', minStufe: 8, maxRang: 5 }
        ],
        heldenZugang: [],
        effekt: 'Mindert den Malus von −10 auf Schlagen und Abwehr beim Kampf mit zwei Waffen.',
        proRang: 'Malus um je 2 Punkte gemindert (Rang V: Malus komplett aufgehoben)'
    }
];

// ---------------------------------------------------------------------------
// DS4_HELDENKLASSEN — PDF S. 20-26 (Buch S. 10-16)
// Alle Heldenklassen setzen Stufe 10+ in der jeweiligen Grundklasse voraus.
// Der Wechsel ist einmalig und endgültig; der Zugang zu allen Talenten der
// Grundklasse (auch zu erst später freigeschalteten) bleibt erhalten.
// ---------------------------------------------------------------------------

const DS4_HELDENKLASSEN = {
    'Berserker': {
        basisklasse: 'krieger',
        minStufe: 10,
        voraussetzung: 'Krieger der Stufe 10+',
        beschreibung: 'Rohe Kämpfer, die sich in Kampfeswut steigern, viel einstecken und verheerenden Schaden anrichten.',
        talente: [
            { name: 'Brutaler Hieb', minStufe: 10, maxRang: 5 },
            { name: 'Einstecker', minStufe: 10, maxRang: 10 },
            { name: 'Kämpfer', minStufe: 10, maxRang: 5 },
            { name: 'Panzerung zerschmettern', minStufe: 12, maxRang: 5 },
            { name: 'Raserei', minStufe: 10, maxRang: 5 },
            { name: 'Rundumschlag', minStufe: 14, maxRang: 3 },
            { name: 'Schlachtruf', minStufe: 10, maxRang: 3 },
            { name: 'Schnelle Reflexe', minStufe: 12, maxRang: 5 },
            { name: 'Verletzen', minStufe: 14, maxRang: 5 }
        ]
    },
    'Paladin': {
        basisklasse: 'krieger',
        minStufe: 10,
        voraussetzung: 'Krieger der Stufe 10+ UND Ordensmitgliedschaft (heiliger Orden muss den Charakter aufnehmen)',
        beschreibung: 'Diener eines heiligen Ordens; verlieren die Vorzüge der Heldenklasse, wenn sie gegen den Willen ihrer Gottheit handeln.',
        zauberzugang: 'Paladine können Heilersprüche wirken. Die Spruchzugangsstufen entsprechen denen des Heilers +9 (z.B. Heilende Hand ab Stufe 10, Wiederbelebung ab Stufe 19).',
        talente: [
            { name: 'Blocker', minStufe: 10, maxRang: 5 },
            { name: 'Dämonen zerschmettern', minStufe: 12, maxRang: 3 },
            { name: 'Diener des Lichts', minStufe: 10, maxRang: 5 },
            { name: 'Fürsorger', minStufe: 10, maxRang: 3 },
            { name: 'Kämpfer', minStufe: 12, maxRang: 5 },
            { name: 'Reiten', minStufe: 10, maxRang: 5 },
            { name: 'Rüstzauberer', minStufe: 10, maxRang: 3 },
            { name: 'Schlachtruf', minStufe: 12, maxRang: 3 },
            { name: 'Tod entrinnen', minStufe: 16, maxRang: 3 },
            { name: 'Umdenken', minStufe: 10, maxRang: 5 },
            { name: 'Untote zerschmettern', minStufe: 12, maxRang: 3 },
            { name: 'Vergeltung', minStufe: 16, maxRang: 3 },
            { name: 'Verheerer', minStufe: 14, maxRang: 3 },
            { name: 'Vertrautenband', minStufe: 12, maxRang: 5 },
            { name: 'Vertrauter', minStufe: 10, maxRang: 1 },
            { name: 'Wechsler', minStufe: 10, maxRang: 5 },
            { name: 'Zaubermacht', minStufe: 12, maxRang: 3 }
        ]
    },
    'Waffenmeister': {
        basisklasse: 'krieger',
        minStufe: 10,
        voraussetzung: 'Krieger der Stufe 10+',
        beschreibung: 'Setzen auf Schnelligkeit und fatale Treffer mit ihren zahlreichen Waffen.',
        talente: [
            { name: 'Kämpfer', minStufe: 10, maxRang: 5 },
            { name: 'Parade', minStufe: 10, maxRang: 5 },
            { name: 'Perfektion', minStufe: 10, maxRang: 5 },
            { name: 'Salve', minStufe: 16, maxRang: 3 },
            { name: 'Scharfschütze', minStufe: 14, maxRang: 5 },
            { name: 'Schnelle Reflexe', minStufe: 10, maxRang: 5 },
            { name: 'Schütze', minStufe: 12, maxRang: 5 },
            { name: 'Sehnenschneider', minStufe: 16, maxRang: 3 },
            { name: 'Verletzen', minStufe: 14, maxRang: 5 },
            { name: 'Waffenkenner', minStufe: 10, maxRang: 5 }
        ]
    },
    'Attentäter': {
        basisklasse: 'spaeher',
        minStufe: 10,
        voraussetzung: 'Späher der Stufe 10+',
        beschreibung: 'Treffsichere Mörder, die schnell und tödlich zuschlagen — aus sicherer Entfernung oder mit vergifteter Dolchklinge.',
        talente: [
            { name: 'Akrobat', minStufe: 10, maxRang: 5 },
            { name: 'Ausweichen', minStufe: 10, maxRang: 5 },
            { name: 'Fieser Schuß', minStufe: 12, maxRang: 5 },
            { name: 'Gezieltes Gift', minStufe: 14, maxRang: 3 },
            { name: 'Heimlichkeit', minStufe: 10, maxRang: 5 },
            { name: 'Hinterhältiger Angriff', minStufe: 10, maxRang: 3 },
            { name: 'In Deckung', minStufe: 10, maxRang: 5 },
            { name: 'Kämpfer', minStufe: 12, maxRang: 5 },
            { name: 'Kletterass', minStufe: 12, maxRang: 3 },
            { name: 'Meucheln', minStufe: 14, maxRang: 3 },
            { name: 'Perfektion', minStufe: 10, maxRang: 3 },
            { name: 'Salve', minStufe: 14, maxRang: 3 },
            { name: 'Sattelschütze', minStufe: 14, maxRang: 3 },
            { name: 'Scharfschütze', minStufe: 10, maxRang: 5 },
            { name: 'Schlossknacker', minStufe: 14, maxRang: 3 },
            { name: 'Schnelle Reflexe', minStufe: 10, maxRang: 5 },
            { name: 'Schütze', minStufe: 10, maxRang: 5 },
            { name: 'Sehnenschneider', minStufe: 12, maxRang: 3 },
            { name: 'Verdrücken', minStufe: 14, maxRang: 3 },
            { name: 'Verletzen', minStufe: 12, maxRang: 5 },
            { name: 'Wahrnehmung', minStufe: 10, maxRang: 10 }
        ]
    },
    'Meisterdieb': {
        basisklasse: 'spaeher',
        minStufe: 10,
        voraussetzung: 'Späher der Stufe 10+',
        beschreibung: 'Wahre Meister im Schlösserknacken, Bestehlen und Fluchtergreifen.',
        talente: [
            { name: 'Akrobat', minStufe: 10, maxRang: 5 },
            { name: 'Ausweichen', minStufe: 10, maxRang: 5 },
            { name: 'Beute schätzen', minStufe: 10, maxRang: 5 },
            { name: 'Diebeskunst', minStufe: 10, maxRang: 5 },
            { name: 'Glückspilz', minStufe: 16, maxRang: 5 },
            { name: 'Heimlichkeit', minStufe: 10, maxRang: 5 },
            { name: 'Ich muss weg!', minStufe: 10, maxRang: 3 },
            { name: 'In Deckung', minStufe: 10, maxRang: 5 },
            { name: 'Kann ich mal vorbei?', minStufe: 10, maxRang: 3 },
            { name: 'Kletterass', minStufe: 12, maxRang: 3 },
            { name: 'Langfinger', minStufe: 10, maxRang: 3 },
            { name: 'Schlitzohr', minStufe: 10, maxRang: 5 },
            { name: 'Schlossknacker', minStufe: 10, maxRang: 5 },
            { name: 'Schnelle Reflexe', minStufe: 10, maxRang: 5 },
            { name: 'Schütze', minStufe: 14, maxRang: 5 },
            { name: 'Verdrücken', minStufe: 10, maxRang: 3 },
            { name: 'Wahrnehmung', minStufe: 10, maxRang: 10 },
            { name: 'Zauber auslösen', minStufe: 12, maxRang: 3 }
        ]
    },
    'Waldläufer': {
        basisklasse: 'spaeher',
        minStufe: 10,
        voraussetzung: 'Späher der Stufe 10+',
        beschreibung: 'Kundschafter, die das Leben in der Wildnis bevorzugen und ausgezeichnete Bogenschützen abgeben.',
        talente: [
            { name: 'Fieser Schuß', minStufe: 10, maxRang: 5 },
            { name: 'Jäger', minStufe: 10, maxRang: 5 },
            { name: 'Kletterass', minStufe: 14, maxRang: 3 },
            { name: 'Reiten', minStufe: 10, maxRang: 5 },
            { name: 'Salve', minStufe: 12, maxRang: 5 },
            { name: 'Sattelschütze', minStufe: 10, maxRang: 3 },
            { name: 'Scharfschütze', minStufe: 10, maxRang: 5 },
            { name: 'Schütze', minStufe: 10, maxRang: 5 },
            { name: 'Tiermeister', minStufe: 12, maxRang: 3 },
            { name: 'Vertrautenband', minStufe: 12, maxRang: 5 },
            { name: 'Vertrauter', minStufe: 10, maxRang: 5 },
            { name: 'Wahrnehmung', minStufe: 10, maxRang: 10 }
        ]
    },
    'Druide': {
        basisklasse: 'heiler',
        minStufe: 10,
        voraussetzung: 'Heiler der Stufe 10+',
        beschreibung: 'Bewahrer der Natur, die sich mit Tieren verständigen oder sogar deren Gestalt annehmen können.',
        talente: [
            { name: 'Adlergestalt', minStufe: 16, maxRang: 5 },
            { name: 'Bärengestalt', minStufe: 14, maxRang: 5 },
            { name: 'Jäger', minStufe: 10, maxRang: 5 },
            { name: 'Kraft der Bestie', minStufe: 10, maxRang: 5 },
            { name: 'Reiten', minStufe: 10, maxRang: 5 },
            { name: 'Schutz vor Elementen', minStufe: 12, maxRang: 5 },
            { name: 'Tiergestalt', minStufe: 10, maxRang: 5 },
            { name: 'Tiermeister', minStufe: 10, maxRang: 3 },
            { name: 'Vertrautenband', minStufe: 10, maxRang: 10 },
            { name: 'Vertrauter', minStufe: 10, maxRang: 10 }
        ]
    },
    'Kampfmönch': {
        basisklasse: 'heiler',
        minStufe: 10,
        voraussetzung: 'Heiler der Stufe 10+ UND Ordensmitgliedschaft',
        beschreibung: 'Mönche, die ihren Geist durch Meditation und ihren Körper im waffenlosen Kampf stählen.',
        talente: [
            { name: 'Akrobat', minStufe: 10, maxRang: 5 },
            { name: 'Ausweichen', minStufe: 10, maxRang: 5 },
            { name: 'Brutaler Hieb', minStufe: 14, maxRang: 3 },
            { name: 'Dämonen zerschmettern', minStufe: 14, maxRang: 3 },
            { name: 'Friedvoller Hieb', minStufe: 16, maxRang: 3 },
            { name: 'Heimlichkeit', minStufe: 10, maxRang: 5 },
            { name: 'Ich muss weg!', minStufe: 12, maxRang: 3 },
            { name: 'In Deckung', minStufe: 10, maxRang: 5 },
            { name: 'Manipulator', minStufe: 14, maxRang: 5 },
            { name: 'Rundumschlag', minStufe: 16, maxRang: 3 },
            { name: 'Schnelle Reflexe', minStufe: 10, maxRang: 5 },
            { name: 'Schutz vor Elementen', minStufe: 12, maxRang: 3 },
            { name: 'Tiermeister', minStufe: 14, maxRang: 3 },
            { name: 'Untote zerschmettern', minStufe: 14, maxRang: 3 },
            { name: 'Verdrücken', minStufe: 12, maxRang: 3 },
            { name: 'Waffenloser Meister', minStufe: 10, maxRang: 5 }
        ]
    },
    'Kleriker': {
        basisklasse: 'heiler',
        minStufe: 10,
        voraussetzung: 'Heiler der Stufe 10+ UND Ordensmitgliedschaft',
        beschreibung: 'Heilen im Namen ihrer Gottheit, helfen aber auch in Wehr und Waffen.',
        talente: [
            { name: 'Blocker', minStufe: 10, maxRang: 5 },
            { name: 'Brutaler Hieb', minStufe: 14, maxRang: 3 },
            { name: 'Dämonen zerschmettern', minStufe: 12, maxRang: 3 },
            { name: 'Gerüstet', minStufe: 10, maxRang: 2 },
            { name: 'Kämpfer', minStufe: 12, maxRang: 5 },
            { name: 'Rüstträger', minStufe: 10, maxRang: 5 },
            { name: 'Rüstzauberer', minStufe: 10, maxRang: 3 },
            { name: 'Untote zerschmettern', minStufe: 10, maxRang: 3 },
            { name: 'Vergeltung', minStufe: 16, maxRang: 5 },
            { name: 'Verheerer', minStufe: 16, maxRang: 5 }
        ]
    },
    'Elementarist': {
        basisklasse: 'zauberer',
        minStufe: 10,
        voraussetzung: 'Zauberer der Stufe 10+',
        beschreibung: 'Zauberer, die sich auf die Beherrschung der Elemente und das Herbeirufen von Elementaren spezialisiert haben.',
        talente: [
            { name: 'Bändiger', minStufe: 10, maxRang: 3 },
            { name: 'Blitzmacher', minStufe: 10, maxRang: 5 },
            { name: 'Elementare bündeln', minStufe: 10, maxRang: 10 },
            { name: 'Elementen trotzen', minStufe: 10, maxRang: 10 },
            { name: 'Explosionskontrolle', minStufe: 10, maxRang: 5 },
            { name: 'Feuermagier', minStufe: 10, maxRang: 5 },
            { name: 'Herausforderer der Elemente', minStufe: 14, maxRang: 3 },
            { name: 'Herr der Elemente', minStufe: 10, maxRang: 5 },
            { name: 'Knechtschaft', minStufe: 16, maxRang: 5 },
            { name: 'Mächtige Herbeirufung', minStufe: 16, maxRang: 3 },
            { name: 'Schutz vor Elementen', minStufe: 10, maxRang: 5 },
            { name: 'Schütze', minStufe: 16, maxRang: 5 },
            { name: 'Verheerer', minStufe: 12, maxRang: 5 },
            { name: 'Zaubermacht', minStufe: 10, maxRang: 5 }
        ]
    },
    'Erzmagier': {
        basisklasse: 'zauberer',
        minStufe: 10,
        voraussetzung: 'Zauberer der Stufe 10+',
        beschreibung: 'Verfügen über umfangreiches magisches Wissen; ihr Können umfasst eine breite Palette arkaner Fähigkeiten.',
        talente: [
            { name: 'Abklingen', minStufe: 10, maxRang: 10 },
            { name: 'Alchemie', minStufe: 10, maxRang: 10 },
            { name: 'Arkane Explosion', minStufe: 12, maxRang: 5 },
            { name: 'Bändiger', minStufe: 16, maxRang: 3 },
            { name: 'Beschwörer', minStufe: 16, maxRang: 3 },
            { name: 'Diener der Dunkelheit', minStufe: 10, maxRang: 5 },
            { name: 'Diener des Lichts', minStufe: 10, maxRang: 5 },
            { name: 'Einbetten', minStufe: 10, maxRang: 10 },
            { name: 'Elementen trotzen', minStufe: 16, maxRang: 5 },
            { name: 'Explosionskontrolle', minStufe: 16, maxRang: 5 },
            { name: 'Homunkulus', minStufe: 14, maxRang: 3 },
            { name: 'Magieresistent', minStufe: 10, maxRang: 5 },
            { name: 'Manipulator', minStufe: 12, maxRang: 5 },
            { name: 'Runenkunde', minStufe: 10, maxRang: 10 },
            { name: 'Stabbindung', minStufe: 12, maxRang: 5 },
            { name: 'Teufelchen', minStufe: 12, maxRang: 3 },
            { name: 'Umdenken', minStufe: 10, maxRang: 10 },
            { name: 'Untote Horden', minStufe: 16, maxRang: 5 },
            { name: 'Vertrautenband', minStufe: 14, maxRang: 3 },
            { name: 'Wechsler', minStufe: 10, maxRang: 10 },
            { name: 'Zaubermacht', minStufe: 10, maxRang: 5 },
            { name: 'Zauberroutine', minStufe: 16, maxRang: 3 }
        ]
    },
    'Kriegszauberer': {
        basisklasse: 'zauberer',
        minStufe: 10,
        voraussetzung: 'Zauberer der Stufe 10+',
        beschreibung: 'Begeben sich mit Schwert und Magie in die Schlacht.',
        talente: [
            { name: 'Blitzmacher', minStufe: 12, maxRang: 5 },
            { name: 'Blocker', minStufe: 10, maxRang: 5 },
            { name: 'Brutaler Hieb', minStufe: 16, maxRang: 3 },
            { name: 'Diener der Dunkelheit', minStufe: 10, maxRang: 5 },
            { name: 'Diener des Lichts', minStufe: 10, maxRang: 5 },
            { name: 'Elementen trotzen', minStufe: 14, maxRang: 5 },
            { name: 'Explosionskontrolle', minStufe: 10, maxRang: 5 },
            { name: 'Feuermagier', minStufe: 12, maxRang: 5 },
            { name: 'Gerüstet', minStufe: 10, maxRang: 3 },
            { name: 'Herr der Elemente', minStufe: 14, maxRang: 5 },
            { name: 'Kämpfer', minStufe: 12, maxRang: 5 },
            { name: 'Parade', minStufe: 10, maxRang: 5 },
            { name: 'Rüstträger', minStufe: 10, maxRang: 5 },
            { name: 'Rüstzauberer', minStufe: 10, maxRang: 3 },
            { name: 'Scharfschütze', minStufe: 10, maxRang: 5 },
            { name: 'Schnelle Reflexe', minStufe: 10, maxRang: 5 },
            { name: 'Schutz vor Elementen', minStufe: 14, maxRang: 5 },
            { name: 'Schütze', minStufe: 10, maxRang: 5 },
            { name: 'Verheerer', minStufe: 10, maxRang: 5 },
            { name: 'Verletzen', minStufe: 16, maxRang: 5 },
            { name: 'Waffenkenner', minStufe: 10, maxRang: 3 },
            { name: 'Zaubermacht', minStufe: 10, maxRang: 5 },
            { name: 'Zauberwaffe', minStufe: 12, maxRang: 3 }
        ]
    },
    'Blutmagier': {
        basisklasse: 'schwarzmagier',
        minStufe: 10,
        voraussetzung: 'Schwarzmagier der Stufe 10+',
        beschreibung: 'Verstärken ihre Magie mit der Kraft des eigenen Blutes; der Preis sind innere Verletzungen, die an ihrer Lebenskraft zehren.',
        talente: [
            { name: 'Abklingendes Blut', minStufe: 12, maxRang: 5 },
            { name: 'Blutige Heilung', minStufe: 12, maxRang: 3 },
            { name: 'Blutschild', minStufe: 10, maxRang: 5 },
            { name: 'Einstecker', minStufe: 10, maxRang: 5 },
            { name: 'Macht des Blutes', minStufe: 14, maxRang: 3 },
            { name: 'Ritual der Narben', minStufe: 10, maxRang: 3 },
            { name: 'Schmerzhafter Wechsel', minStufe: 12, maxRang: 3 },
            { name: 'Zauberqual', minStufe: 10, maxRang: 3 },
            { name: 'Zehrender Spurt', minStufe: 10, maxRang: 3 }
        ]
    },
    'Dämonologe': {
        basisklasse: 'schwarzmagier',
        minStufe: 10,
        voraussetzung: 'Schwarzmagier der Stufe 10+',
        beschreibung: 'Spezialisiert auf das Beschwören und Kontrollieren mächtiger Dämonen.',
        talente: [
            { name: 'Bändiger', minStufe: 10, maxRang: 3 },
            { name: 'Beschwörer', minStufe: 10, maxRang: 5 },
            { name: 'Dämonenbrut', minStufe: 16, maxRang: 3 },
            { name: 'Dämonenzauber', minStufe: 16, maxRang: 3 },
            { name: 'Knechtschaft', minStufe: 16, maxRang: 5 },
            { name: 'Kreiszeichner', minStufe: 12, maxRang: 3 },
            { name: 'Mächtige Beschwörung', minStufe: 16, maxRang: 3 },
            { name: 'Ritual der Narben', minStufe: 12, maxRang: 3 },
            { name: 'Teufelchen', minStufe: 10, maxRang: 3 },
            { name: 'Unersättliches Beschwören', minStufe: 14, maxRang: 3 }
        ]
    },
    'Nekromant': {
        basisklasse: 'schwarzmagier',
        minStufe: 10,
        voraussetzung: 'Schwarzmagier der Stufe 10+',
        beschreibung: 'Spezialisiert auf das Erwecken und Kontrollieren von Untoten.',
        talente: [
            { name: 'Mächtige Erweckung', minStufe: 16, maxRang: 3 },
            { name: 'Nekromantie', minStufe: 10, maxRang: 5 },
            { name: 'Ritual der Narben', minStufe: 14, maxRang: 3 },
            { name: 'Sensenspötter', minStufe: 16, maxRang: 3 },
            { name: 'Todeskraft', minStufe: 10, maxRang: 5 },
            { name: 'Totenrufer', minStufe: 12, maxRang: 5 },
            { name: 'Untote Horden', minStufe: 10, maxRang: 10 }
        ]
    }
};

// ---------------------------------------------------------------------------
// DS4_VOLKSFAEHIGKEITEN — PDF S. 13 (Buch S. 3); Sichtregeln PDF S. 93 (Buch S. 83)
// ---------------------------------------------------------------------------

const DS4_VOLKSFAEHIGKEITEN = {
    elf: [
        {
            name: 'Leichtfüßig',
            effekt: 'Bonus von +2 auf Schleichen-Proben (AGI+BE). Bestätigt PDF S. 93/95.',
            bonus: { probe: 'Schleichen', wert: 2 }
        },
        {
            name: 'Nachtsicht',
            effekt: 'Sieht bei einem Mindestmaß an Licht (z.B. sternenklarer Himmel) wie am helllichten Tag; in völliger Finsternis (stockfinster) jedoch 0m Sichtweite.',
            sichtweite: { kaumLicht: 'wie am Tag', stockfinster: '0m' }
        },
        {
            name: 'Unsterblich',
            effekt: 'Altert ab dem Erwachsenwerden kaum noch; stirbt nur durch Gewalteinwirkung.'
        }
    ],
    mensch: [
        {
            name: '1 Talentpunkt gratis',
            effekt: 'Menschen erhalten statt besonderer Volksfähigkeiten einen zusätzlichen Talentpunkt und starten damit auf Stufe 1 mit 2 TP statt 1 TP.',
            bonus: { tp: 1 }
        }
    ],
    zwerg: [
        {
            name: 'Dunkelsicht',
            effekt: 'Kann selbst in völliger Finsternis noch sehen (Sichtweite 50m im Stockfinsteren, bei kaum Licht wie am Tag).',
            sichtweite: { kaumLicht: 'wie am Tag', stockfinster: '50m' }
        },
        {
            name: 'Langlebig',
            effekt: 'Der Alterungsprozess verlangsamt sich, sobald der Zwerg erwachsen ist.'
        },
        {
            name: 'Zäh',
            effekt: 'Abwehr +1.',
            bonus: { abwehr: 1 }
        }
    ]
};

// Referenz: Sichtweiten je Volk (PDF S. 93 / Buch S. 83)
const DS4_SICHTWEITEN = {
    elf: { kaumLicht: 'wie am Tag', stockfinster: '0m' },
    mensch: { kaumLicht: '10m', stockfinster: '0m' },
    zwerg: { kaumLicht: 'wie am Tag', stockfinster: '50m' }
};

// ---------------------------------------------------------------------------
// DS4_TALENT_REGELN — Erwerbs- und Validierungsregeln (PDF S. 19 & 27, Buch S. 9 & 17)
// ---------------------------------------------------------------------------

const DS4_TALENT_REGELN = {
    tpProStufe: 1,
    tpBeiErschaffung: { standard: 1, mensch: 2 },
    tpKostenProRang: 1,
    tpAnsparbar: true,
    raengeSequenziell: true,   // Ränge werden aufsteigend erworben (I, dann II, ...);
                               // bei genug gesparten TP auch mehrere auf einmal
    mehrereRaengeAufEinmal: true,
    lpKaufTp: 3,               // 1 zusätzlicher TP kostet 3 LP (alle Klassen, PDF S. 18)
    hinweise: [
        'Ein Talent kann nur von den ausdrücklich gelisteten Klassen erlernt werden — nicht gelistete Klassen können es gar nicht lernen (PDF S. 19).',
        'Die Stufenvoraussetzung ist klassenabhängig: dasselbe Talent kann für Krieger ab Stufe 4, für Späher ab Stufe 1 zugänglich sein.',
        'Der Höchstrang (I-X) ist ebenfalls klassenabhängig und wird NICHT durch die Charakterstufe begrenzt — nur durch den maxRang-Eintrag und die verfügbaren TP.',
        'Effekte der Ränge summieren sich (PDF S. 19).',
        'Heldenklassen behalten den vollen Talentzugang ihrer Grundklasse, auch für Talente, die erst auf höheren Stufen freigeschaltet werden (PDF S. 20). Zusätzlich erhalten sie ihre eigene Talentliste, oft mit höheren Höchsträngen.',
        'Ist ein Talent sowohl über die Grundklasse als auch über die Heldenklasse zugänglich, gilt der jeweils günstigste Wert: niedrigste minStufe für den Zugang, höchster maxRang als Obergrenze.',
        'Handwerk, Instrument und Wissensgebiet werden pro Gebiet/Handwerk/Instrument separat erlernt und können daher mehrfach bis je Höchstrang III erworben werden.',
        'Waffenkenner gilt je Rang einer anderen Waffenart und kann für dieselbe Waffenart nicht mehrfach erworben werden (dafür Perfektion).',
        'Talente mit zusätzlichen Voraussetzungen: Sattelschütze benötigt mindestens 1 Rang in Reiten; Perfektion benötigt Waffenkenner für die betreffende Waffenart; Rundumschlag beim Kampfmönch benötigt Waffenloser Meister (Rang nie höher); Meucheln wirkt nur über Hinterhältiger Angriff; Vergeltung skaliert über Diener der Dunkelheit/des Lichts; Vertrautenband setzt einen Vertrauten voraus.',
        'Gegenseitiger Ausschluss: Diener des Lichts und Diener der Dunkelheit schließen einander aus.',
        'Settingoption: In vielen Settings können Zwerge das Talent Charmant nicht erlernen.',
        'Es gibt KEINE Talente mit einer Mindest-Eigenschaft als Voraussetzung.',
        'Beim Wechsel in eine Heldenklasse (ab Stufe 10, einmalig und endgültig) gehen keine bereits erworbenen Talente/Ränge verloren. Reichen die EP für die bisherige Stufe auf der Heldenklassen-EP-Tabelle nicht, sinkt die Stufe entsprechend; bereits erhaltene LP/TP bleiben, werden beim erneuten Erreichen der Stufe aber nicht nochmals vergeben (PDF S. 20).'
    ]
};

// ---------------------------------------------------------------------------
// Hilfsfunktionen für die Validierung
// ---------------------------------------------------------------------------

/**
 * Liefert { erlaubt, minStufe, maxRang, quellen } für ein Talent und einen Charakter.
 * @param {string} talentName
 * @param {string} klasse          'krieger' | 'spaeher' | 'heiler' | 'zauberer' | 'schwarzmagier'
 * @param {string|null} heldenklasse  z.B. 'Paladin' oder null
 */
function ds4TalentZugang(talentName, klasse, heldenklasse) {
    const talent = DS4_TALENTS.find(function (t) { return t.name === talentName; });
    if (!talent) return { erlaubt: false, minStufe: null, maxRang: 0, quellen: [] };

    const quellen = [];
    (talent.access || []).forEach(function (a) {
        if (a.klasse === klasse) quellen.push({ von: klasse, minStufe: a.minStufe, maxRang: a.maxRang });
    });
    if (heldenklasse) {
        (talent.heldenZugang || []).forEach(function (h) {
            if (h.heldenklasse === heldenklasse) {
                quellen.push({ von: heldenklasse, minStufe: h.minStufe, maxRang: h.maxRang });
            }
        });
    }
    if (!quellen.length) return { erlaubt: false, minStufe: null, maxRang: 0, quellen: [] };

    return {
        erlaubt: true,
        minStufe: Math.min.apply(null, quellen.map(function (q) { return q.minStufe; })),
        maxRang: Math.max.apply(null, quellen.map(function (q) { return q.maxRang; })),
        quellen: quellen
    };
}

/** Prüft, ob ein Charakter das Talent auf den gewünschten Rang bringen darf. */
function ds4TalentPruefen(talentName, klasse, heldenklasse, stufe, gewuenschterRang) {
    const z = ds4TalentZugang(talentName, klasse, heldenklasse);
    if (!z.erlaubt) return { ok: false, grund: 'Klasse hat keinen Zugang zu diesem Talent.' };
    if (stufe < z.minStufe) return { ok: false, grund: 'Stufe ' + z.minStufe + ' erforderlich.' };
    if (gewuenschterRang > z.maxRang) return { ok: false, grund: 'Höchstrang ist ' + z.maxRang + '.' };
    if (gewuenschterRang < 1) return { ok: false, grund: 'Rang muss mindestens 1 sein.' };
    return { ok: true, maxRang: z.maxRang, tpKosten: gewuenschterRang * DS4_TALENT_REGELN.tpKostenProRang };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DS4_CLASS_CODES,
        DS4_HELDENKLASSE_CODES,
        DS4_RANG_ROEMISCH,
        DS4_TALENTS,
        DS4_HELDENKLASSEN,
        DS4_VOLKSFAEHIGKEITEN,
        DS4_SICHTWEITEN,
        DS4_TALENT_REGELN,
        ds4TalentZugang,
        ds4TalentPruefen
    };
}
