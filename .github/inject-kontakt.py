#!/usr/bin/env python3
"""Setzt den Kontaktblock aus dem Secret IMPRESSUM_KONTAKT ins Impressum ein.

Laeuft ausschliesslich im GitHub-Actions-Deployment. Im Repo steht an den beiden
Kontakt-Stellen (Impressum und Datenschutz Ziffer 1) nur ein Platzhalter, damit
Name, Anschrift und E-Mail nicht in Klons, Forks oder der Git-History landen.

Bricht mit Exit-Code 1 ab, wenn das Secret fehlt oder nicht genau zwei
Platzhalter gefunden werden — dann lieber gar nicht deployen als ein Impressum
ohne Pflichtangaben oder mit halb ersetztem Markup.
"""
import os
import re
import sys
from pathlib import Path

ZIEL = Path("imp/impressum.html")
ERWARTET = 2
MARKER = re.compile(r"<!--KONTAKT:START-->.*?<!--KONTAKT:END-->", re.DOTALL)

kontakt = os.environ.get("IMPRESSUM_KONTAKT", "").strip()
if not kontakt:
    sys.exit("FEHLER: Secret IMPRESSUM_KONTAKT ist nicht gesetzt oder leer.")
if not ZIEL.exists():
    sys.exit(f"FEHLER: {ZIEL} nicht gefunden.")

html = ZIEL.read_text(encoding="utf-8")
treffer = len(MARKER.findall(html))
if treffer != ERWARTET:
    sys.exit(f"FEHLER: {treffer} Kontakt-Platzhalter in {ZIEL} gefunden, erwartet {ERWARTET}.")

# Funktions-Replacement: keine Sonderbehandlung von \1, \g<> etc. im Secret-Text
neu = MARKER.sub(lambda _m: kontakt, html)
ZIEL.write_text(neu, encoding="utf-8")
print(f"Kontaktblock an {treffer} Stellen in {ZIEL} eingesetzt.")
