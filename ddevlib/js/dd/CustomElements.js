export function define(proto, name, style) {
    if (name === undefined)
        name = `dd-${proto.name}`.toLowerCase();
    if (style !== undefined) {
        let customElementStyleElement = document.getElementById("dd-custom-element-style");
        let head = document.head;
        if (!head) {
            head = document.createElement("head");
            document.appendChild(head);
        }
        if (!customElementStyleElement) {
            customElementStyleElement = document.createElement("style");
            customElementStyleElement.id = "dd-custom-element-style";
            head.appendChild(customElementStyleElement);
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
//# sourceMappingURL=CustomElements.js.map