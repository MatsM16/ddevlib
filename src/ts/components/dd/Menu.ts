import { Component, Tag, Prop, Method } from "../../Component.js";
import { html } from "../../Html.js";

@Tag("dd-menu")
export class Menu extends Component
{
    @Prop()
    evt = "click";

    @Method()
    attach(el: HTMLElement)
    {
        el.addEventListener(this.evt, this.openOnEvent.bind(this) as EventListener);
        this.forEl = el;
    }

    animationTime = 0.2;

    forEl: Element | undefined = undefined;

    render()
    {
        return html`
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

    setup()
    {
        this.setVisible(false);

        const attach = document.getElementById(this.attr("for") || "");
        if (attach)
        {
            this.attach(attach);
        }

        document.addEventListener("scroll", this.closeOnEvent.bind(this));
        document.addEventListener("click", this.closeOnEvent.bind(this));
        document.addEventListener("contextmenu", this.closeOnEvent.bind(this));
    }

    closeOnEvent(evt: Event)
    {
        const target = evt.target as HTMLElement | null;

        if (!this.forEl && (evt.type === "click" || evt.type == "contextmenu"))
            return;

        if (target)
        {
            const equalsOrContains = (el: Node | null | undefined) =>
            {
                if (!el)
                    return false;

                if (el === target)
                    return true;

                for (const child of el.childNodes)
                    if (equalsOrContains(child))
                        return true;

                return false;
            }

            if (!equalsOrContains(this.element) && !equalsOrContains(this.forEl))
            {
                this.setVisible(false);
                console.log(this.forEl)
            }
        }
    }

    @Method()
    open(x: number, y: number)
    {
        this.setVisible(true);
        
        const container = this.query(".container") as HTMLElement;

        if (x + container.offsetWidth - window.scrollX > window.innerWidth)
            x -= container.offsetWidth;

        if (y + container.offsetHeight - window.scrollY > window.innerHeight)
            y -= container.offsetHeight;

        container.style.setProperty("--x", x + "px");
        container.style.setProperty("--y", y + "px");
    }

    openOnEvent(evt: MouseEvent)
    {
        evt.preventDefault();

        this.open(evt.pageX, evt.pageY);
    }

    setVisible(visible: boolean)
    {
        const style = (this.query(".container") as HTMLElement).style;

        visible
            ? style.display = "block"
            : setTimeout(() => style.display = "none", this.animationTime * 1000);

        // A hack/fix for something, can't remember what
        setTimeout(() => 
        {
            const container = this.query(".container") as HTMLElement | null;
            if (container)
            {
                visible
                    ? container.classList.remove("hide")
                    : container.classList.add("hide");
            }
        }, 10)
    }
}