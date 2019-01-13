import { ContextMenu } from "/src/js/ddev/contextmenu.js";
ContextMenu.loadCSS();

const create = () => ContextMenu.create(document.body, [
    {
        text: "Flatly",
        func: () => setTheme("flatly"),
        description: "Set the theme to flatly"
    },
    {
        text: "Darkly",
        func: () => setTheme("darkly"),
        description: "Set the theme to darkly"
    },
    {
        text: "Flatly (Orica)",
        func: () => setTheme("orica-flatly"),
        description: "Set the theme to flatly (Orica version)"
    },
    {
        text: "Darkly (Orica)",
        func: () => setTheme("orica-darkly"),
        description: "Set the theme to darkly (Orica version)"
    },
    {
        text: "Superhero",
        func: () => setTheme("superhero"),
        description: "Set the theme to superhero"
    },
    {
        text: "Lux",
        func: () => setTheme("lux"),
        description: "Set the theme to lux"
    },
    {
        text: "Pulse",
        func: () => setTheme("pulse"),
        description: "Set the theme to pulse"
    },
    {
        text: "Cyborg",
        func: () => setTheme("cyborg"),
        description: "Set the theme to cyborg"
    }
]);

create();
const setTheme = (name) => {
    console.log(`Changing theme to "${name}"`);
    document.body.parentElement.setAttribute("data-theme", name);
};