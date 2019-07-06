import { Template } from "./Template.js";
export function html(template, ...args) {
    return {
        markup: Template.markup(template),
        args
    };
}
export function render(data, container) {
    const build = Template.build(data.markup);
    build.apply(data.args);
    container.appendChild(build.element);
    return build.apply;
}
