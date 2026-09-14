# Druck-Spezifikation: Illustrationen für das Buch „KI kompetent“

Stand: 14.09.2026. Gilt für alle Grafiken in `~/dev/*.html`, die in `illustrationen-galerie.html`
gelistet sind (Abbildungen + „Auf einen Blick“). Kapitel-Titelseiten sind ausgenommen (ganzseitig, ok).

## Warum

Buchformat **140 × 216 mm**, Satzspiegel ca. **110 mm** breit (15 mm Rand). Die Grafiken wurden bisher
für 760–1450 px Web-Breite gebaut und im Buch auf 110 mm gestaucht. Ergebnis: Fließtext in den Grafiken
landet bei **4–5 pt** – unlesbar. Ziel: alles ≥ **7,8 pt** im Druck, Namen/Überschriften ≥ 8,4 pt.

## Feste Regeln

1. **Capture-Breite 520 px**, fix: `.card{width:520px;padding:16px}` (kein `max-width`, kein `width:100%`).
   Innenbreite = 488 px. Bei 110 mm Druckbreite gilt dann **1 px = 0,6 pt**.
2. **Mindest-Schriftgrößen (px im HTML → pt im Buch):**
   | Element | px | pt |
   |---|---|---|
   | Fließtext, Beschreibungen, Tabellenzellen | **≥ 13** (besser 13,5–14) | 7,8–8,4 |
   | Namen, Karten-Überschriften (bold) | 14–15 | 8,4–9 |
   | Eyebrow, Tabellenkopf, Uppercase-Labels, Chips | **≥ 12** | 7,2 |
   | Titel der Grafik | 22–24 | 13–14 |
   | Untertitel | 13,5 | 8,1 |
   | Große Zahlen/Hub-Text | frei | – |
   Nichts unter 12 px. `line-height` 1,35–1,45. Keine sehr hellen Grautöne für Text (min. `#5c5d66` auf Weiß).
3. **Höhe:** Zielhöhe des `#capture` **≤ 700 px** (= 148 mm), hartes Maximum **780 px** (sonst passt
   die Grafik nicht mit Bildunterschrift auf eine Seite). Lieber kompakter setzen, Spalten zusammenlegen
   oder zweispaltig anordnen, als Schrift verkleinern.
4. **Icons ≥ 18 px**, Icon-Kacheln 28–34 px. Linien/Rahmen ≥ 1 px, Verbindungslinien 1,5 px.
5. **Inhalt unverändert:** Alle Texte (Titel, Untertitel, Labels, Beschreibungen, Beispiele) wörtlich
   beibehalten. Nichts umformulieren, kürzen oder ergänzen. Reihenfolge beibehalten.
6. **Visuelle Sprache beibehalten:** Inter, Aura-Farben (dieselben Hex-Werte wie bisher – die S/W-Palette
   in `illu-export.js` hängt an den Hex-Codes), runde Karten, Punktraster-Hintergrund über `.wrap`.
   Schatten dezent (im Druck wirken große weiche Schatten schmutzig – Blur ≤ 20 px, Alpha ≤ .12).
7. **Dateistruktur beibehalten:** `<div class="toolbar">` mit `#downloadBtn`, `.wrap` > `.card#capture`,
   am Ende `<script src="illu-export.js"></script>`. `<title>` unverändert.
8. **html2canvas-kompatibel** (der Download-Button in der Galerie nutzt html2canvas): kein `filter`,
   `backdrop-filter`, `mix-blend-mode`, `background-clip:text`, keine `clip-path`-Texte. Gradient-Rahmen
   wie bisher als SVG-Stroke. Icons als Inline-SVG.
9. Fixe Breiten in px (keine Prozent-/vw-Angaben), damit der Export deterministisch ist.

## Layout-Empfehlungen je Typ

- **Tabellen (3 Spalten):** Spaltenbreiten z. B. 150 / 165 / 173 px; Zellen-Padding 10–12 px;
  Icon-Kachel 28 px. Wenn zu hoch: dritte Spalte als zweite Zeile in Spalte 2 (Label fett vorangestellt,
  z. B. „Verantwortung:“), oder Icons weglassen.
- **Listen mit Beschreibung („Auf einen Blick“, Bausteine):** Nummer-Kachel 28–30 px, Überschrift 14,5 px,
  Beschreibung 13 px. Wenn zu hoch: zwei Spalten à 236 px.
- **Diagramme (Dreieck, Blüte, Tempel, Ebenen, Treppe):** Geometrie auf 488 px Breite skalieren,
  Labels nicht proportional mitverkleinern, sondern auf Mindestgrößen setzen; Beschriftungen ggf.
  außerhalb der Form platzieren.
- **Mind-Web (12 Knoten):** radial passt nicht in 488 px. Empfehlung: Hub mittig, je 6 Knoten links und
  rechts gestapelt (Icon-Kachel + Label, 14 px), Verbindungslinien vom Hub zu jedem Knoten.

## Prüfen (Pflicht, je Datei)

```bash
cd /Users/tobiastroendle/dev && node illu-render.mjs <name> --only=book --out=/Users/tobiastroendle/dev/_print-test
```
Ausgabe nennt `capture WxH px` und die Buchgröße. Danach `_print-test/_book-preview/<name>.png` ansehen
(Buchseite 140 × 216 mm, Grafik auf 110 mm) und `_print-test/illu-thumbs/<name>.png`. Kriterien:
Höhe ≤ 780 px, kein Text abgeschnitten/überlappend, kein Umbruch mitten in Wörtern, Kleinsttext lesbar.
