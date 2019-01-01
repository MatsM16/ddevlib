// Helper functions
export var Web;
(function (Web) {
    let _Helpers;
    (function (_Helpers) {
        function isSuccess(status) {
            return (status >= 200 && status < 300) || status === 304;
        }
        _Helpers.isSuccess = isSuccess;
        function serialize(data, type) {
            type = type.toUpperCase();
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
        _Helpers.serialize = serialize;
        function deserialize(data, type) {
            type = type.toUpperCase();
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
        _Helpers.deserialize = deserialize;
        function applyHeaders(request, headers, type) {
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
            type = type.toUpperCase();
            if (type === "JSON")
                request.setRequestHeader("content-type", "application/json");
            if (type === "TEXT")
                request.setRequestHeader("content-type", "text/plain");
            if (type === "BINARY" || type === "FILE")
                request.setRequestHeader("content-type", "application/octet-stream");
        }
        _Helpers.applyHeaders = applyHeaders;
    })(_Helpers = Web._Helpers || (Web._Helpers = {}));
})(Web || (Web = {}));
// Request handling
(function (Web) {
    function send(method, url, responseType, data, dataType, headers) {
        method = method.toUpperCase();
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open(method, url);
            Web._Helpers.applyHeaders(request, headers, dataType);
            request.onload = () => {
                if (!Web._Helpers.isSuccess(request.status)) {
                    reject({ message: `Request failed: [${request.status}] - ${request.statusText}` });
                    return;
                }
                let response = request.response;
                if (responseType !== undefined)
                    response = Web._Helpers.deserialize(response, responseType);
                resolve(response);
            };
            request.onerror = () => {
                reject({ message: `Request failed: [${request.status}] - ${request.statusText}` });
            };
            if (dataType !== undefined && data !== undefined && data !== null)
                data = Web._Helpers.serialize(data, dataType);
            try {
                request.send(data);
            }
            catch (_a) {
                reject({ message: `Request failed: [${request.status}] - ${request.statusText}` });
            }
        });
    }
    Web.send = send;
    function get(url, responseType, headers) {
        return send("GET", url, responseType, undefined, undefined, headers);
    }
    Web.get = get;
    function post(url, data, dataType, headers) {
        return send("POST", url, undefined, data, dataType, headers);
    }
    Web.post = post;
    function put(url, data, dataType, headers) {
        return send("PUT", url, undefined, data, dataType, headers);
    }
    Web.put = put;
    function del(url, headers) {
        return send("DELETE", url, undefined, undefined, undefined, headers);
    }
    Web.del = del;
    Web.globalHeaders = new Map();
})(Web || (Web = {}));
// Api
(function (Web) {
    class Api {
        constructor(functions, headers) {
            //
            // Functions
            //
            if (functions !== undefined)
                this._functions = functions;
            else
                this._functions = new Map();
            //
            // Headers 
            //
            if (headers !== undefined)
                this._headers = headers;
            else
                this._headers = new Map();
        }
        setHeader(name, value) {
            this._headers.set(name, value);
        }
        setFunction(f) {
            this._functions.set(f.name, f);
        }
        call(name, data, ...args) {
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
        _consoleView() {
            const fArr = [];
            for (let entry of this._functions) {
                if (entry[1].urlParameterNames)
                    //@ts-ignore
                    entry[1].urlParameterNames = entry[1].urlParameterNames.join(", ");
                fArr.push(entry[1]);
            }
            const hArr = [];
            for (let entry of this._headers) {
                hArr.push({ name: entry[0], value: entry[1] });
            }
            console.log("--- FUNCTIONS ---");
            console.table(fArr);
            console.log("");
            console.log("--- HEADERS ---");
            console.table(hArr);
        }
    }
    Web.Api = Api;
})(Web || (Web = {}));
//# sourceMappingURL=Web.js.map