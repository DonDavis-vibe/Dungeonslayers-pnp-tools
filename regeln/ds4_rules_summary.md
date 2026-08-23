# Dungeonslayers 4 (DS4) — Rules Reference for Digital Character Sheet / GM Tool

Source: `Dungeonslayers4.pdf` (172 pages). Page numbers below are given as **PDF page / printed book page** (the book's own page numbers start at "1" on PDF page 11, i.e. `PDF page = book page + 10`, until the back matter where numbering schemes change — always double‑check against the PDF page count if citing pages beyond the core rules, roughly PDF p. 120+).

Table of contents used to navigate (PDF p. 7):
```
1. CHARAKTERE           p.1   (PDF 11)   – Attribute & Eigenschaften p.1, Kampfwerte p.2,
                                            Charaktererschaffung p.3, Erfahrung p.8, Heldenklassen p.10
2. TALENTE               p.17  (PDF 27)
3. REGELN                p.38  (PDF 48)  – Proben p.38, Kampf p.40, Schaden & Heilung p.42,
                                            Kampfdetails p.43, Optionale Kampfregeln p.45, Magie p.46
4. ZAUBERSPRÜCHE         p.48  (PDF 58)  – Liste der Zaubersprüche p.50
5. AUSRÜSTUNG            p.78  (PDF 88)
6. SPIELLEITUNG          p.81  (PDF 91)  – incl. Bestiarium p.104
7. ABENTEUER / 8. CAERA / ANHÄNGE  p.126+ (adventure modules, setting fluff, loot tables, monster minis rules — not needed for a character sheet tool)
```

---

## 1. Core Dice Mechanic (Proben) — PDF p. 48–50 / book p. 38–40

**Die used: one W20 (d20).**

- A **Probenwert (PW)** = one **Attribut** + one matching **Eigenschaft** (e.g. Körper + Stärke), plus any applicable **Talent** bonus and situational modifier.
- Roll 1d20. **Success = rolled value ≤ PW.** (Roll-under system, not roll-and-add-vs-target.)
- Combat "checks" (Schlagen, Schießen, Zaubern, Zielzauber, Abwehr) work exactly the same way — they're just Kampfwerte used as the PW.

### Modifiers (situational, book p. 39 / PDF 49)
| Difficulty | Modifier |
|---|---|
| Routine | +8 |
| Sehr leicht | +4 |
| Leicht | +2 |
| Normal | +0 |
| Schwer | −2 |
| Sehr schwer | −4 |
| Äußerst schwer | −8 |

### Critical success / failure
- **Immersieg (critical success):** rolling a natural **1** is *always* a success, regardless of modifiers, and counts as the **best possible result** for that roll (i.e., treat the roll as if it equaled the full PW — for damage-relevant rolls like Schlagen/Schießen/Zielzauber this means max damage for that attack).
- **Patzer (fumble):** rolling a natural **20** is *always* a failure, regardless of modifiers. If a PW is 20 or higher, the probe can now *only* fail via a Patzer (natural 20).
- **PW over 20:** if the computed PW exceeds 20, the check is split into multiple W20 rolls: roll once at PW 20, then again at (PW − 20), etc., until the remainder is used up. Only the **first** die rolled can Patzer (a 20 on later dice in the same probe is not a fumble). All successful sub-roll results are summed for the final result (relevant for damage). If any sub-roll is an Immersieg (natural 1), you may keep rolling again for that sub-roll (see Combat below).
- **Vergleichende Proben (opposed checks):** both sides roll their own PW; if only one succeeds, they win; if both succeed, higher raw result wins (Immersieg still counts as an auto-max result); if both fail, no result is set... unless required, then reroll.

### Combat critical rules (Kampfpatzer, book p.43 / PDF 53)
A Patzer (fumble) in combat has an extra consequence beyond just failing:
| Failed check | Result |
|---|---|
| Abwehr | Character falls prone |
| Schlagen | Weapon dropped (non-magical wooden weapon breaks) |
| Schießen | Weapon dropped (non-magical wooden ranged weapon/ammo breaks) |
| Zaubern | Active spell "jumps out" — no longer active |
| Zielzauber | (as Zaubern) |

### Optional rule — Slayende Würfel (exploding crits, PDF p.55 / book 45)
Optional variant: on an Immersieg (crit) on an **attack roll**, the attacker immediately rolls a second attack; if that also succeeds, its damage is added to the first; a second Immersieg triggers a third roll, etc. (Patzers stop the chain.) Same applies to Abwehr rolls. Recommended only alongside the optional Slayerpunkte below.

### Optional rule — Slayerpunkte (PDF p.55 / book 45)
Each round you deal damage to an enemy, or heal a wounded ally, you gain 1 Slayerpunkt (SP), max 3 stored at once, lost when combat ends or you're knocked unconscious. Spend SP for free actions/bonuses, e.g.: 1 SP = ignore 2 damage / +3 Abwehr / +1m Laufen; 2 SP = ignore 6 damage / +8 Abwehr / +2 to an attack roll / reroll a failed attack; 3 SP = a second attack this round / ignore 9 damage / +12 Abwehr. (Full table on PDF p.55 if needed later.)

---

## 2. Attributes & Eigenschaften (Attributes/Traits) — PDF p. 11–12 / book p. 1–2

DS4 has **9 core values**: 3 Attribute (broad stats) each governing 2 Eigenschaften (finer traits) = 6 Eigenschaften total. Everything else (Kampfwerte) is derived from these plus equipment.

| Attribut | Abbrev. | Governs | Represents |
|---|---|---|---|
| Körper (Body) | KÖR | Stärke, Härte | Fitness/toughness of build |
| Agilität (Agility) | AGI | Bewegung, Geschick | Athleticism/speed |
| Geist (Mind) | GEI | Verstand, Aura | Intelligence, magical aptitude, social influence |

| Eigenschaft | Abbrev. | Parent Attribut | Represents |
|---|---|---|---|
| Stärke (Strength) | ST | Körper | Melee power/damage |
| Härte (Toughness) | HÄ | Körper | Resisting damage/disease/poison |
| Bewegung (Movement) | BE | Agilität | Reflexes/athletics, feeds Initiative & Laufen |
| Geschick (Dexterity) | GE | Agilität | Precision, ranged accuracy, fine motor tasks |
| Verstand (Intellect) | VE | Geist | Cleverness, spell power |
| Aura | AU | Geist | Presence/charisma, spellcasting power |

- Attributes start at **4–8** during creation and rarely change afterward.
- Eigenschaften can be improved during play via Lernpunkte (LP, see §5).
- Absolute max **base** value for any Eigenschaft is **12** (before racial/class bonus adjustments — see §5 "Eigenschaftshöchstwerte").

### Kampfwerte (derived combat stats) — PDF p. 12 / book p. 2
| Kampfwert | Formula | Use |
|---|---|---|
| Lebenskraft (LK) — Hit Points | KÖR + HÄ + 10 | HP pool; unconscious/death threshold |
| Abwehr (Defense) | KÖR + HÄ + PA | Passive defense roll vs. incoming damage |
| Initiative | AGI + BE | Turn order in combat (weapons/armor can modify) |
| Laufen (Move speed, meters) | AGI/2 + 1 | Max meters moved per round |
| Schlagen (Melee attack) | KÖR + ST + WB | Melee attack roll (WB = weapon bonus of melee weapon) |
| Schießen (Ranged attack) | AGI + GE + WB | Ranged attack roll (WB = weapon bonus of ranged weapon) |
| Zaubern (Cast, untargeted) | GEI + AU + ZB − PA | Non-targeted spell check (ZB = spell's Zauberbonus; PA from non-cloth armor subtracts) |
| Zielzauber (Cast, targeted) | GEI + GE + ZB − PA | Targeted/attack spell check |

*(WB = Waffenbonus from the equipped weapon; PA = Panzerungswert/armor value from equipped armor; ZB = Zauberbonus of the specific spell being cast, can be negative.)*

---

## 3. Races (Rassen/Völker) — PDF p. 13 / book p. 3

Three playable Völker (race choice is Setting-dependent). Each grants: a choice of **Eigenschaft bonus** (used in step 5 of character creation) + fixed **Volksfähigkeiten** (racial traits).

| Volk | Volksbonus (choose one) | Volksfähigkeiten (racial traits) |
|---|---|---|
| **Elf** | BE, GE, or AU +1 | Leichtfüßig (+2 to Schleichen/Sneak), Nachtsicht (Night vision), Unsterblich (near-immortal aging; dies only by violence) |
| **Mensch (Human)** | any one Eigenschaft +1 | +1 free Talentpunkt (instead of a special trait) — humans start with **2 TP** total instead of 1 |
| **Zwerg (Dwarf)** | ST, HÄ, or GE +1 | Dunkelsicht (Darkvision), Langlebig (slowed aging once adult), Zäh (Abwehr +1) |

Equipment note: Zwerge cannot use Bihänder (greatswords), Schlachtbeile (battleaxes), Langbögen or Elfenbögen (longbows/elven bows) — too unwieldy for their size.

---

## 4. Classes (Klassen) — PDF p. 13–16 / book p. 3–6, plus Heldenklassen PDF p. 20–26 / book p. 10–16

### Base classes (chosen at level 1) — one of three:
| Klasse | Role | Klassenbonus (choose one) | Armor access | Notes |
|---|---|---|---|---|
| **Krieger** (Warrior) | Melee frontline | ST or HÄ +1 | All armor types incl. Platte | Heaviest weapons/armor |
| **Späher** (Scout) | Ranged/skirmish/stealth | BE or GE +1 | Stoff/Leder/Kette, no Platte | Bow/crossbow specialists |
| **Zauberwirker** (Spellcaster) | Magic — subdivided into: | VE or AU +1 | Stoff (cloth) only for Zauberer/Schwarzmagier; Heiler may also wear Leder | Must pick a subtype: |

Zauberwirker subtypes (chosen at creation, determines available spell list):
- **Heiler** (Healer) — mostly defensive/healing spells
- **Zauberer** (Mage) — offensive + defensive spells
- **Schwarzmagier** (Warlock) — mostly offensive spells

There is no separate "mana pool" resource — spellcasting is gated by the **Zaubern/Zielzauber check succeeding** plus a per-spell **Abklingzeit (cooldown)**, not by points spent (see §8 Magie). A caster can only have ONE spell "active/prepared" at a time (switchable via a GEI+VE check as an action), which functionally serves as the resource-management layer instead of mana.

### Armor-by-class table (PDF p. 51 / book p. 41)
| Klasse | Stoff | Leder | Kette | Platte | Helme | Schienen | Schilde |
|---|---|---|---|---|---|---|---|
| Krieger | Ja | Ja | Ja | Ja | Ja | Alle | Alle |
| Späher | Ja | Ja | Ja | Nein | Ja | Alle | Alle |
| Heiler | Ja | Ja | Nein | Nein | Nein | Leder only | Alle |
| Zauberer | Ja | Nein | Nein | Nein | Nein | Nein | Alle |
| Schwarzmagier | Ja | Nein | Nein | Nein | Nein | Nein | Alle |

Wearing armor your class isn't permitted has a penalty: PA malus to Zaubern/Zielzauber ×4, and Agilität reduced by the armor's PA value.

### Heldenklassen (Hero/Prestige classes) — PDF p. 20–26 / book p. 10–16
Available **starting at level 10**, once per character, permanent/irreversible choice. Grants access to new + higher-rank talents while keeping all old class talent access. Uses a steeper XP table past lvl 10 (see §5). 15 total, 5 per base class lineage:

| Base class | Heldenklassen |
|---|---|
| Krieger | Berserker, Paladin, Waffenmeister |
| Späher | Attentäter, Meisterdieb, Waldläufer |
| Heiler | Druide, Kampfmönch, Kleriker |
| Zauberer | Elementarist, Erzmagier, Kriegszauberer |
| Schwarzmagier | Blutmagier, Dämonologe, Nekromant |

Each Heldenklasse lists its own prerequisite (base class + level 10+, some also require "Ordensmitgliedschaft" — order membership, an RP gate) and its own talent-access table (talent name, level requirement, max rank in Roman numerals). Full talent lists per Heldenklasse are on PDF p.21–26 — not reproduced here in full (~5–15 talents each) since these are large tables best kept as reference data rather than summarized prose; pull directly from those pages when building the talent picker.

---

## 5. Character Creation (Charaktererschaffung) — PDF p. 13–17 / book p. 3–7

Full step-by-step process (worked example throughout uses an Elf Zauberer):

**1. Volk wählen (choose race)** — Elf/Mensch/Zwerg (§3). Note the chosen Volksbonus Eigenschaft and Volksfähigkeiten for step 5.

**2. Klasse wählen (choose class)** — Krieger/Späher/Zauberwirker (+ subtype if caster) (§4). Note Klassenbonus Eigenschaft.

**3. Attribute festlegen (assign Attributes)** — Distribute **20 points** across Körper, Agilität, Geist. **No single Attribut may exceed 8.**

**4. Eigenschaften festlegen (assign Traits)** — Distribute **8 points** across the six Eigenschaften (Stärke, Härte, Bewegung, Geschick, Verstand, Aura). Values of 0 are allowed. **No Eigenschaft may exceed 4 at this stage.**

**5. Volks- & Klassenbonus (apply race + class bonuses)** — Apply the previously-chosen racial Eigenschaft bonus (+1) and class Eigenschaft bonus (+1) — this is the point where Eigenschaften can first exceed 4.

**6. Der erste Zauberspruch (first spell, casters only)** — Zauberwirker learn one level‑1 spell from their subtype's list (Heiler/Zauberer/Schwarzmagier spell lists differ, see §8/§ full spell list PDF p.58+).

**7. Ausrüstung (starting equipment)** — Every character starts with: simple clothing, flint & tinder (Feuerstein & Zunder), a waterskin, 2x Heilkraut (healing herb), a blanket, and a backpack/carrying bag — **plus 10 Goldmünzen (GM)** to spend on gear from the price lists (starting PDF p.88 / book p.78, see §7 equipment tables below).

**8. Kampfwerte (compute derived combat stats)** — Calculate Lebenskraft, Abwehr, Initiative, Laufen, Schlagen, Schießen, Zaubern, Zielzauber per the formulas in §2, now incorporating equipped weapon WB / armor PA / spell ZB.

**9. Talent wählen (choose starting talent)** — Character receives **1 Talentpunkt (TP)** (Menschen get 2 TP total, due to their racial bonus). Spend to buy a rank-1 talent from the eligible list for your class (talents cost 1 TP per rank; see §6).

**10. Letzte Schliffe (final touches)** — Determine gender and name. Character knows their native tongue automatically + one bonus language/Schriftzeichen (script) — GEI 6+ characters automatically know the written scripts of all spoken languages. Record: Stufe 1, 0 Erfahrungspunkte (EP), current LP/TP. Optional roleplay background questions (origin, beliefs, motivations).

### Experience & Leveling (Erfahrung) — PDF p. 18–19 / book p. 8–9

- **20 levels (Stufen) total.**
- Characters gain **Erfahrungspunkte (EP)** for defeating enemies, solving tasks, completing adventures.
- **Every level-up grants +2 Lernpunkte (LP) and +1 Talentpunkt (TP).**
- At **level 10**, a character may switch into a Heldenklasse (once, permanent) — see §4.

**Full XP table** (PDF p.18 / book p.8):

| Stufe | EP (normal track) | EP (Heldenklasse track) | LP/level | TP/level |
|---|---|---|---|---|
| 1 | 0 | – | – | 1 (2 for Mensch) |
| 2 | 100 | – | +2 | +1 |
| 3 | 300 | – | +2 | +1 |
| 4 | 600 | – | +2 | +1 |
| 5 | 1,000 | – | +2 | +1 |
| 6 | 1,500 | – | +2 | +1 |
| 7 | 2,100 | – | +2 | +1 |
| 8 | 2,800 | – | +2 | +1 |
| 9 | 3,600 | – | +2 | +1 |
| 10 | 4,500 | – | +2 | +1 |
| 11 | 5,500 | 6,000 | +2 | +1 |
| 12 | 6,600 | 7,600 | +2 | +1 |
| 13 | 7,800 | 9,300 | +2 | +1 |
| 14 | 9,100 | 11,100 | +2 | +1 |
| 15 | 10,500 | 13,000 | +2 | +1 |
| 16 | 12,000 | 15,000 | +2 | +1 |
| 17 | 13,700 | 17,200 | +2 | +1 |
| 18 | 15,600 | 19,600 | +2 | +1 |
| 19 | 17,700 | 22,200 | +2 | +1 |
| 20 | 20,000 | 25,000 | +2 | +1 |

*"Heldenklasse track" applies once a character has switched into a Heldenklasse (from level 11 on it costs more EP per level than staying in a base class). If a character switches into a Heldenklasse without enough EP to match their current level on the new track, their effective level is reduced accordingly; already-banked LP/TP are kept but not retroactively re-granted.*

### Spending Lernpunkte (LP) — improve Eigenschaften/LK/TP
Cost in LP to raise a stat by +1, by class (PDF p.18):

| Klasse | ST | HÄ | BE | GE | VE | AU | LK | TP (buy via LP) |
|---|---|---|---|---|---|---|---|---|
| Krieger | 2 | 2 | 3 | 3 | 3 | 3 | 1 | 3 |
| Späher | 3 | 3 | 2 | 2 | 3 | 3 | 1 | 3 |
| Zauberwirker | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 |

(Each payment = +1 to that Eigenschaft/LK/TP. Alternatively, 1 LP can buy a new language or script instead.)

### Eigenschaftshöchstwerte (Trait caps) — PDF p. 19 / book p. 9
Max **base** value per Eigenschaft = **12**, further modified (+1 to relevant stats' cap) by race and class:
- Race: Elf → Bewegung/Geschick/Aura +1 to cap; Mensch → 2 arbitrary Eigenschaften +1 to cap OR 1 Eigenschaft +2; Zwerg → Stärke/Härte/Geschick +1 to cap.
- Class: Krieger → Stärke & Härte +1 to cap; Späher → Bewegung & Geschick +1 to cap; Zauberwirker → Verstand & Aura +1 to cap.

### Talentpunkte (spending on Talents) — PDF p. 19 / book p. 9
- +1 TP per level (+1 extra at creation for Menschen).
- Talents have per-class level prerequisites and a max rank (I–X). Each rank costs 1 TP; ranks can be bought incrementally or all at once if enough TP saved.

### Learning new spells at level-up — PDF p. 19 / book p. 9
- Doesn't cost LP or TP — only requires the caster to have access to the spell (find/buy/learn it in-world, and it must be on their subtype's spell list at their new level or lower).
- Per level gained, a caster may learn a number of new spells whose **spell-levels sum to their new character level** (e.g., level 4 → learn four 1st-level spells, or two 2nd-level, or one 1st+one 3rd, or a single 4th-level spell).
- Learning takes **1 hour per spell level**.
- Once learned from a scroll/book, the spell is "used up" — can't be passed to another caster.

---

## 6. Skills / Talents (Talente) — PDF p. 17, 27–47 / book p. 17, 27–47 (spans ~20 pages)

DS4 does **not** have a separate "skills" list distinct from Attribut+Eigenschaft checks — ordinary skill checks (Proben) are just Attribut+Eigenschaft rolls (see the "typische Proben" table below). **Talente** are the closer analogue to "feats/perks": purchasable bonuses layered on top of checks or granting new abilities.

### Talent mechanics
- Cost: **1 Talentpunkt (TP) per rank**.
- Each talent lists **class(es) + minimum level** required, and a **max rank** in Roman numerals (I–X) — e.g. "Krieger 4 (III)" = Krieger can learn it from level 4, up to rank III.
- Effects **stack** per rank (e.g., Wahrnehmung gives +2 per rank to a Bemerken check).
- Heldenklassen retain access to all their base class's talents (old and new) in addition to Heldenklasse-exclusive talents.
- TP can be banked/saved and multiple ranks bought at once.

### Typische Proben (example standard skill checks & their Attribut+Eigenschaft) — PDF p. 48 / book p.38
| Check (German) | Formula |
|---|---|
| Bemerken (Notice/Perception) | GEI+VE (or 8, whichever higher*) |
| Erwachen (Waking up) | GEI+VE |
| Fallen entschärfen (Disarm trap) | GEI+GE |
| Feilschen (Haggle) | GEI+VE or +AU* |
| Feuer machen (Make fire) | GEI+GE |
| Flirten | GEI+AU |
| Gift trotzen (Resist poison) | KÖR+HÄ |
| Inschrift entziffern (Decipher) | GEI+VE |
| Klettern (Climb) | AGI+ST |
| Kraftakt (Feat of strength) | KÖR+ST |
| Krankheit trotzen (Resist disease) | KÖR+HÄ |
| Mechanismus öffnen | GEI+GE or +VE* |
| Reiten (Ride) | AGI+BE or +AU* |
| Schätzen (Appraise) | GEI+VE |
| Schleichen (Sneak) | AGI+BE |
| Schlösser öffnen (Pick locks) | GEI+GE |
| Schwimmen (Swim) | AGI+ST |
| Springen (Jump) | AGI+BE |
| Spuren lesen (Track) | GEI+VE |
| Suchen (Search) | GEI+VE (or 8*) |
| Taschendiebstahl (Pickpocket) | AGI+GE |
| Verbergen (Hide) | AGI+BE |
| Verständigen (Communicate) | GEI+GE |
| Wissen (Knowledge) | GEI+VE |

*: use the higher of the listed Eigenschaften/flat value. (More detailed rules for these specific checks are given later, book p.89+.)

### Talent list scope
- Base-class talent pools (Krieger / Späher / all Zauberwirker / Heiler-only / Zauberer-only / Schwarzmagier-only) are large tables of names + level + max rank on PDF p.28–29 (book p.18–19) — roughly **60–70 base-class talents** across the three classes, plus each of the 15 Heldenklassen has its own 5–15 talent list (PDF p.21–26).
- Full talent **descriptions** (mechanical text for each talent, alphabetically ordered) run PDF p.27–47 (book p.17–37) — this is reference data best imported as a structured table (name → prerequisites → rank max → per-rank effect text) rather than summarized here; there are well over 100 distinct talents total.
- Example format confirmed from source: `TALENTNAME` / `KLASSE-code level (max-rank-roman)[, more class reqs...]` / effect description paragraph.

---

## 7. Combat Basics (Kampf) — PDF p. 50–55 / book p. 40–45

### Round structure
- Kampfrunde (combat round) = **5 seconds**.
- Turn order = descending **Initiative** (AGI+BE, minus armor/weapon penalties). Ties broken by a one-time W20 "Stechen" roll for the whole fight.
- Ambush: the ambushing side gets **+10 Initiative** for the first round only.
- On your turn: you may **move** up to your Laufen value (in meters) and perform **one Aktion** (attack, cast, etc.) — movement can be split before/after the action but the action itself can't be interrupted mid-move. Unused actions don't carry over.
- "Aktionsfrei" = doesn't consume your action (e.g., picking up a dropped weapon while standing, in some cases).

### Attack & Defense
- Attack rolls: **Schlagen** (melee), **Schießen** (ranged), **Zielzauber** (targeted spell) — roll d20 vs. your computed attack value (see §2 formulas); success = hit.
- **Damage = the number you rolled** on a successful attack (not a separate damage die!). E.g. rolling a 9 against your own Schlagen value of 12 deals 9 damage before defense.
- Immersieg (natural 1) on an attack = automatic hit for **maximum possible damage** (i.e. equal to your full attack value, or per the >20 multi-roll rule if attack value > 20).
- **Abwehr (Defense) is itself an automatic Probe** the defender rolls whenever they take damage (not an action) — formula KÖR+HÄ+PA. On a success, damage is **reduced by the Abwehr roll's result**. If defense isn't permitted (called "abwehrlos"/unavoidable), no roll is made.
- Some weapons reduce the target's effective defense via a **Gegnerabwehr (GA)** penalty listed on the weapon.
- Ranged/Zielzauber: **−1 per 10m of distance** to target; **−2** penalty if firing at a target in melee range (point-blank); no minimum range.
- Multiple/mixed weapons: dual-wielding two one-handed weapons = one attack roll per weapon but counts as a single action; both Schlagen and Abwehr suffer **−10** unless you have the "Zwei Waffen" talent.
- Splitting attacks across up to 4 adjacent enemies is allowed (divide your Schlagen value), at a cost of −2 Abwehr per enemy targeted until your next turn.

### Damage, unconsciousness, death, healing — PDF p. 52 / book p.42
- **Lebenskraft (LK) = KÖR + HÄ + 10** (this is HP).
- At **LK ≤ 0**: character is unconscious, wakes naturally after **1W20 hours** with 1 LK. Can be woken early by another character succeeding a KÖR+HÄ check (shake/slap/water) — wakes with 1 LK but forfeits the "Verschnaufen" short-rest recovery below.
- **Death**: if damage taken below 0 exceeds your KÖR attribute (e.g., KÖR 8 → dies at −9 LK or lower), the character dies outright.
- **Verschnaufen (short rest)**: after combat, if still ≥1 LK, resting a few minutes regains **half of the LK lost in that fight** (roughly 1 LK/minute).
- **Natural healing**: every 24 hours, regain **1W20 / 2 LK** (round as book states) if still ≥1 LK; +1 bonus to that roll per 4 hours of bed rest within that period.
- **Wiederbelebung (resurrection)**: possible via spell/other means in some settings; costs the revived character **−1 KÖR permanently**; characters with KÖR 1 cannot be resurrected.

### Kampfdetails (extra combat rules) — PDF p. 53–54 / book p. 43–44
- **Abwartehandlung** (delay/ready action): hold your action to act later in the round; gain +2 Initiative per full round of not acting (max +10 after 5 rounds), lost once you finally act.
- **Position/size modifiers**: prone = −2 attack/−2 defense; attacking from side/above = +1; from behind = +2; larger opponent = +2 per size category; smaller opponent = −2 per size category.
- **Rüstung an-/ablegen**: donning armor takes 2 actions per point of PA (helmets are free/instant). Sleeping in uncomfortable metal armor risks a cumulative −1 to all checks for 24h if you fail a KÖR+HÄ check.
- **Zielen (aiming)**: if you only move ≤ half your Laufen this round, you may aim (counts as your action) for **+2 per consecutive round aimed, max +10**, to a later Schießen/Zielzauber.
- **Zurückdrängen (knockback)**: a successful melee hit can push an equal/smaller-sized enemy back 1m (Blocker talent lets KÖR+HÄ resist this).

---

## 8. Magic Basics (Magie) — PDF p. 56–57 / book p. 46–47, spell list PDF p.58–87 / book p.48–77

### Spell types
- **(N)ormaler Zauber** — untargeted/self or area effect; check = **Zaubern** (GEI+AU+ZB−PA).
- **(Z)ielzauber** — targeted, typically an attack spell against a specific enemy; check = **Zielzauber** (GEI+GE+ZB−PA).

### Resolving a spell
- For most normal spells, a bare success on the Zaubern check is enough for the spell to work.
- For Zielzauber (attack spells), the check works exactly like a weapon attack: **the roll result = damage dealt** to the target, who then rolls Abwehr as normal.
- Some spell effects want the *highest possible* roll result (e.g., duration-scaling effects) rather than a bare pass/fail.
- If a spell must resolve against multiple targets with differing ZB penalties (different armor/traits), the caster rolls once unmodified, then compares that raw result against each target's individual ZB malus to determine success per-target.

### Resource model — Abklingzeit (cooldown), not mana
- There is **no mana/AP pool**. Instead:
  - A caster can only have **one spell "active"/prepared** at a time, but can trigger it repeatedly (no cost) as often as they like, gated only by that spell's own **Abklingzeit (cooldown)** — the number of rounds it can't be recast after a successful cast.
  - **Zauber wechseln (switching prepared spell)**: costs a full action + a successful **GEI+VE** check; on an Immersieg the switch is free (doesn't cost the action, castable same round).
  - **Zauberstäbe (spell wands/staves)**: a wand bound to a specific spell lets a caster who knows that spell trigger it directly without switching their currently-prepared spell — effectively a way to have 2 "active" spells at once.
- **Zugangsstufen (level gates)**: each spell lists the minimum caster level at which Heiler/Zauberer/Schwarzmagier may learn it (not every spell is available to every subtype). Heldenklassen retain access to their base class's spell list.
- **Zauberbonus (ZB)**: each individual spell has its own fixed ZB (can be negative, and can itself be formula-based off the target's stats, e.g. Einschläfern's ZB = −(target's GEI+VE)/2) — this is added into the Zaubern/Zielzauber roll like a weapon's WB.
- **Gesten-/wortlos zaubern**: casting normally needs free hands (gestures) + speech (incantation). Bound and/or gagged casters have Zaubern/Zielzauber halved (bound) or quartered (bound AND gagged), unless they have ranks in the "Wissensgebiet" talent to ignore one or both penalties.
- **Magie analysieren (detecting/ID'ing magic)**: sense magic within Stufe-in-meters range via GEI+AU; once sensed, GEI+VE (with touch) to identify what it does. Each object/phenomenon can only be attempted once per character level.

### Spell list scope (not reproduced in full — reference only)
- Spans PDF p.58–87 (book p.48–77), organized by caster subtype (Heiler/Zauberer/Schwarzmagier) then by spell level (1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20 — levels skip where no spells exist at that tier).
- Roughly 150+ named spells total across the three lists (with overlap — many spells like "Magie entdecken", "Feuerstrahl", "Zaubertrick" appear on multiple class lists).
- Each spell entry format (PDF p.58): **Name** / Preis (gold cost to learn or buy) / **ZB** / Dauer (duration) / Distanz (max range, "Selbst" = self only) / Abklingzeit (cooldown after successful cast) / Effekt (text description). This is the schema to use if importing the full spell list as structured data later.

---

## 9. Equipment reference (for starting-gear fields & attack/defense math) — PDF p. 88–90 / book p. 78–80

Currency: **1 Gold (GM) = 10 Silber (SM) = 100 Kupfer (KM).**

### Armor (Rüstungen) table
| Rüstung | PA | Besonderes (drawback) | Price |
|---|---|---|---|
| Robe | +0 | — | 1 GM |
| Robe (runenbestickt) | +0 | Aura +1 | 8 GM |
| Lederpanzer | +1 | — | 4 GM |
| Lederschienen (arm & bein) | +1 | — | 4 GM |
| Kettenpanzer | +2 | Laufen −0.5m | 10 GM |
| Plattenarmschienen | +1 | Laufen −0.5m | 7 GM |
| Plattenbeinschienen | +1 | Laufen −0.5m | 8 GM |
| Plattenpanzer | +3 | Laufen −1m | 50 GM |
| Metallhelm | +1 | Initiative −1 | 6 GM |
| Schild, Holz- | +1 | breaks on Abwehr-Patzer | 1 GM |
| Schild, Metall- | +1 | Laufen −0.5m | 8 GM |
| Schild, Turm- | +2 | Laufen −1m | 15 GM |

*Only cloth (Stoff/Robe) armor does NOT reduce Zaubern/Zielzauber; all other armor types subtract their PA from those spellcasting values (see §2).* A character can wear at most one helm + one body armor + one set of arm/leg schienen + optionally one shield (shields unusable with 2-handed weapons).

### Weapons (Waffen) table
| Waffe | WB | Besonderes | Price |
|---|---|---|---|
| Waffenlos (unarmed) | +0 | Gegnerabwehr +5 (i.e. easy to defend against) | — |
| Dolch (dagger) | +0 | Initiative +1 | 2 GM |
| Schlagring (knuckles) | +0 | as unarmed, but no Abwehr bonus for foe | 1 GM |
| Schleuder (sling) | +0 | −1 per 2m distance | 1 SM |
| Wurfmesser (throwing knife) | +0 | −1 per 2m distance; melee-capable too | 2 GM |
| Axt | +1 | — | 6 GM |
| Hammer | +1 | Gegnerabwehr −1 | 7 GM |
| Kampfstab (2h) | +1 | Zielzauber +1 | 5 SM |
| Keule (2h) | +1 | — | 2 SM |
| Speer | +1 | usable melee or ranged | 1 GM |
| Schwert, Breit- | +1 | Gegnerabwehr −2 | 8 GM |
| Schwert, Kurz- | +1 | (also covers Krummsäbel) | 6 GM |
| Bogen, Kurz- (2h) | +1 | Initiative +1 | 6 GM |
| Streitkolben/Morgenstern | +1 | Gegnerabwehr −1 | 7 GM |
| Lanze | +1 (trot) / +4 (gallop) | mounted only | 2 GM |
| Schwert, Lang- | +2 | Gegnerabwehr −2 | 7 GM |
| Bogen, Lang- (2h)* | +2 | Initiative +1 | 10 GM |
| Armbrust, leicht (2h) | +2 | Initiative −2 | 8 GM |
| Flegel (2h) | +2 | Initiative −2 | 8 GM |
| Hellebarde (2h) | +2 | Initiative −2 | 4 GM |
| Streitaxt (2h) | +3 | Initiative −2 | 7 GM |
| Streithammer (2h) | +3 | Initiative −4 | 6 GM |
| Bihänder (2h)* | +3 | Initiative −2, Gegnerabwehr −4 | 10 GM |
| Armbrust, schwer (2h) | +3 | Initiative −4, Gegnerabwehr −2 | 15 GM |
| Bogen, Elfen- (2h)* | +3 | Initiative +1 | 75 GM |
| Zwergenaxt (2h) | +3 | Initiative −1, Gegnerabwehr −2 | 60 GM |
| Schlachtgeißel | +3 | Initiative −4, Gegnerabwehr −4; Schlagen-Patzer hits self | 16 GM |
| Schlachtbeil (2h)* | +4 | Initiative −6, Gegnerabwehr −4 | 20 GM |

*(2h) = two-handed (precludes shield use). \* = too large for Zwerge to use.*

### Starting funds & general gear pricing
- Every character starts with basic kit (clothing, flint & tinder, waterskin, blanket, backpack, 2x Heilkraut) + **10 GM** to spend.
- Full goods price lists (travel gear, food/lodging, lighting, tools, mounts, locks [with a "Schloss-Wert" difficulty rating for lockpicking], siege/building materials, temple services incl. buying a Heiltrank for 10 GM or a Wiederbelebung spell for 500 GM) are on PDF p.88–90 — useful as an in-app shop/store data table but not reproduced in full here beyond weapons/armor above.

---

## Suggested character-sheet field list (derived from the above)

**Identity:** Name, Spieler, Volk, Klasse (+ subtype if Zauberwirker), Heldenklasse (if 10+), Geschlecht, Stufe, EP, LP (unspent), TP (unspent).

**Core stats:** Körper, Agilität, Geist (Attribute); Stärke, Härte, Bewegung, Geschick, Verstand, Aura (Eigenschaften).

**Derived combat stats:** Lebenskraft (current/max), Abwehr, Initiative, Laufen, Schlagen, Schießen, Zaubern, Zielzauber — each needs live recompute hooks off Attribute/Eigenschaften/equipped WB/PA/ZB.

**Equipment:** Waffen (name, WB, besonderes, equipped melee/ranged slot), Rüstungen (name, PA, besonderes, slot: Körper/Helm/Schienen/Schild), PA-Summe, carried gear + Goldmünzen/Silbermünzen/Kupfermünzen.

**Talents:** list of {name, current rank, max rank, class/level prereq} — needs a lookup table of ~100+ entries (base class + Heldenklasse pools).

**Spells (casters only):** currently-prepared spell, known spell list {name, Preis, ZB, Dauer, Distanz, Abklingzeit (with a live cooldown-rounds-remaining tracker), Effekt}.

**Meta:** Volksfähigkeiten (racial traits text), Sprachen/Schriftzeichen known, character background notes.

**Dice roller needs:** a generic "roll 1d20 ≤ PW" resolver that: (a) auto-detects natural 1 = Immersieg/crit, natural 20 = Patzer/fumble; (b) supports PW > 20 by chaining multiple d20 rolls (20, then remainder) and flags only the first die as fumble-eligible; (c) for attack rolls, surfaces "damage = roll result" directly; (d) optionally implements the two house-rule modules (Slayende Würfel exploding crits, Slayerpunkte resource) as toggleable settings.
