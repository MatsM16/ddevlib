export declare namespace Form {
    function value(form: string | HTMLElement, ...fields: string[]): any;
    function json(form: string | HTMLElement, ...fields: string[]): string;
    function clear(form: string | HTMLElement, ...fields: string[]): void;
    function apply(form: string | HTMLElement, data: any): void;
    function on(form: string | HTMLElement, event: "click" | "input", callback: Function, ...elements: (HTMLElement | string)[]): void;
}
export declare namespace Form._Settings {
    let nameBeforeId: boolean;
    let defaultDate: "TODAY" | string | number;
}
export declare namespace Form._Helper {
    function form(form: string | HTMLElement): HTMLElement;
    function isInputElement(element: HTMLElement): boolean;
    function getFieldElements(element: HTMLElement): HTMLElement[];
    function nameOfField(field: HTMLElement): string;
    function valueOfField(field: HTMLElement): any;
    function valueOfInput(field: HTMLInputElement): any;
    function applyField(field: HTMLElement, value: any): void;
    function applyInputField(field: HTMLInputElement, value: any): void;
    function getFields(form: HTMLElement, fieldNames?: string[]): Map<string, {
        field: HTMLElement;
        name: string;
        value: any;
    }>;
}
