# Hǎo — Your path to Mandarin

An English-language Mandarin app for complete beginners, built with plain HTML, CSS and JavaScript. Fourteen lessons lead through pronunciation, Pinyin, characters, vocabulary, grammar and everyday conversations. The course introduces A1 foundations; it is not a complete A1 syllabus or a certification course.

## Features

- Three chapters, fourteen explanations and forty-two interactive exercises.
- Pinyin initials/finals, the four tones and neutral tone, tone marks and tone-number inputs.
- Hanzi versus Pinyin, basic stroke-order rules and character components.
- Greetings, introductions, word order, questions, negation, numbers, measure words and time.
- Dialogues for introductions, counting, ordering food, shopping and asking directions.
- Twenty-four searchable vocabulary entries with Pinyin, English meanings and examples.
- Complete all three exercises correctly in one attempt to unlock the next lesson. Earlier lessons remain available. Word reviews prioritise words with fewer correct reviews, with up to five questions per session.
- Browser-local progress, recent results, word-review counts and active learning days. Existing lesson IDs and storage keys remain compatible with the earlier German version.
- Responsive design, keyboard controls, accessible native dialogs, light/dark mode, system-theme detection and a saved theme preference.

**Audio is not available.** Tone exercises are visual and do not test listening. Pronunciation scoring, animated stroke order and handwriting recognition are also not included. Approximate English sound comparisons cannot replace listening to a qualified speaker.

## Use it without installing anything

**[Download Hao.html](https://github.com/FC6446/hao-mandarin/releases/latest/download/Hao.html)** and double-click it, or choose **Open with → your browser**. It contains the whole English course, exercises and both themes. No Node.js, server, hosting provider, account or internet connection is required to use this offline edition. Keep the `.html` extension. It opens as a browser page, not a native executable.

Use a current desktop browser such as Chrome, Edge, Firefox or Safari. Mobile file-opening behaviour varies by operating system and file app. An automatic file preview may not run JavaScript; open the file in a full browser where supported.

Progress storage for `file:` pages varies by browser and may change when the file is moved, renamed or replaced. In **Storage and settings**, use **Download progress backup** to save a JSON file. In another copy/browser, choose **Import progress backup** and confirm replacement. Never rely on local-file storage as your only copy. The browser may ask where to save a backup. This backup contains learning results, not the theme preference.

There is no universal online link in this mode: share the HTML file itself. Each person runs their own local copy. The developer source `index.html` remains the modular version; end users should open `Hao.html`.

## Developer preview

Use a supported, patched Node.js release (minimum Node.js 22) and a modern browser supporting JavaScript modules and HTML dialogs. There are no npm dependencies and no installation step.

```sh
node server.js
```

Open http://127.0.0.1:5173 and stop the server with Ctrl+C. Set `PORT` to use another port; in PowerShell, run `$env:PORT=5174` before starting. The preview server binds only to your own computer. Serve the app through HTTP; opening `index.html` directly will not load its modules correctly.

## Test and build

```sh
node --test
node scripts/build-standalone.js
```

With npm available, `npm start` opens the developer server and `npm test` runs the tests. Tests cover course integrity, progression, answer handling, storage validation, HTML escaping, the standalone file and local HTTP access controls. HTTP tests require permission to connect to a local loopback server.

The standalone build generates **`Hao.html`** in the repository root. It embeds all scripts and styles with SHA-256 hashes in its Content Security Policy; it does not use `unsafe-inline` or fetch other files. The build does not upload anything.

## Share the app

Send **`Hao.html`** to the people who want to use it. They save the file and open it in their own browser. No hosting provider or server is needed; everyone runs their own offline copy.

To transfer learning results, download a progress backup from settings and import it into the other copy. Sharing the HTML file alone does not include your saved progress.

## Privacy and storage

There is no login, analytics, learner-data API, account sync, or third-party runtime asset. The offline app makes no network requests. It stores learning results and theme preferences in `localStorage` on your device when the browser allows it. Clearing browser data removes saved progress; private browsing or blocked storage can limit persistence. Settings lets you reset progress after confirmation. The theme preference is separate from course progress.

Local results are editable by the user and must not be treated as verified assessment records. Progress storage depends on the browser profile and local file location. Use a backup when changing files, browsers or devices; progress is not copied automatically.

## Project structure

- `course.js`: English explanations, exercises, dialogues and vocabulary.
- `app.js`, `progress.js`, `html.js`: views, exercises, validated progress and HTML escaping.
- `index.html`, `styles.css`, `dark.css`, `theme.js`: layout, styles and theme handling.
- `security.js`, `server.js`: shared security policy, public-asset list and loopback preview server.
- `scripts/build.js`: additional modular build used by the security regression tests.
- `scripts/build-standalone.js`, `Hao.html`: reproducible, self-contained offline edition.
- `tests/`: course, state and security regression tests.
- `SECURITY.md`: security controls and technical limitations.

## Contribute

Create a branch, keep each change focused, and run the tests and build. New course material needs accurate Hanzi, Pinyin with tones, clear English explanations and meaningful exercises. Keep lesson IDs stable because saved progress refers to them. Have a qualified Mandarin teacher review language content before a broad release.

Manually check lesson completion, unlocking, persistence after reload, incorrect answers, reviews, vocabulary search, keyboard navigation, mobile layout and both themes. Do not add secrets or credentials to frontend files. New external services or account features need a fresh security review. No open-source licence has been selected; the owner must choose one before distributing this as an open-source project.

## Language reference

Tone-change explanations were checked against the textbook publisher [Cheng & Tsui's Pinyin and tone-change rules](https://www.cheng-tsui.com/sites/default/files/previews/Online%20Sample%20-%20Backmatter_5.pdf). Course prose and exercises are original; textbook passages and recordings are not bundled. Dialogues mark the spoken tone changes of 一 and 不 as pronunciation aids; standalone words use their base tones.
