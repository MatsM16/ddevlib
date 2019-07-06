var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Tag, Prop, Method } from "../../Component.js";
import { html } from "../../Html.js";
let Dialog = class Dialog extends Component {
    constructor() {
        super(...arguments);
        this.heading = "";
        this.options = "ok";
        this.default = "";
        this.value = "";
        this.color = "primary";
        this.animationTime = 0.2;
    }
    show() { this.setVisible(true); }
    hide() { this.setVisible(false); }
    render() {
        return html `
        <style>
            :host
            {
                display: none;
                justify-content: center;
                align-items: center;

                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;

                z-index: 100;
            }

            ::-webkit-scrollbar
            {
                width: 0;
            }
            
            .container
            {
                position: absolute;

                display: grid;
                box-sizing: border-box;
                grid-template-columns: 1fr;
                grid-template-rows: auto 1fr auto;
                grid-gap: var(--component-spacing);

                background-color: var(--default);
                border-radius: var(--container-radius);
                
                box-shadow: 
                    var(--container-shadow),
                    0px 0px 10vmax 100vmax rgba(0, 0, 0, 0.5);

                max-width: calc(100vw - 2 * var(--container-spacing));
                min-width: calc(320px - 2 * var(--container-spacing));
                
                max-height: calc(100vh - 2 * var(--container-spacing));

                transition:
                    transform,
                    opacity;
                transition-duration: ${this.animationTime}s;
            }

            .container.hide
            {
                opacity: 0.0;
                transform: scale(0.6);
            }

            .title
            {
                font-size: 1.2rem;
                font-weight: bold;
                color: var(--${this.color});
                -webkit-text-fill-color: var(--${this.color});
            }

            .buttons
            {
                display: flex;
                justify-content: flex-end;
                align-items: center;

                font-size: 0.8rem;
                font-weight: bold;
            }
            .buttons button
            {

                text-transform: uppercase !important;
            }
            .buttons.hide
            {
                display: none;
            }

            .content
            {
                display: block;
                overflow-y: scroll;
                overflow-x: hidden;
            }

            .clicker
            {
                position: absolute;
                width: 100%;
                height: 100%;
            }
        </style>
        <div class="clicker" @click="${() => this.select()}"></div>
        <div class="container hide">
            <div class="title">${this.heading}</div>
            <slot class="content"></slot>
            <div class="buttons ${this.options ? "" : "hide"}">
                ${this.options.split(" ").map(opt => html `<button @click="${() => this.select(opt)}" class="btn ${this.color}">${opt.replace(/_/g, " ")}</button>`)}
            </div>
        </div>`;
    }
    setVisible(visible) {
        const style = this.root.host.style;
        visible
            ? style.display = "flex"
            : setTimeout(() => style.display = "none", this.animationTime * 1000);
        setTimeout(() => {
            const container = this.query(".container");
            if (container)
                visible
                    ? container.classList.remove("hide")
                    : container.classList.add("hide");
        }, 10);
    }
    select(option) {
        console.log("Potato");
        if (!option)
            option = this.default;
        if (!option)
            option = this.options.split(" ")[0];
        if (!option)
            option = "ok";
        option = option.toLowerCase();
        this.value = option;
        this.event("select", { value: this.value }, { boubles: false, cancelable: true });
        this.setVisible(false);
    }
};
__decorate([
    Prop()
], Dialog.prototype, "heading", void 0);
__decorate([
    Prop()
], Dialog.prototype, "options", void 0);
__decorate([
    Prop()
], Dialog.prototype, "default", void 0);
__decorate([
    Prop()
], Dialog.prototype, "value", void 0);
__decorate([
    Prop()
], Dialog.prototype, "color", void 0);
__decorate([
    Method()
], Dialog.prototype, "show", null);
__decorate([
    Method()
], Dialog.prototype, "hide", null);
Dialog = __decorate([
    Tag("dd-dialog", ["./src/css/std.css"])
], Dialog);
export { Dialog };
