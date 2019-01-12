import { Web } from "./Web";
export var Icons;
(function (Icons) {
    async function load(icon) {
        icon = icon
            .trim()
            .replace(/[\s\_\.\-\,]+/g, "-");
        if (Icons._Data.loadedIcons.has(icon))
            return Icons._Data.loadedIcons.get(icon);
        try {
            const svg = await Web.get(Icons._Data.iconPath + icon + ".svg", "TEXT");
            if (svg) {
                Icons._Data.loadedIcons.set(icon, svg);
                return svg;
            }
            else {
                return "";
            }
        }
        catch (_a) {
            return "";
        }
    }
    Icons.load = load;
})(Icons || (Icons = {}));
(function (Icons) {
    var _Data;
    (function (_Data) {
        _Data.iconPath = "/ddevlib/icons/svg/";
        _Data.loadedIcons = new Map();
    })(_Data = Icons._Data || (Icons._Data = {}));
})(Icons || (Icons = {}));
//# sourceMappingURL=Iocns.js.map