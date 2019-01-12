/**
 * Module that simplifies working with cookies
 */
export declare namespace Cookies {
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
    function set(name: string, content: string, daysToLive?: number, encode?: boolean): void;
    /**
     * Reads a cookie
     *
     * @export
     * @param {string} name Name of the cookie
     * @param {boolean} [decode] Deode the cookie value from base64
     * @returns {(string | null)} The value of the cookie
     */
    function get(name: string, decode?: boolean): string | null;
    /**
     * Writes a json object to cookies
     *
     * @export
     * @param {string} name Name of the cookie
     * @param {*} content Value of the cookie
     * @param {number} [daysToLive] Number of days (from now) the cookie will live
     */
    function setJSON(name: string, content: any, daysToLive?: number): void;
    /**
     * Reads a json string from cookies and pases it to a object
     *
     * @export
     * @param {string} name Name of the cookie
     * @returns {*} A JSON object
     */
    function getJSON(name: string): any;
    /**
     * Deletes a cookie
     *
     * @export
     * @param {string} name Name of the cookie
     */
    function remove(name: string): void;
}
