import { Component, Prop, Tag, Method, On } from "../../Component.js";
import { html } from "../../Html.js";

@Tag("dd-sheet")
export class Sheet extends Component
{
    @Prop()
    from = "bottom";

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

            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            max-width: 100vw;
            height: 100vh;

            z-index: 50;
        }

        ::-webkit-scrollbar
        {
            width: 0;
        }

        .container
        {
            display: block;
            position: fixed;

            background-color: var(--default);
            padding: var(--component-spacing);

            box-shadow: 
                var(--container-shadow),
                0px 0px 10vmax 100vmax rgba(0, 0, 0, 0.5);
            box-sizing: border-box;
            
            transition:
                transform,
                opacity;
                transition-duration: ${this.animationTime}s;
        }

        .container.left
        {
            height: 100vh;
            min-width: var(--container-spacing);
            max-width: calc(100vw - var(--container-spacing));

            border-top-right-radius: var(--container-radius);
            border-bottom-right-radius: var(--container-radius);
        }
        .container.left.hide
        {
            opacity: 0;
            transform: translateX(-100%) translateX(calc(-1 * var(--component-spacing)));
        }

        .container.right
        {
            right: 0;
            height: 100vh;
            min-width: var(--container-spacing);
            max-width: calc(100vw - var(--container-spacing));

            border-top-left-radius: var(--container-radius);
            border-bottom-left-radius: var(--container-radius);
        }
        .container.right.hide
        {
            opacity: 0;
            transform: translateX(100%) translateX(var(--component-spacing));
        }

        .container.bottom
        {
            width: 100%;
            min-height: var(--container-spacing);
            bottom: 0;

            border-top-left-radius: var(--container-radius);
            border-top-right-radius: var(--container-radius);
        }
        .container.bottom.hide
        {
            opacity: 0;
            transform: translateY(100%) translateY(var(--component-spacing));
        }

        .container.top
        {
            width: 100%;
            min-height: var(--container-spacing);
            top: 0;

            border-bottom-left-radius: var(--container-radius);
            border-bottom-right-radius: var(--container-radius);
        }
        .container.top.hide
        {
            opacity: 0;
            transform: translateY(-100%) translateY(calc(-1 * var(--component-spacing)));
        }
        
        .container.back
        {
            width:  calc(100% - var(--container-spacing) * 2);
            height: calc(100% - var(--container-spacing) * 2);
            min-height: var(--container-spacing);
            left: var(--container-spacing);
            top: var(--container-spacing);

            border-radius: var(--container-radius);
        }
        .container.back.hide
        {
            opacity: 0;
            transform: scale(0.6);
        }

        .clicker
        {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        </style>
        <div class="clicker" @click="${() => this.setVisible(false)}"></div>
        <div class="container hide ${this.from}">
            <slot></slot>
        </div>`;
    }

    setVisible(visible: boolean)
    {
        const style = (this.root.host as HTMLElement).style;

        visible
            ? style.display = "block"
            : setTimeout(() => style.display = "none", this.animationTime * 1000);
        
        setTimeout(() => 
        {
            const container = this.query(".container");
            if (container) visible
                ? container.classList.remove("hide")
                : container.classList.add("hide")
        }, 10)
    }
}