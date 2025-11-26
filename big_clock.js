#!/usr/bin/env gjs
/*
 * Big Clock - GTK 3 digital clock implemented in GJS.
 */

imports.gi.versions.Gdk = "3.0";
imports.gi.versions.Gtk = "3.0";
imports.gi.versions.Pango = "1.0";

const { Gdk, Gio, GLib, Gtk, GObject, Pango } = imports.gi;

const BigClockWindow = GObject.registerClass(
class BigClockWindow extends Gtk.ApplicationWindow {
    constructor(app) {
        super({
            application: app,
            title: "Big Clock",
            default_width: 480,
            default_height: 200,
            resizable: true,
        });

        this._label = new Gtk.Label({
            label: "",
            name: "clock-label",
            hexpand: true,
            vexpand: true,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
            justify: Gtk.Justification.CENTER,
        });

        this.add(this._label);
        this.show_all();

        this._currentFontSize = 0;
        this.connect("size-allocate", (_widget, allocation) =>
            this._applyResponsiveFont(allocation.height)
        );

        this._setupCss();
        this._updateTime();
        this._applyResponsiveFont(this.get_allocated_height() || 200);
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => this._updateTime());
    }

    _setupCss() {
        const css = `
            window {
                background-color: #000000;
            }

            label#clock-label {
                font-weight: bold;
                color: #00ffcc;
            }
        `;
        const provider = new Gtk.CssProvider();
        provider.load_from_data(css);

        const screen = Gdk.Screen.get_default();
        if (screen) {
            Gtk.StyleContext.add_provider_for_screen(
                screen,
                provider,
                Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
            );
        }
    }

    _updateTime() {
        const dt = GLib.DateTime.new_now_local();
        this._label.set_label(dt.format("%H:%M:%S"));
        return GLib.SOURCE_CONTINUE;
    }

    _applyResponsiveFont(height) {
        const usableHeight = Math.max(height, 1);
        const targetSize = Math.max(64, Math.floor(usableHeight * 0.45));
        if (targetSize === this._currentFontSize) {
            return;
        }
        this._currentFontSize = targetSize;
        const desc = Pango.FontDescription.from_string(`Monospace ${targetSize}`);
        this._label.override_font(desc);
    }
});

const BigClock = GObject.registerClass(
class BigClock extends Gtk.Application {
    constructor() {
        super({
            application_id: "com.example.BigClock",
            flags: Gio.ApplicationFlags.FLAGS_NONE,
        });
    }

    vfunc_activate() {
        let window = this.get_active_window();
        if (!window) {
            window = new BigClockWindow(this);
        }
        window.present();
    }
});

function main(argv) {
    const app = new BigClock();
    return app.run(argv);
}

main(ARGV);
