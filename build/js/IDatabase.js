export function toPromise(request) {
    return new Promise((resolve, reject) => {
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}
export class Index {
    constructor(_index) {
        this._index = _index;
    }
    get name() {
        return this._index.name;
    }
    get isUnique() {
        return this._index.unique;
    }
    get(key) {
        return toPromise(this._index.get(key));
    }
    all(...keys) {
        return toPromise(keys.length > 0
            ? this._index.getAll(keys)
            : this._index.getAll());
    }
    traverse(handler) {
        return new Promise((resolve, reject) => {
            const request = this._index.openCursor();
            request.onerror = () => reject(request.error);
            request.onsuccess = event => {
                //@ts-ignore
                const cursor = event.target.result;
                if (!cursor)
                    return resolve();
                const handlerPackage = {
                    key: cursor.primaryKey,
                    item: cursor.value,
                    update: (item) => toPromise(cursor.update(item)),
                    remove: () => toPromise(cursor.delete())
                };
                handler(handlerPackage) === false
                    ? resolve()
                    : cursor.continue();
            };
        });
    }
}
export class Store {
    constructor(_store) {
        this._store = _store;
    }
    get fields() {
        return this._store.indexNames;
    }
    get primary() {
        return this._store.keyPath;
    }
    index(name) {
        return new Index(this._store.index(name));
    }
    add(item, key) {
        return toPromise(this._store.add(item, key));
    }
    put(item, key) {
        return toPromise(this._store.put(item, key));
    }
    get(key) {
        return toPromise(this._store.get(key));
    }
    all(...keys) {
        return toPromise(keys.length > 0
            ? this._store.getAll(keys)
            : this._store.getAll());
    }
    delete(key) {
        return toPromise(this._store.delete(key));
    }
    traverse(handler) {
        return new Promise((resolve, reject) => {
            const request = this._store.openCursor();
            request.onerror = () => reject(request.error);
            request.onsuccess = event => {
                //@ts-ignore
                const cursor = event.target.result;
                if (!cursor)
                    return resolve();
                const handlerPackage = {
                    key: cursor.primaryKey,
                    item: cursor.value,
                    update: (item) => toPromise(cursor.update(item)),
                    remove: () => toPromise(cursor.delete())
                };
                handler(handlerPackage) === false
                    ? resolve()
                    : cursor.continue();
            };
        });
    }
}
export class Transaction {
    constructor(_trans) {
        this._trans = _trans;
    }
    get permission() {
        return this._trans.mode;
    }
    get stores() {
        return this._trans.objectStoreNames;
    }
    store(name) {
        return new Store(this._trans.objectStore(name));
    }
}
/**
 * Indexed Database
 *
 * @export
 * @class IDatabase
 */
export class IDatabase {
    constructor(_db) {
        this._db = _db;
    }
    static getConfig(configure) {
        const config = {
            version: undefined,
            name: "",
            tables: []
        };
        function createTable(name) {
            const tableConfig = {
                name,
                fields: [],
                primary: undefined,
                primaryType: "guid",
            };
            config.tables.push(tableConfig);
            const proxy = {
                field: n => { tableConfig.fields.push(n); return proxy; },
                primary: (n, t) => { tableConfig.primary = n; tableConfig.primaryType = t || "guid"; return proxy; },
                table: createTable
            };
            return proxy;
        }
        const proxy = {
            version: v => { config.version = v; return proxy; },
            name: n => { config.name = n; return proxy; },
            table: createTable
        };
        configure(proxy);
        if (config.version !== undefined && config.version < 0)
            throw new Error("Invalid database version: " + config.version);
        if (config.name === "")
            throw new Error("A database name must be provided");
        return config;
    }
    static open(database, version, configure) {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(database, version);
            openRequest.onerror = () => reject(openRequest.error);
            openRequest.onupgradeneeded = evt => {
                if (!configure)
                    throw new Error("Failed to instantiate database because no config was provided");
                const config = this.getConfig(configure);
                //@ts-ignore
                const db = evt.target.result;
                for (const { name, primary, fields } of config.tables) {
                    const store = db.createObjectStore(name, primary ? { keyPath: primary } : undefined);
                    for (const field of fields) {
                        store.createIndex(field, field, { unique: false });
                    }
                }
            };
            openRequest.onsuccess = () => resolve(new IDatabase(openRequest.result));
        });
    }
    static delete(database) {
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(database);
            deleteRequest.onblocked = () => reject(new Error("Delete request blocked"));
            deleteRequest.onerror = () => reject(deleteRequest.error);
            deleteRequest.onupgradeneeded = () => reject(new Error("How??? How did you do this?"));
            deleteRequest.onsuccess = () => resolve();
        });
    }
    static openFromConfig(config) {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(config.name, config.version);
            openRequest.onerror = () => reject(openRequest.error);
            openRequest.onupgradeneeded = evt => {
                //@ts-ignore
                const db = evt.target.result;
                for (const { name, primary, fields } of config.tables) {
                    const store = db.createObjectStore(name, primary ? { keyPath: primary } : undefined);
                    for (const field of fields) {
                        store.createIndex(field, field, { unique: false });
                    }
                }
            };
            openRequest.onsuccess = () => resolve(new IDatabase(openRequest.result));
        });
    }
    get name() {
        return this._db.name;
    }
    get version() {
        return this._db.version;
    }
    get stores() {
        return this._db.objectStoreNames;
    }
    transaction(stores, permission) {
        return new Transaction(this._db.transaction(stores, permission));
    }
    store(name, permissions) {
        return this
            .transaction(name, permissions)
            .store(name);
    }
    close() {
        this._db.close();
    }
}
