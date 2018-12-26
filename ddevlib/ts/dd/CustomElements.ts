export function define (proto: Function, name?: string, style?: string)
{
    if (name === undefined)
        name = `dd-${proto.name}`.toLowerCase();
        
    if (style !== undefined)
    {
        let customElementStyleElement = document.getElementById("dd-custom-element-style");
        let head = document.head;

        if (!head)
        {
            head = document.createElement("head");
            document.appendChild(head);
        }

        if (!customElementStyleElement)
        {
            customElementStyleElement = document.createElement("style");
            customElementStyleElement.id = "dd-custom-element-style";
            head.insertAdjacentElement("afterbegin", customElementStyleElement);
        }

        customElementStyleElement.innerHTML += `

/*
 *  CUSTOM STYLE FOR [${name.toUpperCase()}]
 */

${style}

/*
 *  END OF [${name.toUpperCase()}]
 */

`;
    }
    
    customElements.define(name, proto);
}