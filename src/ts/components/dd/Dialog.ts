import { Component, Tag, Prop, Method, On } from "../../Component.js";
import { html } from "../../Html.js";

@Tag("dd-dialog", ["./css/std.css"])
export class Dialog extends Component
{
    @Prop()
    heading = "";

    @Prop()
    options = "ok";

    @Prop()
    default = "";

    @Prop()
    value = "";

    @Prop()
    color = "primary";

    @Method()
    show() { this.setVisible(true); }

    @Method()
    hide() { this.setVisible(false) }

    animationTime = 0.2;

    render()
    {
        return html`
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
                ${this.options.split(" ").map(opt => html`<button @click="${() => this.select(opt)}" class="btn ${this.color}">${opt.replace(/_/g, " ")}</button>`)}
            </div>
        </div>`;
    }

    setVisible(visible: boolean)
    {
        const style = (this.root.host as HTMLElement).style;

        visible
            ? style.display = "flex"
            : setTimeout(() => style.display = "none", this.animationTime * 1000);

        setTimeout(() => 
        {
            const container = this.query(".container");
            if (container) visible
                ? container.classList.remove("hide")
                : container.classList.add("hide")
        }, 10)
    }

    select(option?: string)
    {
        console.log("Potato");

        if (!option)
            option = this.default;

        if (!option)
            option = this.options.split(" ")[0];

        if (!option)
            option = "ok";

        option = option.toLowerCase();

        this.value = option;
        this.event("select", {value: this.value}, {boubles: false, cancelable: true})

        this.setVisible(false);
    }
}