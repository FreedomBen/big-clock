# Repository Guidelines

## Project Structure & Module Organization
The repository is intentionally small: `big_clock.js` in the root contains the entire GTK/GJS application, and `README.md` summarizes prerequisites plus the launch command. Keep new modules co-located for now (for example `src/clock_window.js` or `styles/clock.css`) so contributors can discover them without chasing nested directories. If you add assets (icons, sounds, themes), group them under an `assets/` folder and reference them via relative paths from `big_clock.js` to avoid fragile absolute paths.

## Build, Test, and Development Commands
- `gjs big_clock.js` – Runs the digital clock with the default application ID. Use this during development and for smoke tests.
- `G_MESSAGES_DEBUG=all gjs big_clock.js` – Optional verbose mode that surfaces warnings from GTK, Gdk, and GLib when you touch low-level APIs.
When adding helper scripts, place them in a `scripts/` directory and document their usage in `README.md` to keep AGENTS.md focused on high-level flow.

## Coding Style & Naming Conventions
Follow the existing ES6-style GJS code: 4-space indentation, `const`/`let` bindings, double-quoted strings for UI text, and trailing commas in multiline object literals. Register GTK subclasses with `GObject.registerClass` and freeze API versions via `imports.gi.versions` at the top of the file. Methods should use lowerCamelCase (`_setupCss`, `_updateTime`), while CSS IDs use kebab-case (e.g., `clock-label`). Prefer template literals for multi-line CSS and avoid manual reference management unless a library requires it.

## Testing Guidelines
Automated tests are not yet wired up, so rely on manual verification until we introduce a harness. Each change should be exercised by launching `gjs big_clock.js`, confirming the clock renders, updates once per second, and responds to window focus, movement, and resize (even if currently fixed size). When altering time formatting or styling, capture before/after screenshots to share in the PR description. If you write future GJS tests, store them under `tests/` and mirror the naming pattern `test_<feature>.js`.

## Commit & Pull Request Guidelines
Commit messages follow the concise, imperative style demonstrated by `Initial commit`; keep subject lines under 50 characters and describe *what* the change does. Squash trivial fixups locally before opening a PR. Each PR should include: a short summary, linked issue (if any), reproduction steps, manual test notes (e.g., “Launched via `gjs big_clock.js` on GNOME 45”), and screenshots for UI adjustments. Request review before merging and rebase onto the latest main branch to keep history linear.

## Security & Configuration Tips
Hard-code GI versions (`imports.gi.versions.Gtk = "3.0"`) before importing modules so contributors run against the same ABI. Avoid shelling out from GJS unless necessary; when you must, validate user input and prefer Gio utilities. Document any environment variables or schemas you introduce so other agents can reproduce your setup without guesswork.
