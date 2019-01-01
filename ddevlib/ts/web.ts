// Helper functions
export namespace Web {
    export namespace _Helpers {
        export function isSuccess (status: number) {
            return (status >= 200 && status < 300) || status === 304;
        }
    
        export function serialize(data: any, type: DataType) {
            type = type.toUpperCase() as DataType;
    
            if (type === "TEXT")
                return "" + data;
    
            if (type === "JSON")
                return JSON.stringify(data);
    
            if (type === "BINARY")
                return data;
    
            if (type === "FILE")
                return data;
    
            throw new Error("Unsupported type");
        }
    
        export function deserialize(data: any, type: DataType) {
            type = type.toUpperCase() as DataType;
    
            if (type === "TEXT")
                return "" + data;
    
            if (type === "JSON")
                return JSON.parse(data);
    
            if (type === "BINARY")
                return new Blob(data);
    
            if (type === "FILE")
                return new File(data, "file");
                
    
            throw new Error("Unsupported type");
        }
    
        export function applyHeaders (request: XMLHttpRequest, headers?: Map<string, string>, type?: DataType) {
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
    
            type = type.toUpperCase() as DataType;
    
            if (type === "JSON")
                request.setRequestHeader("content-type", "application/json");
    
            if (type === "TEXT")
                request.setRequestHeader("content-type", "text/plain");
    
            if (type === "BINARY" || type === "FILE")
                request.setRequestHeader("content-type", "application/octet-stream");
        }
    }
}

// Request handling
export namespace Web {
    export function send (method: RequestType, url: string, responseType?: DataType, data?: any, dataType?: DataType, headers?: Map<string, string>) {
        method = method.toUpperCase() as RequestType;

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

            try
            {
                request.send(data);
            }
            catch
            {
                reject({message: `Request failed: [${request.status}] - ${request.statusText}`});
            }
        });
    }

    export function get (url: string, responseType?: DataType, headers?: Map<string, string>) {
        return send("GET", url, responseType, undefined, undefined, headers);
    }

    export function post (url: string, data?: any, dataType?: DataType, headers?: Map<string, string>) {
        return send("POST", url, undefined, data, dataType, headers);
    }

    export function put (url: string, data?: any, dataType?: DataType, headers?: Map<string, string>) {
        return send("PUT", url, undefined, data, dataType, headers);
    }

    export function del (url: string, headers?: Map<string, string>) {
        return send("DELETE", url, undefined, undefined, undefined, headers);
    }

    export const globalHeaders = new Map<string, string>();

    export type DataType = "JSON" | "TEXT" | "BINARY" | "FILE";
    export type RequestType = "GET" | "POST" | "PUT" | "DELETE";
}

// Api
export namespace Web {
    export class Api {
        private _headers: Map<string, string>;
        private _functions: Map<string, ApiFunction>;
    
        constructor (functions?: Map<string, ApiFunction>, headers?: Map<string, string>) {
            //
            // Functions
            //
            if (functions !== undefined)
                this._functions = functions;
            else
                this._functions = new Map<string, ApiFunction>();
    
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
    
        public setFunction(f: ApiFunction) {
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

    export interface ApiFunction {
        name: string,
        url: string,
    
        method: Web.RequestType;
        dataType?: Web.DataType;
        responseType?: Web.DataType;
    
        urlParameterNames?: string[];
    }
}