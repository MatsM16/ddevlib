import { SyntaxCompiler } from "../SyntaxCompiler.js";
import { define } from "./CustomElements.js";

export class HTMLCodeEditorElement extends HTMLElement
{
    inputElement: HTMLDivElement;
    outputElement: HTMLDivElement;

    constructor()
    {
        super();
        
        const initialCode = this.innerText;
        this.innerHTML = "";

        this.inputElement = document.createElement("div");
        this.outputElement = document.createElement("div");

        this.inputElement.contentEditable = "true";
        this.inputElement.spellcheck = false;
        this.inputElement.classList.add("input");
        this.outputElement.classList.add("output");

        this.appendChild(this.outputElement);
        this.appendChild(this.inputElement);

        this.inputElement.oninput = () => {
            //@ts-ignore
            const compiler = SyntaxCompiler.compiler(this.language);
            const html = compiler(this.value);
            this.setOutput(html);
        }

        this.inputElement.onkeydown = evt => {
            if (evt.key === "Tab")
            {
                evt.preventDefault();

                this.insert("    ");
            }
        }

        this.value = initialCode;
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
        this.inputElement.oninput();
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
}

define(HTMLCodeEditorElement, "dd-editor", `
dd-editor
{
    display: block;
    width: 500px;
    height: 500px;

    padding: 2em;
    border: 1px solid gray;

    position: relative;

    overflow: auto;

    font-family: var(--font-code) !important;
    
    white-space: pre;
}
dd-editor::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    background-color: rgba(0, 0, 0, 0.5);
}
dd-editor::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.5)
}
dd-editor .output,
dd-editor .input{
    display: block;
    position: absolute;
    
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;

    padding: inherit;

    outline: none;

    overflow: visible; 
    text-overflow: clip;
    white-space: nowrap;
}

dd-editor .input 
{
    caret-color: var(--text);
    color: transparent;
    background-color: transparent;
}

.token.object,
.token.tag
{
    color: var(--error);
}

.token.string
{
    color: var(--warning);
}

.token.number
{
    color: var(--link);
}
.token.boolean,
.token.null
{
    color: var(--info);
}
.token.keyword
{
    color: var(--info-alt);
}

.token.function,
.token.property
{
    color: var(--primary);
}

.token.comment
{
    color: var(--success);
}`);