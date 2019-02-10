import { SyntaxCompiler, Syntax } from "../SyntaxCompiler.js";
import { define } from "./Define.js";
import { Web } from "../Web.js";
import { ContextMenu } from "../ContextMenu.js";

export class HTMLCodeEditorElement extends HTMLElement
{
    inputElement: HTMLDivElement;
    outputElement: HTMLDivElement;

    constructor()
    {
        super();
        
        //
        // Create and configure elements
        //
        this.innerHTML = "";

        this.inputElement = document.createElement("div");
        this.outputElement = document.createElement("div");

        this.inputElement.contentEditable = "true";
        this.inputElement.spellcheck = false;
        this.inputElement.classList.add("input");
        this.outputElement.classList.add("output");

        //
        // Add elements to document
        //
        this.appendChild(this.outputElement);
        this.appendChild(this.inputElement);

        //
        // Setup events
        //
        this.inputElement.oninput = () => { this.compile(); }

        this.onpaste = e =>
        {
            e.preventDefault();
            e.stopPropagation();

            const data = e.clipboardData.getData("text");
            this.insert(data);
        }

        this.inputElement.onkeydown = evt => {
            if (!this.readonly && evt.key === "Tab")
            {
                evt.preventDefault();

                this.insert("    ");
            }
        }

        //
        // Configure edior
        //
        this.readonly = this.hasAttribute("readonly");

        if (this.src) this.setSource(this.src);

        const ctx = new ContextMenu(
            {
                text: "Download",
                onclick: () => this.download(),
                border_under: true,
                description: "Download the code to a local file"
            },
            {
                text: "Copy",
                onclick: () => this.copy(),
                description: "Copy all the present code"
            }
        );
    }

    insert(text: string)
    {
        this.inputElement.focus();
        document.execCommand("insertText", false, text);
    }

    compile()
    {
        const html = SyntaxCompiler.compile(this.value, this.language);

        this.outputElement.innerHTML = html;
    }

    copy()
    {
        const copyElementContent = (element: HTMLElement) => 
        {
            element.focus();

            const toCopy = document.createRange();
            toCopy.selectNodeContents(element);
    
            const selection = window.getSelection();
            
            const old = [];
            for (let i = 0; i < selection.rangeCount; i++)
                old.push(selection.getRangeAt(i));

            selection.removeAllRanges();
            selection.addRange(toCopy);
            document.execCommand("copy");

            selection.removeRange(toCopy);
            for (const range of old)
                selection.addRange(range);
        }

        copyElementContent(this.inputElement);
    }

    download()
    {
        const name = "code." + this.lang.toLowerCase();

        //
        // Create "link" to hold the code data blob
        //
        let link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([this.value], {}));
        link.download = name;
        
        //
        // "Click" and remove the link
        //
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    get value ()
    {
        return this.inputElement.innerText;
    }
    set value(code)
    {
        this.inputElement.innerText = code;
        this.compile();
    }

    get readonly ()
    {
        return this.hasAttribute("readonly");
    }
    set readonly (readonly: boolean)
    {
        if (readonly)
        {
            this.setAttribute("readonly", "");
            this.inputElement.setAttribute("contenteditable", "false");
        }
        else
        {
            this.removeAttribute("readonly");
            this.inputElement.setAttribute("contenteditable", "true");
        }
    }

    get language ()
    {
        const lang = this.getAttribute("lang");

        if (lang === null || lang === undefined)
            return "NO SYNTAX" as Syntax;

        return lang.toUpperCase() as Syntax;
    }
    set language (lang: Syntax)
    {
        if (lang === null || lang === undefined)
            lang = "" as Syntax;
        
        this.setAttribute("lang", lang.toUpperCase());
    }

    get src ()
    {
        return this.getAttribute("src");
    }
    async setSource(src: string)
    {
        const message_loading = 
        `<p class="message info">Loading resource...</p>`;

        const message_failed = 
        `<p class="message error">Failed to load resource!</p>`;
        
        this.outputElement.innerHTML = message_loading;
        

        try
        {
            const data = await Web.get(src, "TEXT");

            if (data === null || data === undefined)
            {
                this.outputElement.innerHTML = message_failed;
                return;
            }
            
            if (typeof data !== "string")
            {
                this.outputElement.innerHTML = message_failed;
                return;
            }

            this.value = data;
            this.setAttribute("src", src);
                
        }
        catch
        {
            this.outputElement.innerHTML = message_failed;
        }
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

    font-family: var(--font-code, monospace) !important;
    
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

    white-space: pre;
    unicode-bidi: embed;
}

dd-editor .output .message
{
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
}

dd-editor .output .message.error {
    background: var(--error);
    color: var(--text-alt);
}

dd-editor .output .message.info {
    background: var(--info);
    color: var(--text-alt);
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