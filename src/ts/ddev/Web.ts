//
// Basic functionality
//
export namespace Web
{
    export function send(method: RequestMethod, url: string, responseType?: RequestDataType, data?: any, dataType?: RequestDataType, headerSettings?: RequestHeaderSettings): Promise<any>
    {
        return new Promise<any>((reject, resolve) => {
            const request = Requests.createRequest(method, url)

            if (responseType)
                Requests.applyResponseType(request, responseType);
    
            if (dataType)
                data = Requests.serializeData(data, dataType);

            if (headerSettings)
                Requests.applyHeaderSettings(request, headerSettings);

            request.onload = function ()
            {
                if (!Requests.isSuccessfull(request))
                    Requests.handleError(reject, request);
                else
                {
                    const response = !responseType
                        ? request.response
                        : Requests.deserializeResponse(request, responseType);
                    
                    resolve(response);
                }
            }

            request.onerror = () =>
                Requests.handleError(reject, request);

            request.send(data);
        });
    }

    export function setGlobalHeader(name: string, value: string)
    {
        Requests.globalHeaders.set(name, value);
    }
}

//
// Data types
//
export namespace Web
{
    export type RequestMethod = "GET" | "PUT" | "POST" | "DELETE";
    export type RequestDataType = "TEXT" | "JSON" | "XML" | "BLOB" | "BYTEARRAY";
    export type RequestHeaderSettings =
    {
        useBlobalHeaders?: boolean;
        customHeaders?: Map<string, string>;
    }
}

//
// Request handling
//
export namespace Web.Requests
{
    export const globalHeaders = new Map<string, string>();

    export function createRequest(method: RequestMethod, url: string)
    {
        const xhr = new XMLHttpRequest();

        xhr.open(method, url);

        return xhr;
    }

    export function applyHeaderSettings(xhr: XMLHttpRequest, settings: RequestHeaderSettings)
    {
        if (settings.useBlobalHeaders === true)
            for (const [name, value] of globalHeaders)
                xhr.setRequestHeader(name, value);
    }

    export function applyResponseType(xhr: XMLHttpRequest, type: RequestDataType)
    {
        switch (type)
        {
            case "BLOB":
                xhr.responseType = "blob";
                break;

            case "BYTEARRAY":
                xhr.responseType = "arraybuffer";
                break;

            case "JSON":
                xhr.responseType = "json";
                break;

            case "TEXT":
                xhr.responseType = "text";
                break;

            case "XML":
                xhr.responseType = "document";
                break;

            default:
                throw new Error("Unsupported type " + type);
        }
    }

    export function handleError(reject: Function, {status, statusText}: XMLHttpRequest)
    {
        const reason = {
            message: statusText,
            code: status
        }

        reject(reason);
    }

    export function isSuccessfull({status}: XMLHttpRequest)
    {
        if (status >= 200 && status < 300)
            return true;

        else if (status === 304)
            return true;

        else
            return false;
    }

    export function deserializeResponse({response}: XMLHttpRequest, responseType: RequestDataType)
    {
        if (responseType === "BYTEARRAY")
            return new Uint8Array(response);

        else if (responseType === "TEXT")
            return new String(response);

        else
            return response;
    }

    export function serializeData(data: any, type: RequestDataType)
    {
        if (data === null || data === undefined)
            return null;
    }
}