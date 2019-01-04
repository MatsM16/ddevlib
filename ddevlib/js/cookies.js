/**
 * Module that simplifies working with cookies
 */
export var Cookies;
(function (Cookies) {
    /**
     * Writes a cookie
     *
     * @export
     * @param {string} name Name of the cookie
     * @param {string} content Value of the cookie
     * @param {number} [daysToLive] Number of days (from now) the cookie will live
     * @param {boolean} [encode] Encode the cookie value to base64
     * @returns {void}
     */
    function set(name, content, daysToLive, encode) {
        const getExpiration = () => {
            const offsetDateString = (offset) => {
                return new Date(Date.now() + offset).toUTCString();
            };
            if (daysToLive == undefined || daysToLive <= 0) {
                const aVeryLongTime = 2147483648;
                return offsetDateString(aVeryLongTime);
            }
            let dateOfDeath = daysToLive * 24 * 60 * 60 * 1000;
            return offsetDateString(dateOfDeath); // Must be in UTC string format
        };
        if (!content) {
            Cookies.remove(name);
            return;
        }
        if (encode)
            content = btoa(content);
        document.cookie = `${name}=${content}; expires=${getExpiration()}; path=/`;
    }
    Cookies.set = set;
    /**
     * Reads a cookie
     *
     * @export
     * @param {string} name Name of the cookie
     * @param {boolean} [decode] Deode the cookie value from base64
     * @returns {(string | null)} The value of the cookie
     */
    function get(name, decode) {
        const findCookie = () => {
            const cookieCoponents = decodeURIComponent(document.cookie).split(';');
            for (let component of cookieCoponents) {
                component = component.trim();
                if (component.startsWith(`${name}=`)) {
                    const _cookie = component.substring(`${name}=`.length, component.length);
                    return _cookie;
                }
            }
            return null;
        };
        let cookie = findCookie();
        if (cookie === null)
            console.warn(`Cookie with name "${name}" does not exist.`);
        if (cookie !== null && decode) {
            try {
                cookie = atob(cookie);
            }
            catch (_a) {
                cookie = null;
            }
        }
        return cookie;
    }
    Cookies.get = get;
    /**
     * Writes a json object to cookies
     *
     * @export
     * @param {string} name Name of the cookie
     * @param {*} content Value of the cookie
     * @param {number} [daysToLive] Number of days (from now) the cookie will live
     */
    function setJSON(name, content, daysToLive) {
        let json = JSON.stringify(content);
        Cookies.set(name, json, daysToLive, true);
    }
    Cookies.setJSON = setJSON;
    /**
     * Reads a json string from cookies and pases it to a object
     *
     * @export
     * @param {string} name Name of the cookie
     * @returns {*} A JSON object
     */
    function getJSON(name) {
        let json = Cookies.get(name, true);
        if (json)
            return JSON.parse(json);
        else
            return null;
    }
    Cookies.getJSON = getJSON;
    /**
     * Deletes a cookie
     *
     * @export
     * @param {string} name Name of the cookie
     */
    function remove(name) {
        let veryOldDate = new Date(0).toUTCString();
        document.cookie = `${name}=; expires=${veryOldDate}; Max-Age=0; path=/`;
        ;
    }
    Cookies.remove = remove;
})(Cookies || (Cookies = {}));
//# sourceMappingURL=cookies.js.map