#!/usr/bin/env gjs
/*
 * Big Clock - GTK 3 digital clock implemented in GJS.
 */

imports.gi.versions.Gdk = "3.0";
imports.gi.versions.Gtk = "3.0";
imports.gi.versions.Pango = "1.0";

const { Gdk, Gio, GLib, Gtk, GObject, Pango } = imports.gi;
const Cairo = imports.cairo;

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
        this._transparentBackground = true;
        this._initContextMenu();

        this.set_app_paintable(true);
        this.connect("screen-changed", this._onScreenChanged.bind(this));
        this.connect("draw", this._clearBackground.bind(this));
        this._applyRgbaVisual();

        this._label = new Gtk.Label({
            label: "",
            name: "clock-label",
            hexpand: true,
            vexpand: true,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
            justify: Gtk.Justification.CENTER,
        });

        this._eventBox = new Gtk.EventBox({
            visible_window: false,
        });
        this._eventBox.add_events(Gdk.EventMask.BUTTON_PRESS_MASK);
        this._eventBox.add(this._label);
        this._eventBox.connect("button-press-event", this._onButtonPressEvent.bind(this));

        this.add(this._eventBox);
        this.show_all();

        this._currentFontSize = 0;
        this.connect("size-allocate", (_widget, allocation) =>
            this._applyResponsiveFont(allocation.height)
        );

        this._setupCss();
        this._updateTime();
        this._applyResponsiveFont(this.get_allocated_height() || 200);
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => this._updateTime());
        this._setTransparentBackground(this._transparentBackground);
    }

    _setupCss() {
        const css = `
            window {
                background-color: transparent;
            }

            window.solid-background {
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

    _initContextMenu() {
        this._contextMenu = new Gtk.Menu();
        this._transparentMenuItem = new Gtk.CheckMenuItem({
            label: "Transparency",
            active: this._transparentBackground,
        });
        this._transparentMenuItem.connect("toggled", (item) =>
            this._setTransparentBackground(item.get_active())
        );
        this._contextMenu.append(this._transparentMenuItem);
        this._contextMenu.show_all();
    }

    _onButtonPressEvent(_widget, event) {
        let buttonValue = typeof event.button === "number" ? event.button : 0;
        if (typeof event.get_button === "function") {
            const [, extractedButton] = event.get_button();
            if (typeof extractedButton === "number" && extractedButton > 0) {
                buttonValue = extractedButton;
            }
        }

        if (buttonValue === Gdk.BUTTON_SECONDARY) {
            if (this._contextMenu.popup_at_pointer) {
                this._contextMenu.popup_at_pointer(event);
            } else {
                this._contextMenu.popup(null, null, null, null, buttonValue, event.time);
            }
            return true;
        }
        return false;
    }

    _setTransparentBackground(isTransparent) {
        this._transparentBackground = isTransparent;
        const context = this.get_style_context();
        if (isTransparent) {
            context.remove_class("solid-background");
        } else {
            context.add_class("solid-background");
        }
        if (this._transparentMenuItem && this._transparentMenuItem.get_active() !== isTransparent) {
            this._transparentMenuItem.set_active(isTransparent);
        }
        this.queue_draw();
    }

    _applyRgbaVisual() {
        const screen = this.get_screen();
        if (!screen) {
            return;
        }
        const rgbaVisual = screen.get_rgba_visual();
        if (rgbaVisual) {
            this.set_visual(rgbaVisual);
        }
    }

    _onScreenChanged(_widget, _previousScreen) {
        this._applyRgbaVisual();
    }

    _clearBackground(widget, cr) {
        if (this._transparentBackground) {
            cr.setSourceRGBA(0, 0, 0, 0);
            cr.setOperator(Cairo.Operator.SOURCE);
            cr.paint();
            cr.setOperator(Cairo.Operator.OVER);
        } else {
            const context = widget.get_style_context();
            const allocation = widget.get_allocation();
            context.save();
            Gtk.render_background(
                context,
                cr,
                allocation.x,
                allocation.y,
                allocation.width,
                allocation.height
            );
            context.restore();
        }
        return false;
    }
});

const BigClock = GObject.registerClass(
class BigClock extends Gtk.Application {
    constructor() {
        super({
            application_id: "dev.benporter.BigClock",
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
