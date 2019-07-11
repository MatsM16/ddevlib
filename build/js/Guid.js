export class Guid {
    constructor(dataOrValue) {
        if (dataOrValue === undefined) {
            //
            // If no init data is given, generate random guid
            //
            const data = Guid._generateValidRandomData();
            this._data = data;
            this._value = Guid._dataToString(data);
        }
        else if (typeof dataOrValue === "string") {
            Guid._checkString(dataOrValue);
            this._value = dataOrValue;
            this._data = Guid._stringToData(dataOrValue);
        }
        else if (dataOrValue instanceof Guid) {
            this._value = dataOrValue._value;
            this._data = new Uint8Array(dataOrValue._data.buffer.slice(0));
        }
        else {
            Guid._checkData(dataOrValue);
            this._data = dataOrValue;
            this._value = Guid._dataToString(dataOrValue);
        }
    }
    get value() {
        return this._value;
    }
    get data() {
        return this._data;
    }
    get isEmpty() {
        for (const n of this._data)
            if (n !== 0)
                return true;
        return false;
    }
    toString() {
        return this.value;
    }
    toSymbol() {
        return Symbol.for(this.value);
    }
    static Parse(value) {
        Guid._checkString(value);
        const data = this._stringToData(value);
        return new Guid(data);
    }
    static get EMPTY() {
        return new Guid(new Uint8Array(16));
    }
    static get RANDOM() {
        return new Guid(this._generateValidRandomData());
    }
    static random(count) {
        if (count !== undefined && count > 1) {
            const guid = [];
            for (let i = 0; i < count; i++)
                guid.push(Guid.RANDOM);
            return guid;
        }
        else {
            return Guid.RANDOM;
        }
    }
    static _generateValidRandomData() {
        const data = new Uint8Array(16);
        this._fillArrayWithRandomBytes(data);
        this._makeRandomGuidBytesValid(data);
        return data;
    }
    static _fillArrayWithRandomBytes(data) {
        if (crypto !== undefined)
            crypto.getRandomValues(data);
        else if (Math !== undefined && 'random' in Math && 'floor' in Math)
            for (let i = 0; i < data.length; i++)
                data[i] = Math.floor(Math.random() * 255);
        else
            throw new Error("crypto in not defined and the fallback 'Math' is either not defined or does not contain functions 'random' and 'floor'");
    }
    static _makeRandomGuidBytesValid(data) {
        data[6] = (data[6] % 79) + 16; // Must be 16-95   [79]
        data[8] = (data[8] % 63) + 128; // Must be 128-191 [63]
    }
    static _checkData(data) {
        if (!data)
            throw new Error("data cannot be null or undefined");
        if (!('buffer' in data))
            throw new Error("data must be a typed array");
        if (!('BYTES_PER_ELEMENT' in data && data.BYTES_PER_ELEMENT === 1))
            throw new Error("data must be an UInt8Array");
        if (data.length !== 16)
            throw new Error("data must contain exactly four Int32s");
    }
    static _checkString(value) {
        value = value.trim();
        if (!value)
            throw new Error("value cannot be null, undefined or empty");
        if (value.length !== 36)
            throw new Error("value must be 36 characters long");
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))
            throw new Error("Invalid guid format. Correct format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX");
    }
    static _dataToString(data) {
        // Number(n) => String(s)
        const ns = (n) => ("0" + n.toString(16)).slice(-2);
        return ns(data[0]) + ns(data[1]) + ns(data[2]) + ns(data[3])
            + "-"
            + ns(data[4]) + ns(data[5])
            + "-"
            + ns(data[6]) + ns(data[7])
            + "-"
            + ns(data[8]) + ns(data[9])
            + "-"
            + ns(data[10]) + ns(data[11]) + ns(data[12]) + ns(data[13]) + ns(data[14]) + ns(data[15]);
    }
    static _stringToData(value) {
        // String(s) => Number(n)
        const sn = (o) => Number.parseInt(value.substr(o, 2), 16);
        return new Uint8Array([
            sn(0), sn(2), sn(4), sn(6),
            sn(9), sn(11),
            sn(14), sn(16),
            sn(19), sn(21),
            sn(24), sn(26), sn(28), sn(30), sn(32), sn(34)
        ]);
    }
}
