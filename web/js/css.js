import { ContextMenu } from "/src/js/ddev/contextmenu.js";

const create = () => ContextMenu.create(document.body, [
    {
        text: "Flatly",
        onclick: () => setTheme("flatly"),
        description: "Set the theme to flatly"
    },
    {
        text: "Darkly",
        onclick: () => setTheme("darkly"),
        description: "Set the theme to darkly"
    },
    {
        text: "Flatly (Orica)",
        onclick: () => setTheme("orica-flatly"),
        description: "Set the theme to flatly (Orica version)"
    },
    {
        text: "Darkly (Orica)",
        onclick: () => setTheme("orica-darkly"),
        description: "Set the theme to darkly (Orica version)"
    },
    {
        text: "Superhero",
        onclick: () => setTheme("superhero"),
        description: "Set the theme to superhero"
    },
    {
        text: "Lux",
        onclick: () => setTheme("lux"),
        description: "Set the theme to lux"
    },
    {
        text: "Pulse",
        onclick: () => setTheme("pulse"),
        description: "Set the theme to pulse"
    },
    {
        text: "Cyborg",
        onclick: () => setTheme("cyborg"),
        description: "Set the theme to cyborg"
    }
]);

create();
const setTheme = (name) => {
    console.log(`Changing theme to "${name}"`);
    document.body.parentElement.setAttribute("data-theme", name);
};