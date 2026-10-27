# Hǎo – Dein Weg ins Mandarin

Eine deutschsprachige Lern-App für Menschen ohne Mandarin-Vorkenntnisse. Die erste Version führt in 14 Lektionen durch drei Kapitel: Aussprache und Schrift, erste Sätze und Alltagssituationen. Sie vermittelt erste A1-Grundlagen, ist aber kein vollständiger A1-Kurs oder Zertifikatskurs.

## Funktionsumfang

- Pinyin, Initialen und Finals, vier Töne und neutraler Ton, Tonzeichen und Eingaben mit Tonzahlen.
- Hanzi und Pinyin unterscheiden, einfache Strichfolgen und Zeichenbestandteile kennenlernen.
- Begrüßen, Vorstellen, Satzstellung, Fragen, Verneinung, Zahlen, Maßwörter und Zeitangaben.
- Dialoge für Café/Restaurant, Einkaufen und Wegfragen mit Hanzi, Pinyin und deutscher Übersetzung.
- Jede Lektion enthält eine Erklärung und drei interaktive Aufgaben. Drei richtige Antworten in einem Durchlauf schalten die nächste Lektion frei; Wiederholungen sind jederzeit möglich.
- 24 nachschlagbare Kurswörter mit Tonzeichen und Beispielen; fünf Aufgaben pro Wortwiederholung, sofern genug Wörter freigeschaltet sind. Selten richtig wiederholte Wörter kommen zuerst.
- Fortschritt, letzte Ergebnisse, richtige Wortwiederholungen und aktive Lerntage bleiben in `localStorage` erhalten. Es gibt keine Konten, Datenübertragung oder Synchronisierung. Browserdaten zu löschen entfernt den Fortschritt; privater Modus kann die Speicherung einschränken. In der App lässt sich der Fortschritt nach Bestätigung zurücksetzen.
- Responsives Layout, Tastaturbedienung, beschriftete Eingabefelder und native Dialoge.
- Hell- und Darkmode: Der Schalter oben rechts wechselt das Design und speichert die Wahl im Browser. Ohne gespeicherte Wahl folgt die App dem Systemdesign. Bei gesperrtem Browserspeicher gilt die Wahl nur für die aktuelle Seite.

**Audio ist noch nicht enthalten.** Tonaufgaben prüfen die visuelle Zuordnung, kein Hörverständnis. Auch Aussprachebewertung, animierte Strichfolge und Handschrifterkennung sind nicht enthalten. Die App kennzeichnet diese Grenzen. Für Hörübungen wären geprüfte Mandarin-Aufnahmen mit dokumentierten Nutzungsrechten und passende Hörverständnisaufgaben zu ergänzen.

## Voraussetzungen und lokaler Start

Node.js ab Version 22 und ein aktueller Browser mit JavaScript, ES-Modulen und Unterstützung für das HTML-Element `dialog`. Keine Pakete und kein Installationsschritt nötig.

```sh
node server.js
```

Öffne anschließend http://127.0.0.1:5173 im Browser. Beenden mit Strg+C. Optional lässt sich über die Umgebungsvariable `PORT` ein anderer Port wählen. Zum Beispiel in PowerShell: `$env:PORT=5174`, danach `node server.js`.

Die App muss über HTTP aufgerufen werden; ein Doppelklick auf `index.html` reicht wegen der JavaScript-Module nicht aus. Fortschritt ist an Browserprofil und Ursprung (Host und Port) gebunden.

## Prüfung und Build

```sh
node --test
node scripts/build.js
```

Der Build kopiert die sieben benötigten Dateien nach `dist/`. Sie können später auf einem statischen Webserver bereitgestellt werden. Das Skript lädt nichts hoch. Falls npm vorhanden ist, sind alternativ `npm start`, `npm test` und `npm run build` verfügbar.

## Struktur und Beiträge

- `course.js`: Kursinhalte, Übungen und Vokabeln.
- `progress.js`: Validierung, Freischaltung und Antwortabgleich.
- `app.js`: Ansichten, Dialoge, Übungen und Speicherung.
- `styles.css`: Gestaltung und responsive Ansichten.
- `dark.css` und `theme.js`: dunkles Design, Systemerkennung und gespeicherte Designauswahl.
- `server.js`: lokaler Entwicklungsserver, auf Loopback beschränkt.
- `tests/`: Tests der Kursintegrität und Fortschrittslogik.

Für Beiträge einen Branch erstellen, Änderungen auf einen klaren Zweck beschränken und Prüfungen ausführen. Neue Inhalte brauchen korrekte Hanzi, Pinyin mit Tönen, deutsche Erklärungen und passende Aufgaben. Kurs-IDs stabil halten: gespeicherter Fortschritt verweist darauf. Sprachinhalte vor einer breiteren Veröffentlichung von einer qualifizierten Mandarin-Lehrperson prüfen lassen.

Zusätzlich manuell prüfen: erste Lektion abschließen, nächste Freischaltung, Neuladen, falsche Antworten und Wiederholung, Wortsuche, Tastaturnavigation und mobile Ansicht. Es gibt keine externen Schriftarten, Bilder oder Audioressourcen. Noch keine Lizenzentscheidung getroffen: vor einer öffentlichen Veröffentlichung eine passende Lizenz ergänzen. Dieses Projekt wurde lokal vorbereitet; Veröffentlichung und Git-Remote-Konfiguration erfolgen nur nach ausdrücklicher Freigabe.

## Fachliche Referenz

Die Tonwechsel-Erklärungen wurden mit den [Pinyin- und Tonwechselregeln des Lehrbuchverlags Cheng & Tsui](https://www.cheng-tsui.com/sites/default/files/previews/Online%20Sample%20-%20Backmatter_5.pdf) abgeglichen. Die Kursformulierungen und Aufgaben sind eigenständig; es werden keine Lehrbuchtexte oder Aufnahmen eingebunden. Bei 一 und 不 zeigen Dialoge zur Aussprachehilfe die veränderten Töne, während einzelne Wörter ihre Grundtöne tragen.
