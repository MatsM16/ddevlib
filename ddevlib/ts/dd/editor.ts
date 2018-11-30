import { MarkupCompiler, CompilerLanguage } from "../MarkupCompiler.js";

export class Editor extends HTMLElement
{
    inputElement: HTMLDivElement;
    outputElement: HTMLDivElement;

    constructor()
    {
        super();
        this.innerHTML = "";

        this.inputElement = document.createElement("div");
        this.outputElement = document.createElement("div");

        this.inputElement.contentEditable = "true";
        this.inputElement.spellcheck = false;
        this.inputElement.classList.add("input");
        this.outputElement.classList.add("output");

        const style = document.createElement("style");
        style.textContent = this.defaultStyle;

        this.appendChild(this.outputElement);
        this.appendChild(this.inputElement);

        this.inputElement.oninput = () => {
            const compiler = MarkupCompiler.compiler(this.language as CompilerLanguage);
            const html = compiler.compile(this.value);
            this.setOutput(html);
        }

        this.inputElement.onkeydown = evt => {
            if (evt.key === "Tab")
            {
                evt.preventDefault();

                this.insert("    ");
            }
        }
    }

    insert(text: string)
    {
        this.inputElement.focus();
        document.execCommand("insertText", false, text);
    }

    setOutput (html: string)
    {
        this.outputElement.innerHTML = html;
    }

    get value ()
    {
        return this.inputElement.innerText;
    }
    set value(code)
    {
        this.inputElement.innerText = code;
        //@ts-ignore
        this.inputElement.oninput(null);
    }

    get language ()
    {
        const lang = this.getAttribute("lang");

        if (lang === null || lang === undefined)
            return "TEXT";

        return lang.toUpperCase();
    }

    get defaultStyle ()
    {
        return `
dd-editor
{
    display: block;
    width: 500px;
    height: 500px;
}

dd-editor .output,
dd-editor .input {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
}

`
    }

    static define()
    {
        customElements.define('dd-editor', Editor);
    }
}

Editor.define();