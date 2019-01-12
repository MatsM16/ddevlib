import { Web } from "./Web";

export namespace Icons
{
    export async function load(icon: string): Promise<string>
    {
        icon = icon
            .trim()
            .replace(/[\s\_\.\-\,]+/g, "-")
        
        if (_Data.loadedIcons.has(icon))
            return _Data.loadedIcons.get(icon) as string;
        
        try
        {
            const svg = await Web.get(_Data.iconPath + icon + ".svg", "TEXT");

            if (svg)
            {
                _Data.loadedIcons.set(icon, svg);
                return svg;
            }
            else
            {
                return "";
            }
        }
        catch
        {
            return "";
        }
    }
}

export namespace Icons._Data
{
    export const iconPath = "/ddevlib/icons/svg/";

    export const loadedIcons: Map<string, string> = new Map<string, string>();
}