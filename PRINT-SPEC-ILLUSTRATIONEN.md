# Spezifikation v2: Illustrationen für das Buch „KI kompetent“

Stand: 14.09.2026. Gilt für alle Grafiken in `~/dev/*.html` aus `illustrationen-galerie.html`
(Kapitel-Titelseiten ausgenommen). Buch: **140 × 216 mm**, Satzspiegel **110 mm**, Verlag Wiley,
**Druck in Schwarz-Weiß**.

## Ziele

1. **Aus einem Guss:** identischer Kopf, identische Bausteine, identische Abstände in allen Grafiken.
2. **Fließtext visuell zugänglich machen** (Hervorhebungen, Struktur, Luft) – **der Wortlaut bleibt unverändert.**
3. **S/W-tauglich:** Hierarchie über Gewicht, Größe, Fläche, Linie und Position – nie nur über Farbe.
4. **Benennung wie im Buch:** Titel in der Grafik = Bildunterschrift im Buch (ohne Nummer).

## Designsystem – `illu-base.css` (Pflicht)

Jede Datei bindet nach den Fonts/html2canvas `<link rel="stylesheet" href="illu-base.css" />` ein und
behält nur datei-spezifisches CSS in einem kleinen `<style>`. **Keine Redefinition** von `.card`, `.hd`,
`.title`, `.subtitle`, `.panel`, `.tbl`, `.num`, `.ico`, `.chip`, `.row`, `.name`, `.lbl`, `.small`.
Referenz-Implementierungen: `abb-1-3-datenarten.html` (Tabelle), `abb-4-3-fuehrung-auf-einen-blick.html` (Liste).

| Baustein | Klasse | Maß |
|---|---|---|
| Capture | `.card#capture` | 520 px, Padding 16 → Innen 488 px |
| Kopf | `.hd` > `h1.title` + `p.subtitle` | 22 px/800 + 13,5 px muted, linksbündig, Abstand 14 px zum Inhalt |
| Panel | `.panel` | weiß, 1 px `--line` (#cfd0d8), Radius 12, **kein Schatten** |
| Tabelle | `table.tbl` | 488 px, Kopf 12 px uppercase, Zellen 13 px, nur horizontale Linien |
| Zahlen-Kachel | `.num` | 26 px, Palettenfarbe des Akzent-Sets (`.a1`–`.a5`), weiß 13 px/700 |
| Icon-Kachel | `.ico` (+ `.lg` 34 px, `.dark`) | 28 px, getönt + Kontur, Icon 16 px Strich |
| Chip | `.chip` (+ `.acc`) | 12 px/700, Pille |
| Listen-Zeile | `.row` > `.num`/`.ico` + `.rh` + `.rd` | Überschrift 14 px/700, Erklärung 13 px (voller Wortlaut, Schlüsselbegriffe fett) |
| Name / Label / Klein | `.name` 14/700 · `.lbl` 12 uppercase · `.small` 12,5 muted | |
| Akzent-Sets | `.a1` … `.a5` auf Zeile/Element | setzt `--accent/--acc-soft/--acc-line/--acc-deep` |

**Typo-Minima (im Druck):** Fließtext 13 px = 7,8 pt · Namen 14 px · Labels/Chips 12 px · Titel 22 px.
Nichts unter 12 px. Textfarben nur `--ink`, `--text`, `--muted` (kein helleres Grau).

**Kein Eyebrow** mehr über dem Titel und keine Dekor-Chips im Kopf (nur „Kapitel N“ / „Teil N von 2“). **Keine Schatten**, keine großen Verläufe als Flächen hinter Text
(Ausnahme: bestehende Band-/Hub-Flächen wie Wirkungsebenen, Dreieck, Blüte – dort Text weiß, ≥ 700).
Gradient-Rahmen und dekorative Verläufe entfernen; Rahmen sind 1 px `--line` oder 1,5 px Akzent.

**Farbe und S/W – immer beide Varianten:** Jede Grafik gibt es farbig (Web) und in S/W (Druck). Farbige
Flächen nutzen ausschließlich die Aura-Palette `.a1`–`.a5` (Zahlen-Kacheln, Icon-Kacheln, Bänder, Ränder) oder
den Aura-Verlauf (`--aura-gradient` bzw. SVG `url(#aura)`) für Hubs und Dächer. Keine reinen Tinte-Flächen als
Bedeutungsträger. Die S/W-Fassung entsteht automatisch (`?sw=1&gray=1`): `illu-export.js` bildet jede
Palettenfarbe auf einen **festen Grauwert** ab (a1 dunkel 58 → a5 hell 135), damit derselbe Farbton in jeder
Grafik denselben Grauton ergibt. Was sich unterscheiden muss, unterscheidet sich zusätzlich durch Nummer,
Label, Position, Kontur/Voll. Keine neuen Hex-Werte erfinden – nur `.a1`–`.a5` bzw. die in `_FIXED`
(illu-export.js) hinterlegten Codes.

## Textregeln – Inhalt bleibt wörtlich

- **Alle Texte bleiben inhaltlich und wörtlich wie sie sind.** Nicht kürzen, nicht umformulieren, nichts
  weglassen, nichts ergänzen. Erlaubt ist nur die *visuelle* Aufbereitung:
  - **Schlüsselbegriffe fett** (`<b>`) innerhalb der Sätze, damit der Blick die Kernaussage findet
    (1–2 Hervorhebungen je Absatz, nie ganze Sätze).
  - **Struktur statt Absatz:** Wo ein Text aus Aufzählungen besteht („A, B und C“), darf er als Zeilen/Stichpunkte
    gesetzt werden – mit denselben Wörtern.
  - **Trennung von Aussage und Erklärung:** Überschrift fett (14 px), Erklärung regular (13 px), sichtbarer Abstand.
  - **Label statt Tabellenkopf** in der Zelle (`.lbl`), wenn Spalten zusammengelegt werden.
  - Luft: Zeilenabstand 1,4, Abstand zwischen Einheiten 8–10 px, Trennlinien.
- Titel der Grafik = Buchname (Tabelle unten). Untertitel = der bisherige Untertitel (unverändert).
- Ausnahme: Kopfzeilen-Bezeichner dürfen als Label in Zellen wiederholt werden; Chips wie „Kapitel 4“ sind erlaubt.

## Benennung (Buch → Datei)

| Abb. | Buchname (= `.title` und `<title>`) | Datei |
|---|---|---|
| 1.1 | Erklärungsmodell für Künstliche Intelligenz | ki-hierarchie-treppe |
| 1.2 | KI-Fähigkeiten auf einen Blick | ki-faehigkeiten-mindweb |
| 1.3 | Übersicht der verschiedenen Datenarten | abb-1-3-datenarten (Referenz Tabelle) |
| 1.4 | Acht Grundsätze eines guten Prompts | prompt-bausteine |
| 1.5 | Einordnung Context Engineering | prompt-system-context |
| 2.1 | Die drei Wirkungsebenen der KI | ki-wirkungsebenen |
| 3.1 | KI-Kompetenz-Modell | kernmodell-dreieck |
| 4.1 | Die vier Dimensionen von Vertrauen in KI | vertrauen-dimensionen-tabelle |
| 4.2 | Führungsmodell des Psychologischen Kapitals | zuversicht-bluete |
| 4.3 | Führung auf einen Blick | abb-4-3-fuehrung-auf-einen-blick (Referenz Liste) |
| 5.1 | Technologie Zielbild | ki-zielbild-tempel |
| 5.2 | Übersicht der Dimensionen der Datenqualität | datenqualitaet-tabelle |
| 5.3 | Technologie auf einen Blick | kapitel-5-auf-einen-blick |
| 6.1 | KI-Organisationsmodelle | ki-betriebsmodelle-tabelle |
| 6.2 | Übersicht der Rollen im Unternehmen | ki-rollen-tabelle |
| 6.3 | Organisation auf einen Blick | kapitel-6-auf-einen-blick |
| – | (nicht im Buch, Titel frei, aber gleiches System) | openai-chatgpt-gpt, prompt-bausteine-beispiel, kpi-leading-lagging-tabelle, kpi-adoption-leading-lagging, kpi-markt-leading-lagging |

Dateinamen tragen seit 15.09.2026 die Abbildungsnummer: `abb-1-1-erklaerungsmodell-ki.html` … `abb-6-3-organisation-auf-einen-blick.html` (Rollen: `abb-6-2-rollen` Gesamt, `abb-6-2a-rollen-teil1`, `abb-6-2b-rollen-teil2`). Zuordnung alt → neu in `_rename-map.txt`.

## Höhe

Ziel ≤ 700 px (= 148 mm), hartes Maximum 780 px. Die Rollen-Tabelle bleibt zweiteilig (teil1/teil2), da
der vollständige Wortlaut bei lesbarer Schrift nicht auf eine Seite passt.

## Prüfen (Pflicht, je Datei)

```bash
cd /Users/tobiastroendle/dev && node illu-render.mjs <name> --only=book --out=/Users/tobiastroendle/dev/_print-test
```
Danach `_print-test/_book-preview/<name>.png` und `_print-test/illu-thumbs/<name>.png` ansehen:
Breite exakt 520 px, Höhe ≤ 700 px, Kopf identisch zur Referenz, nichts abgeschnitten, keine Wortumbrüche
mitten im Wort, Hierarchie auch ohne Farbe erkennbar (Bild gedanklich in Graustufen prüfen).
