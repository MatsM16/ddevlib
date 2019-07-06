export namespace Cookies
{
    export function set (name: string, value: string, daysToLive?: number)
    {
        if (!daysToLive || daysToLive < 0)
            daysToLive = 0;

        const expirationTimestamp = daysToLive !== 0
            ? Date.now() + 24 * 60* 60 * 1000 * daysToLive
            : Number.MAX_SAFE_INTEGER - Date.now() - 1000;

        const expirationDate = new Date(expirationTimestamp).toUTCString();

        value = btoa(value);

        document.cookie = `${name}=${value}; expires=${expirationDate}; path=/`;
    }

    export function get (name: string)
    {
        for (let data of decodeURIComponent(document.cookie).split(';'))
        {
            data = data.trim();

            if (data.startsWith(`${name}=`))
            {
                const cookie = data.substring(`${name}=`.length, data.length);

                try
                { return atob(cookie) }
                catch
                { return null }
            }
        }

        return null;
    }

    export function remove (name: string)
    {
        document.cookie = `${name}=; expires=${new Date(0).toUTCString()}; Max-Age=0; path=/`;
    }
}

export namespace Cookies.Json
{
    export function set (name: string, value: any, daysToLive?: number)
    {
        try
        {
            Cookies.set(name, JSON.stringify(value), daysToLive);
        }
        catch 
        {}
    }

    export function get (name: string)
    {
        try
        {
            return JSON.parse(Cookies.get(name) as string);
        }
        catch
        { return null }
    }

    export function remove(name: string)
    {
        return Cookies.remove(name);
    }
}

export namespace Cookies.Blob
{
    export function set(name: string, value: Blob, daysToLive?: number)
    {
        Cookies.Json.set(name, Cookiehelp.blobToData(value), daysToLive);
    }

    export function get(name: string)
    {
        const data = Cookies.Json.get(name) as { blob: string, type: string };

        if (!data || !('blob' in data) || !('type' in data))
            return null;

        return Cookiehelp.dataToBlob(data);
    }

    export function remove (name: string)
    {
        return Cookies.remove(name);
    }
}

export namespace Cookiehelp
{
    export function blobToData(b: Blob): { blob: string, type: string }
    {
        return {
            blob: String(b),
            type: b.type
        }
    }
    
    export function dataToBlob(s: { blob: string, type: string }): Blob
    {
        return new Blob([s.blob], { type: s.type });
    }
}