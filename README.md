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

## Run locally

Use a supported, patched Node.js release (minimum Node.js 22) and a modern browser supporting JavaScript modules and HTML dialogs. There are no npm dependencies and no installation step.

```sh
node server.js
```

Open http://127.0.0.1:5173 and stop the server with Ctrl+C. Set `PORT` to use another port; in PowerShell, run `$env:PORT=5174` before starting. The preview server binds only to your own computer. Serve the app through HTTP; opening `index.html` directly will not load its modules correctly.

## Test and build

```sh
node --test
node scripts/build.js
```

With npm available, the equivalent commands are `npm start`, `npm test`, and `npm run build`. Tests cover course integrity, progression, answer handling, storage validation, HTML escaping, HTTP access controls, headers and the deployment file list. HTTP tests require permission to connect to a local loopback server.

The build writes eight public app files plus `_headers` to `dist/`. If it finds an unexpected file already in `dist/`, it stops so that the file can be reviewed. It never uploads anything.

## Publish

Deploy **only `dist/`**, using an HTTPS static host. For Cloudflare Pages, set the build command to `node scripts/build.js` and the output directory to `dist`. Its static hosting reads the generated `_headers` configuration. Other hosts must be configured to send equivalent headers explicitly.

Read [SECURITY.md](SECURITY.md) before deployment, including the host-side HTTPS and response-header verification steps. Do not expose the repository root or use the preview server directly as a public service. The repository can remain private while its built website is public. This version has been prepared for deployment; no public deployment is created by these commands.

## Privacy and storage

There is no login, analytics, learner-data API, account sync, or third-party runtime asset. The app stores learning results and theme preferences in `localStorage` on the visitor's device. The hosting provider receives ordinary page requests and may retain access logs. Clearing browser data removes saved progress; private browsing or blocked storage can limit persistence. Settings lets the visitor reset progress after confirmation. The theme preference is separate from course progress.

Local results are editable by the visitor and must not be treated as verified assessment records. Progress is tied to the browser profile and website origin; changing domain or port starts a separate storage area. Progress is not copied to another device automatically.

## Project structure

- `course.js`: English explanations, exercises, dialogues and vocabulary.
- `app.js`, `progress.js`, `html.js`: views, exercises, validated progress and HTML escaping.
- `index.html`, `styles.css`, `dark.css`, `theme.js`: layout, styles and theme handling.
- `security.js`, `server.js`: shared security policy, public-asset list and loopback preview server.
- `scripts/build.js`: allowlisted deployment output and hosting headers.
- `tests/`: course, state and security regression tests.
- `SECURITY.md`: controls, deployment requirements and limitations.

## Contribute

Create a branch, keep each change focused, and run the tests and build. New course material needs accurate Hanzi, Pinyin with tones, clear English explanations and meaningful exercises. Keep lesson IDs stable because saved progress refers to them. Have a qualified Mandarin teacher review language content before a broad release.

Manually check lesson completion, unlocking, persistence after reload, incorrect answers, reviews, vocabulary search, keyboard navigation, mobile layout and both themes. Do not add secrets or credentials to frontend files. New external services or account features need a fresh security review. No open-source licence has been selected; the owner must choose one before distributing this as an open-source project.

## Language reference

Tone-change explanations were checked against the textbook publisher [Cheng & Tsui's Pinyin and tone-change rules](https://www.cheng-tsui.com/sites/default/files/previews/Online%20Sample%20-%20Backmatter_5.pdf). Course prose and exercises are original; textbook passages and recordings are not bundled. Dialogues mark the spoken tone changes of 一 and 不 as pronunciation aids; standalone words use their base tones.
