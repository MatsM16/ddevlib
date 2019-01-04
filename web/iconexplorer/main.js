import { getIconList } from "./getIconList.js";
(async () => {
    const icons = await getIconList();
    const searchSuggestions = document.getElementById("search-suggestions");
    const iconContainer = document.getElementById("icon-container");

    for (const icon of icons)
    {
        if (icon)
            searchSuggestions.innerHTML += `<option>${icon}</option>`;
    }

    for (const icon of icons)
    {
        if (icon)
        {
            const el = document.createElement("dd-icon");

            el.setAttribute("title", icon);
            el.setIcon(icon);

            iconContainer.appendChild(el);

            await halt(0.01);
        }

    }
})()

async function halt(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
    });
}

async function onSearch() {
    const search = document.getElementById("search").value;

    for (const icon of document.getElementById("icon-container").children)
    {
        const name = icon.getAttribute("value").toLowerCase().replace(/[\s\_\.\-\,]+/g, "-");

        if (name.includes(search) || name === search)
        {
            icon.classList.remove("hide");
        }
        else
        {
            icon.classList.add("hide");
        }
    }
}
document.getElementById("search").oninput = () => onSearch();

function onSetColor ()
{
    const color = document.getElementById("color").value;

    document.getElementById("icon-container").style.color = color;
}
document.getElementById("color").oninput = () => onSetColor();