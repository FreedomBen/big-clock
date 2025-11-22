#!/usr/bin/env gjs
/*
 * Big Clock - GTK 3 digital clock implemented in GJS.
 */

imports.gi.versions.Gdk = "3.0";
imports.gi.versions.Gtk = "3.0";

const { Gdk, Gio, GLib, Gtk, GObject } = imports.gi;

const BigClockWindow = GObject.registerClass(
class BigClockWindow extends Gtk.ApplicationWindow {
    constructor(app) {
        super({
            application: app,
            title: "Big Clock",
            default_width: 480,
            default_height: 200,
            resizable: false,
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

        this._setupCss();
        this._updateTime();
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => this._updateTime());
    }

    _setupCss() {
        const css = `
            window {
                background-color: #000000;
            }

            label#clock-label {
                font-size: 96px;
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
