export var Cookies;
(function (Cookies) {
    function set(name, value, daysToLive) {
        if (!daysToLive || daysToLive < 0)
            daysToLive = 0;
        const expirationTimestamp = daysToLive !== 0
            ? Date.now() + 24 * 60 * 60 * 1000 * daysToLive
            : Number.MAX_SAFE_INTEGER - Date.now() - 1000;
        const expirationDate = new Date(expirationTimestamp).toUTCString();
        value = btoa(value);
        document.cookie = `${name}=${value}; expires=${expirationDate}; path=/`;
    }
    Cookies.set = set;
    function get(name) {
        for (let data of decodeURIComponent(document.cookie).split(';')) {
            data = data.trim();
            if (data.startsWith(`${name}=`)) {
                const cookie = data.substring(`${name}=`.length, data.length);
                try {
                    return atob(cookie);
                }
                catch (_a) {
                    return null;
                }
            }
        }
        return null;
    }
    Cookies.get = get;
    function remove(name) {
        document.cookie = `${name}=; expires=${new Date(0).toUTCString()}; Max-Age=0; path=/`;
    }
    Cookies.remove = remove;
})(Cookies || (Cookies = {}));
(function (Cookies) {
    var Json;
    (function (Json) {
        function set(name, value, daysToLive) {
            try {
                Cookies.set(name, JSON.stringify(value), daysToLive);
            }
            catch (_a) { }
        }
        Json.set = set;
        function get(name) {
            try {
                return JSON.parse(Cookies.get(name));
            }
            catch (_a) {
                return null;
            }
        }
        Json.get = get;
        function remove(name) {
            return Cookies.remove(name);
        }
        Json.remove = remove;
    })(Json = Cookies.Json || (Cookies.Json = {}));
})(Cookies || (Cookies = {}));
(function (Cookies) {
    var Blob;
    (function (Blob) {
        function set(name, value, daysToLive) {
            Cookies.Json.set(name, Cookiehelp.blobToData(value), daysToLive);
        }
        Blob.set = set;
        function get(name) {
            const data = Cookies.Json.get(name);
            if (!data || !('blob' in data) || !('type' in data))
                return null;
            return Cookiehelp.dataToBlob(data);
        }
        Blob.get = get;
        function remove(name) {
            return Cookies.remove(name);
        }
        Blob.remove = remove;
    })(Blob = Cookies.Blob || (Cookies.Blob = {}));
})(Cookies || (Cookies = {}));
export var Cookiehelp;
(function (Cookiehelp) {
    function blobToData(b) {
        return {
            blob: String(b),
            type: b.type
        };
    }
    Cookiehelp.blobToData = blobToData;
    function dataToBlob(s) {
        return new Blob([s.blob], { type: s.type });
    }
    Cookiehelp.dataToBlob = dataToBlob;
})(Cookiehelp || (Cookiehelp = {}));
