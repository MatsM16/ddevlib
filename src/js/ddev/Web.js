//
// Basic functionality
//
export var Web;
(function (Web) {
    function send(method, url, responseType, data, dataType, headerSettings) {
        return new Promise((reject, resolve) => {
            const request = Web.Requests.createRequest(method, url);
            if (responseType)
                Web.Requests.applyResponseType(request, responseType);
            if (dataType)
                data = Web.Requests.serializeData(data, dataType);
            if (headerSettings)
                Web.Requests.applyHeaderSettings(request, headerSettings);
            request.onload = function () {
                if (!Web.Requests.isSuccessfull(request))
                    Web.Requests.handleError(reject, request);
                else {
                    const response = !responseType
                        ? request.response
                        : Web.Requests.deserializeResponse(request, responseType);
                    resolve(response);
                }
            };
            request.onerror = () => Web.Requests.handleError(reject, request);
            request.send(data);
        });
    }
    Web.send = send;
    function setGlobalHeader(name, value) {
        Web.Requests.globalHeaders.set(name, value);
    }
    Web.setGlobalHeader = setGlobalHeader;
    function get(url, responseType) {
        return send("GET", url, responseType);
    }
    Web.get = get;
})(Web || (Web = {}));
//
// Request handling
//
(function (Web) {
    var Requests;
    (function (Requests) {
        Requests.globalHeaders = new Map();
        function createRequest(method, url) {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            return xhr;
        }
        Requests.createRequest = createRequest;
        function applyHeaderSettings(xhr, settings) {
            if (settings.useBlobalHeaders === true)
                for (const [name, value] of Requests.globalHeaders)
                    xhr.setRequestHeader(name, value);
        }
        Requests.applyHeaderSettings = applyHeaderSettings;
        function applyResponseType(xhr, type) {
            switch (type) {
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
        Requests.applyResponseType = applyResponseType;
        function handleError(reject, { status, statusText }) {
            const reason = {
                message: statusText,
                code: status
            };
            reject(reason);
        }
        Requests.handleError = handleError;
        function isSuccessfull({ status }) {
            if (status >= 200 && status < 300)
                return true;
            else if (status === 304)
                return true;
            else
                return false;
        }
        Requests.isSuccessfull = isSuccessfull;
        function deserializeResponse({ response }, responseType) {
            if (responseType === "BYTEARRAY")
                return new Uint8Array(response);
            else if (responseType === "TEXT")
                return new String(response);
            else
                return response;
        }
        Requests.deserializeResponse = deserializeResponse;
        function serializeData(data, type) {
            if (data === null || data === undefined)
                return null;
        }
        Requests.serializeData = serializeData;
    })(Requests = Web.Requests || (Web.Requests = {}));
})(Web || (Web = {}));
//# sourceMappingURL=Web.js.map