// Dungeonslayers 4 — kurze Hinweistöne für Ereignisse, die man sonst leicht
// verpasst, allen voran: dass überhaupt ein Kampf begonnen hat. Sechs Dateien,
// je 1-3 Sekunden. Herkunft und Lizenz stehen in sounds/README.md.
//
// Bewusst mit <audio>-Elementen statt Web Audio API: einfacher, und für
// kurze One-Shot-Sounds reicht das. Browser blockieren Autoplay nur vor der
// ersten Nutzerinteraktion — Multiplayer beizutreten/zu eröffnen ist selbst
// schon ein Klick, danach spielt die Wiedergabe anstandslos.

const SOUND_STUMM_KEY = 'ds4_sound_stumm';

const SOUND_DATEIEN = {
    'kampf-beginnt': 'sounds/kampf-beginnt.mp3',
    'dein-zug': 'sounds/dein-zug.mp3',
    'schaden': 'sounds/schaden.mp3',
    'heilung': 'sounds/heilung.mp3',
    'fluestern': 'sounds/fluestern.mp3',
    'ansage': 'sounds/ansage.mp3'
};

let soundStumm = false;
try { soundStumm = localStorage.getItem(SOUND_STUMM_KEY) === '1'; } catch (e) { /* Speicher evtl. blockiert */ }

function spielSound(name) {
    if (soundStumm) return;
    const pfad = SOUND_DATEIEN[name];
    if (!pfad) return;
    try {
        const audio = new Audio(pfad);
        audio.volume = 0.6;
        // Blockiertes Autoplay oder eine fehlende Datei sind kein Absturzgrund
        audio.play().catch(() => {});
    } catch (e) { /* im Zweifel einfach keinen Ton */ }
}

function soundStummUmschalten() {
    soundStumm = !soundStumm;
    try { localStorage.setItem(SOUND_STUMM_KEY, soundStumm ? '1' : '0'); } catch (e) { /* blockiert */ }
    renderSoundKnopf();
}

function renderSoundKnopf() {
    document.querySelectorAll('[data-sound-knopf]').forEach(btn => {
        btn.textContent = soundStumm ? '🔇' : '🔊';
        btn.title = soundStumm
            ? 'Sounds sind stumm — klicken zum Einschalten'
            : 'Sounds sind an — klicken zum Stummschalten';
    });
}

document.addEventListener('DOMContentLoaded', renderSoundKnopf);
