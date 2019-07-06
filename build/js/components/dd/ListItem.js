var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Tag, Component, Prop } from "../../Component.js";
import { html } from "../../Html.js";
let ListItem = class ListItem extends Component {
    constructor() {
        super(...arguments);
        this.text = "Title";
        this.sub = "";
        this.subsub = "";
        this.lead = "";
        this.trail = "";
        this.leadtype = "ico";
        this.trailtype = "ico";
    }
    render() {
        let icon_size = 3;
        if (this.sub)
            icon_size += 1.0;
        if (this.subsub)
            icon_size += 1.0;
        const lead = this.getIcon(this.lead, this.leadtype);
        const trail = this.getIcon(this.trail, this.trailtype);
        return html `
        <style>

        :host
        {
            display: block;
            box-sizing: border-box;
            overflow: hidden;

            height: var(--dd-li-height, ${icon_size}rem);
        }

        #container
        {
            height: 100%;
            display: flex;
            flex-direction: row;
            background-color: var(--default);

            transition:
                background-color;
            transition-duration: var(--transition-time);
        }
        #container:hover
        {
            background-color: var(--default-dark);
            cursor: pointer;
        }
        #container:active
        {
            background-color: var(--default-darker);
        }

        .icon
        {
            height: 100%;

            display: grid;
            place-items: center;

            box-sizing: border-box;
        }

        .icon>dd-icon
        {
            display: block;
            
            width:  ${icon_size}rem;
            height:  ${icon_size}rem;

            margin: 0 calc(var(--component-spacing) * 0.3);
            padding: calc(var(--component-spacing) * 0.3);

            box-sizing: border-box;
        }
        .icon>dd-fab
        {
            width:  ${icon_size}rem;
            height:  ${icon_size}rem;

            max-width: 2.5rem;
            max-height: 2.5rem;
        }
        .icon>img
        {
            width:  ${icon_size}rem;
            height:  ${icon_size}rem;

            object-fit: cover;
        }
        .icon>span
        {
            display: flex;
            justify-content: center;
            align-items: center;

            width:  ${icon_size}rem;
            height:  ${icon_size}rem;

            font-size: 0.7rem;
            opacity: 0.65;
        }

        .icon:first-child
        {
            display: ${!this.lead ? "none" : "grid"};
        }
        .icon:last-child
        {
            display: ${!this.trail ? "none" : "grid"};
        }
        
        .text
        {
            position: relative;

            height: ${icon_size}rem;
            width: calc(100% - ${2 * (icon_size - 3)}rem);

            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;

            padding-left:  ${this.leadtype !== "img" && this.lead ? "0" : "var(--component-spacing)"};
            padding-right: ${this.trailtype !== "img" && this.trail ? "0" : "var(--component-spacing)"};

            box-sizing: border-box;
            overflow: hidden;
        }
        .text::after
        {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: calc(100% + 0.6rem);
            height: 100%;

            transition:
                box-shadow;
            transition-duration: var(--transition-time);
            
            box-shadow: inset -0.6rem 0 0.3rem 0.3rem var(--default);
        }
        #container:hover .text::after
        {
            box-shadow: inset -0.6rem 0 0.3rem 0.3rem var(--default-dark);
        }
        #container:active .text::after
        {
            box-shadow: inset -0.6rem 0 0.3rem 0.3rem var(--default-darker);
        }

        .strong
        {
            
        }

        .weak
        {
            opacity: 0.65;
            font-size: 0.9rem;
        }

        </style>

        <div id="container">
            <div class="icon" @click="${(evt) => this.iconClick("lead", evt)}">${lead}</div>
            <div class="text">
                <div class="strong">${this.text}</div>
                <div class="weak">${this.sub}</div>
                <div class="weak">${this.subsub}</div>
            </div>
            <div class="icon" @click="${(evt) => this.iconClick("trail", evt)}">${trail}</div>
        </div>

        <slot>
        </slot>`;
    }
    getIcon(ico, type) {
        if (type === "ico")
            return html `<dd-icon icon="${ico}"></dd-icon>`;
        else if (type === "img")
            return html `<img src="${ico}"></img>`;
        else if (type === "fab")
            return html `<dd-fab icon="${ico}" style="box-shadow: none"></dd-fab>`;
        else if (type === "btn")
            return html `<dd-fab icon="${ico}" style="box-shadow: none"></dd-fab>`;
        else if (type === "txt")
            return html `<span>${ico}</span>`;
        else
            return html `<span>${ico}</span>`;
    }
    iconClick(fab, evt) {
        this.event(fab + "-click", { event: evt });
    }
};
__decorate([
    Prop()
], ListItem.prototype, "text", void 0);
__decorate([
    Prop()
], ListItem.prototype, "sub", void 0);
__decorate([
    Prop()
], ListItem.prototype, "subsub", void 0);
__decorate([
    Prop()
], ListItem.prototype, "lead", void 0);
__decorate([
    Prop()
], ListItem.prototype, "trail", void 0);
__decorate([
    Prop()
], ListItem.prototype, "leadtype", void 0);
__decorate([
    Prop()
], ListItem.prototype, "trailtype", void 0);
ListItem = __decorate([
    Tag("dd-li")
], ListItem);
export { ListItem };
