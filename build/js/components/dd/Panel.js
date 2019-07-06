var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Tag, Prop } from "../../Component.js";
import { html } from "../../Html.js";
let Panel = class Panel extends Component {
    constructor() {
        super(...arguments);
        this.color = "default";
    }
    render() {
        return html `
        <style>
            :host 
            {
                display: block;

                box-shadow: var(--container-shadow);
                box-sizing: border-box;
                border-radius: var(--container-radius);

                background-color: var(--${this.color});
                color: var(--${(this.color === "default") ? "text" : "text-alt"});
            }

            slot
            {
                display: block;
                padding: var(--container-spacing);
            }

        </style>
        <slot>

        </slot>
        `;
    }
};
__decorate([
    Prop()
], Panel.prototype, "color", void 0);
Panel = __decorate([
    Tag("dd-panel")
], Panel);
export { Panel };
