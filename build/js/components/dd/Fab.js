var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Tag, Prop } from "../../Component.js";
import { html } from "../../Html.js";
let Fab = class Fab extends Component {
    constructor() {
        super(...arguments);
        this.icon = "add";
        this.color = "default";
        this.size = "normal";
    }
    render() {
        const size = this.getSize() * 3;
        return html `
        <style>
            :host
            {
                display: inline-block;

                border-radius: 100vw;

                box-shadow: var(--component-shadow);

                width:  calc(${size} * var(--icon-size));
                height: calc(${size} * var(--icon-size));
            }


            button
            {
                all: unset;

                width: 100%;
                height: 100%;

                border-radius: inherit;
                overflow: hidden;

                display: flex;
                justify-content: center;
                align-items: center;

                transition:
                    background-color;
                transition-duration: var(--transition-time);

                background-color: var(--${this.color});
                color: var(--text${this.color !== "default" ? "-alt" : ""})
            }
            button:hover
            {
                background-color: var(--${this.color}-dark);
                cursor: pointer;
            }
            button:active
            {
                background-color: var(--${this.color}-darker);
            }

            dd-icon
            {
                width:  calc(100% - 0.5rem);
                height: calc(100% - 0.5rem);
            }

            slot
            {
                display: none;
            }
        </style>
        <button>
            <dd-icon icon="${this.icon}"></dd-icon>
        </button>
        <slot></slot>
        `;
    }
    getSize() {
        switch (this.size) {
            case "big": return 1.2;
            case "bigger": return 1.5;
            case "small": return 0.7;
            default: return 1.0;
        }
    }
};
__decorate([
    Prop()
], Fab.prototype, "icon", void 0);
__decorate([
    Prop()
], Fab.prototype, "color", void 0);
__decorate([
    Prop()
], Fab.prototype, "size", void 0);
Fab = __decorate([
    Tag("dd-fab")
], Fab);
export { Fab };
