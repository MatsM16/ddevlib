import { Syntax } from "../SyntaxCompiler.js";
export declare class HTMLCodeEditorElement extends HTMLElement {
    inputElement: HTMLDivElement;
    outputElement: HTMLDivElement;
    constructor();
    insert(text: string): void;
    compile(): void;
    copy(): void;
    download(): void;
    value: string;
    readonly: boolean;
    language: Syntax;
    readonly src: string | null;
    setSource(src: string): Promise<void>;
}
