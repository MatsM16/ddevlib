var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Tag, Prop, Method } from "../../Component.js";
import { html } from "../../Html.js";
let Menu = class Menu extends Component {
    constructor() {
        super(...arguments);
        this.evt = "click";
        this.animationTime = 0.2;
        this.forEl = undefined;
    }
    attach(el) {
        el.addEventListener(this.evt, this.openOnEvent.bind(this));
        this.forEl = el;
    }
    render() {
        return html `
        <style>
        :host
        {
            position: absolute;
            left: 0;
            top: 0;
            
            display: block;
            width: 0;
            height: 0;
        }
        .container
        {
            display: none;

            position: absolute;
            left: var(--x, 0);
            top: var(--y, 0);
            
            background-color: var(--default);
            padding: var(--component-spacing) 0;

            border-radius: var(--component-radius);

            box-shadow: var(--container-shadow);

            transition:
                transform,
                opacity;
            transition-duration: ${this.animationTime}s;

            transform: scale(0.9);
        }

        .container.hide
        {
            opacity: 0.0;
            transform: scale(0.6);
        }

        slot
        {
        }

        </style>
        <div class="container hide" style="--x: 0px; --y: 0px;" @click="${() => this.setVisible(false)}">
            <slot></slot>
        </div>
        `;
    }
    setup() {
        this.setVisible(false);
        const attach = document.getElementById(this.attr("for") || "");
        if (attach) {
            this.attach(attach);
        }
        document.addEventListener("scroll", this.closeOnEvent.bind(this));
        document.addEventListener("click", this.closeOnEvent.bind(this));
        document.addEventListener("contextmenu", this.closeOnEvent.bind(this));
    }
    closeOnEvent(evt) {
        const target = evt.target;
        if (!this.forEl && (evt.type === "click" || evt.type == "contextmenu"))
            return;
        if (target) {
            const equalsOrContains = (el) => {
                if (!el)
                    return false;
                if (el === target)
                    return true;
                for (const child of el.childNodes)
                    if (equalsOrContains(child))
                        return true;
                return false;
            };
            if (!equalsOrContains(this.element) && !equalsOrContains(this.forEl)) {
                this.setVisible(false);
                console.log(this.forEl);
            }
        }
    }
    open(x, y) {
        this.setVisible(true);
        const container = this.query(".container");
        if (x + container.offsetWidth - window.scrollX > window.innerWidth)
            x -= container.offsetWidth;
        if (y + container.offsetHeight - window.scrollY > window.innerHeight)
            y -= container.offsetHeight;
        container.style.setProperty("--x", x + "px");
        container.style.setProperty("--y", y + "px");
    }
    openOnEvent(evt) {
        evt.preventDefault();
        this.open(evt.pageX, evt.pageY);
    }
    setVisible(visible) {
        const style = this.query(".container").style;
        visible
            ? style.display = "block"
            : setTimeout(() => style.display = "none", this.animationTime * 1000);
        // A hack/fix for something, can't remember what
        setTimeout(() => {
            const container = this.query(".container");
            if (container) {
                visible
                    ? container.classList.remove("hide")
                    : container.classList.add("hide");
            }
        }, 10);
    }
};
__decorate([
    Prop()
], Menu.prototype, "evt", void 0);
__decorate([
    Method()
], Menu.prototype, "attach", null);
__decorate([
    Method()
], Menu.prototype, "open", null);
Menu = __decorate([
    Tag("dd-menu")
], Menu);
export { Menu };
