# GNOME Integration Plan

## Objective
Package Big Clock like a first-class GNOME application so it installs cleanly, publishes metadata, and shows up in GNOME Shell and Software.

## Application Identity
1. Use the reverse-DNS ID `dev.benporter.BigClock` (matching https://bigclock.benporter.dev) and update `application_id` in `big_clock.js`.
2. Install the script to `/usr/share/big-clock/big_clock.js` (or `/usr/lib/big-clock/`). Keep the shebang `#!/usr/bin/env gjs` and ensure the file is executable.

## Desktop Entry
1. Create `data/dev.benporter.BigClock.desktop`:
   - `Name=Big Clock`
   - `Exec=gjs /usr/share/big-clock/big_clock.js`
   - `Icon=dev.benporter.BigClock`
   - `Categories=Utility;Clock;GTK;`
   - `StartupNotify=true`
2. Install the `.desktop` file to `/usr/share/applications/` so GNOME Shell discovers it.

## Icons
1. Provide at least a 256×256 PNG or SVG (`dev.benporter.BigClock.png` or `.svg`).
2. Place icons under `data/icons/hicolor/<size>/apps/` and install the hierarchy to `/usr/share/icons/hicolor/`.
3. Run `gtk-update-icon-cache` from the install script when targeting classic package formats.

## AppStream Metadata
1. Author `data/dev.benporter.BigClock.metainfo.xml` describing the app (summary, description, license, release notes, screenshots).
2. Install it to `/usr/share/metainfo/` so GNOME Software treats Big Clock as a proper application.

## Build & Install Workflow
1. Introduce Meson or a simple Makefile:
   - Copy `big_clock.js`, the desktop file, metainfo, and icons into the correct prefix.
   - Provide `install` and `uninstall` targets; for Meson, support `meson setup build && meson install -C build`.
2. Document the commands in `README.md`.

## Optional Schemas
If preferences are added, create `data/dev.benporter.BigClock.gschema.xml`, install it to `/usr/share/glib-2.0/schemas/`, and invoke `glib-compile-schemas` post-install.

## Packaging Targets
1. Classic distros: wrap the build/install steps in Deb/RPM specs.
2. Flatpak: create `dev.benporter.BigClock.yml` referencing the Meson build. Flatpak manifests unlock GNOME Software distribution by default.
