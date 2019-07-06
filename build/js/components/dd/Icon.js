var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Icon_1;
import { Component, Tag, Prop } from "../../Component.js";
import { html } from "../../Html.js";
let Icon = Icon_1 = class Icon extends Component {
    constructor() {
        super(...arguments);
        this.icon = "home";
    }
    render() {
        const icon = this.getIcon();
        return html `
        <style>

            :host
            {
                display: inline-flex;
                justify-content: center;
                align-items: center;

                width:  calc(1 * var(--icon-size));
                height: calc(1 * var(--icon-size));
            }

            slot
            {
                display: none;
            }

            svg, img, video
            {
                width: 100%;
                height: 100%;

                object-fit: contain;
            }

            svg
            {
                fill: currentColor;
            }

        </style>
        ${html([icon])}
        <slot></slot>`;
    }
    getIcon() {
        const ico = Icon_1.icon(this.icon
            .replace(/\s/g, "-")
            .replace(/_/g, "-")
            .replace(/\./g, "-"));
        if (ico)
            return ico;
        Icon_1._iconsToRender.add(this);
        return "ICO"; // Placeholder
    }
    static icon(name) {
        if (this._icons && name in this._icons && this._icons[name])
            return this._icons[name];
        else
            return null;
    }
    static iconsAreLoaded(icons) {
        this._icons = icons;
        for (const icon of this._iconsToRender)
            Component.render(icon);
        this._iconsToRender.clear();
    }
};
Icon._icons = {};
Icon._iconsToRender = new Set();
__decorate([
    Prop()
], Icon.prototype, "icon", void 0);
Icon = Icon_1 = __decorate([
    Tag("dd-icon")
], Icon);
export { Icon };
fetch("./icons.json")
    .then(response => response.json())
    .then(json => Icon.iconsAreLoaded(json))
    .catch(reason => console.warn("Failed to find icons file, will use placeholders", reason));
