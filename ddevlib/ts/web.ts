export namespace Web {
    export function send (method: "GET" | "POST" | "PUT" | "DELETE", url: string, responseType?: "JSON" | "TEXT" | "BINARY", data?: any, dataType?: "JSON" | "TEXT" | "BINARY", headers?: Map<string, string>) {
        method = method.toUpperCase() as ("GET" | "POST" | "PUT" | "DELETE");

        return new Promise<any>((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open(method, url);

            _Helpers.applyHeaders(request, headers, dataType);

            request.onload = () => {
                if (!_Helpers.isSuccess(request.status)) {
                    reject({message: `Request failed: [${request.status}] - ${request.statusText}`});
                    return;
                }

                let response = request.response;
                if (responseType !== undefined)
                    response = _Helpers.deserialize(response, responseType);
                
                resolve(response);
            }

            request.onerror = () => {
                reject({message: `Request failed: [${request.status}] - ${request.statusText}`});
            }

            if (dataType !== undefined && data !== undefined && data !== null)
                data = _Helpers.serialize(data, dataType);

            request.send(data);
        });
    }

    export const globalHeaders = new Map<string, string>();
}

export namespace Web._Helpers {
    export function isSuccess (status: number) {
        return (status >= 200 && status < 300) || status === 304;
    }

    export function serialize(data: any, type: "JSON" | "TEXT" | "BINARY") {
        type = type.toUpperCase() as "JSON" | "TEXT" | "BINARY";

        if (type === "TEXT")
            return "" + data;

        if (type === "JSON")
            return JSON.stringify(data);

        throw new Error("Unsupported type");
    }

    export function deserialize(data: any, type: "JSON" | "TEXT" | "BINARY") {
        type = type.toUpperCase() as "JSON" | "TEXT" | "BINARY";

        if (type === "TEXT")
            return "" + data;

        if (type === "JSON")
            return JSON.parse(data);

        if (type === "BINARY")
            return data;

        throw new Error("Unsupported type");
    }

    export function applyHeaders (request: XMLHttpRequest, headers?: Map<string, string>, type?: "JSON" | "TEXT" | "BINARY") {
        //
        // Global headers
        //
        for (const [name, value] of Web.globalHeaders)
            request.setRequestHeader(name, value);

        //
        // Specified headers
        //
        if (headers)
            for (const [name, value] of headers)
                request.setRequestHeader(name, value);

        //
        // Type spesific headers
        //

        if (!type)
            return;

        type = type.toUpperCase() as "JSON" | "TEXT" | "BINARY";

        if (type === "JSON")
            request.setRequestHeader("content-type", "application/json");

        if (type === "TEXT")
            request.setRequestHeader("content-type", "text/plain");

        if (type === "BINARY")
            request.setRequestHeader("content-type", "application/octet-stream");
    }
}

export class WebApi {
    private _headers: Map<string, string>;
    private _functions: Map<string, WebApiFunction>;

    constructor (functions?: Map<string, WebApiFunction>, headers?: Map<string, string>) {
        //
        // Functions
        //
        if (functions !== undefined)
            this._functions = functions;
        else
            this._functions = new Map<string, WebApiFunction>();

        //
        // Headers 
        //
        if (headers !== undefined)
            this._headers = headers;
        else
            this._headers = new Map<string, string>();
    }

    public setHeader(name: string, value: string) {
        this._headers.set(name, value);
    }

    public setFunction(f: WebApiFunction) {
        this._functions.set(f.name, f);
    }

    public call(name: string, data?: any,  ... args: string[]) {
        const func = this._functions.get(name);

        if (!func)
            throw new Error(`Function not defined: ${name}`);

        let url = func.url;

        if (func.urlParameterNames && args.length > 0) {
            for (let i = 0; i < args.length && i < func.urlParameterNames.length; i++) {
                let name = func.urlParameterNames[i];
                let value = args[i];

                if (i === 0)
                    url += `?${name}=${value}`;
                else
                    url += `&${name}=${value}`;
            }
        }

        return Web.send(func.method, url, func.responseType, data, func.dataType, this._headers);
    }

    public _consoleView() {
        const fArr = [];
        for (let entry of this._functions) {
            if (entry[1].urlParameterNames)
                //@ts-ignore
                entry[1].urlParameterNames = entry[1].urlParameterNames.join(", ");
            fArr.push(entry[1]);
        }

        const hArr = [];
        for (let entry of this._headers) {
            hArr.push({name: entry[0], value: entry[1]});
        }

        console.log("--- FUNCTIONS ---")
        console.table(fArr);
        console.log("");
        console.log("--- HEADERS ---");
        console.table(hArr);
    }
}

export interface WebApiFunction {
    name: string,
    url: string,

    method: "GET" | "POST" | "PUT" | "DELETE";
    dataType?: "TEXT" | "JSON" | "BINARY";
    responseType?: "TEXT" | "JSON" | "BINARY";

    urlParameterNames?: string[];
}