import { Template } from "./Template.js";

export type HtmlResult = 
{
    markup: string;
    args: unknown[];
}

export function html (template: TemplateStringsArray, ...args: unknown[]): HtmlResult
{
    return {
        markup: Template.markup(template),
        args
    }
}

export function render(data: HtmlResult, container: Element)
{
    const build = Template.build(data.markup);
    
    build.apply(data.args);

    container.appendChild(build.element);

    return build.apply;
}