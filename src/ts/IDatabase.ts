export interface DatabaseConfigProxy
{
    version: (version: number | undefined) => DatabaseConfigProxy;
    name: (name: string) => DatabaseConfigProxy;
    table: (name: string) => TableConfigProxy;
}

export interface TableConfigProxy
{
    field: (name: string) => TableConfigProxy;
    primary: (name: string, type?: "guid" | "auto-increment" | "user-defined") => TableConfigProxy;
    table: (name: string) => TableConfigProxy;
}

export interface DatabaseConfig
{
    version: number | undefined;
    name: string;

    tables: TableConfig[]
}

export interface TableConfig
{
    name: string;
    primary: string | undefined;
    primaryType: "guid" | "auto-increment" | "user-defined";
    fields: string[];
}

export interface TableTraversePackage
{
    key: IDBValidKey;
    item: any;
    update: (item: any) => Promise<IDBValidKey>;
    remove: () => Promise<void>;
}

export function toPromise<T>(request: IDBRequest<T>): Promise<T>
{
    return new Promise<T>((resolve, reject) =>
    {
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    })
}

export class Index
{
    constructor( private _index: IDBIndex ) {}

    get name()
    {
        return this._index.name;
    }

    get isUnique()
    {
        return this._index.unique;
    }

    get(key: IDBValidKey)
    {
        return toPromise(this._index.get(key));
    }
    all(...keys: IDBValidKey[])
    {
        return toPromise(
            keys.length > 0
            ? this._index.getAll(keys)
            : this._index.getAll()
        );
    }
    
    traverse(handler: (handlerPackage: TableTraversePackage) => boolean | undefined | void | Promise<boolean | undefined | void>)
    {
        return new Promise<void>((resolve, reject) =>
        {
            const request = this._index.openCursor();
            request.onerror = () => reject(request.error);

            request.onsuccess = event =>
            {
                //@ts-ignore
                const cursor = event.target.result as IDBCursorWithValue | null;

                if (!cursor)
                    return resolve();

                const handlerPackage = 
                {
                    key: cursor.primaryKey,
                    item: cursor.value,
                    update: (item: any) => toPromise(cursor.update(item)),
                    remove: ()          => toPromise(cursor.delete())
                }

                handler(handlerPackage) === false
                    ? resolve()
                    : cursor.continue();
            }
        });
    }
}

export class Store
{
    constructor( private _store: IDBObjectStore ) {}

    get fields()
    {
        return this._store.indexNames;
    }

    get primary()
    {
        return this._store.keyPath;
    }

    index(name: string)
    {
        return new Index(this._store.index(name));
    }

    add(item: any, key?: IDBValidKey)
    {
        return toPromise(this._store.add(item, key));
    }
    put(item: any, key?: IDBValidKey)
    {
        return toPromise(this._store.put(item, key));
    }
    get(key: IDBValidKey)
    {
        return toPromise(this._store.get(key));
    }
    all(...keys: IDBValidKey[])
    {
        return toPromise(
            keys.length > 0
            ? this._store.getAll(keys)
            : this._store.getAll()
        );
    }

    delete(key: IDBValidKey)
    {
        return toPromise(this._store.delete(key));
    }
    
    traverse(handler: (handlerPackage: TableTraversePackage) => boolean | undefined | void | Promise<boolean | undefined | void>)
    {
        return new Promise<void>((resolve, reject) =>
        {
            const request = this._store.openCursor();
            request.onerror = () => reject(request.error);

            request.onsuccess = event =>
            {
                //@ts-ignore
                const cursor = event.target.result as IDBCursorWithValue | null;

                if (!cursor)
                    return resolve();

                const handlerPackage = 
                {
                    key: cursor.primaryKey,
                    item: cursor.value,
                    update: (item: any) => toPromise(cursor.update(item)),
                    remove: ()          => toPromise(cursor.delete())
                }

                handler(handlerPackage) === false
                    ? resolve()
                    : cursor.continue();
            }
        });
    }
}

export class Transaction
{
    constructor( private _trans: IDBTransaction ) {}

    get permission()
    {
        return this._trans.mode;
    }

    get stores()
    {
        return this._trans.objectStoreNames;
    }

    store(name: string)
    {
        return new Store( this._trans.objectStore(name) );
    }
}

/**
 * Indexed Database
 *
 * @export
 * @class IDatabase
 */
export class IDatabase
{
    static getConfig(configure: (config: DatabaseConfigProxy) => void)
    {
        const config: DatabaseConfig = 
        {
            version: undefined,
            name: "",
            tables: []
        }

        function createTable (name: string)
        {
            const tableConfig: TableConfig = 
            {
                name,
                fields: [],
                primary: undefined,
                primaryType: "guid",
            }

            config.tables.push(tableConfig);

            const proxy: TableConfigProxy = 
            {
                field: n => { tableConfig.fields.push(n); return proxy },
                primary: (n, t) => { tableConfig.primary = n; tableConfig.primaryType = t || "guid"; return proxy },
                table: createTable
            }

            return proxy;
        }

        const proxy: DatabaseConfigProxy = 
        {
            version: v => { config.version = v; return proxy },
            name: n => { config.name = n; return proxy },
            table: createTable
        }

        configure(proxy);

        if (config.version !== undefined && config.version < 0)
            throw new Error("Invalid database version: " + config.version)

        if (config.name === "")
            throw new Error("A database name must be provided");

        return config;
    }

    static open(database: string, version?: number, configure?: (config?: DatabaseConfigProxy) => void)
    {
        return new Promise<IDatabase>((resolve, reject) =>
        {
            const openRequest = indexedDB.open(database, version);
            openRequest.onerror = () => reject(openRequest.error);

            openRequest.onupgradeneeded = evt =>
            {
                if (!configure)
                    throw new Error("Failed to instantiate database because no config was provided");

                const config = this.getConfig(configure);

                //@ts-ignore
                const db = evt.target.result as IDBDatabase;

                for (const {name, primary, fields} of config.tables)
                {
                    const store = db.createObjectStore(name, primary ? { keyPath: primary } : undefined);

                    for (const field of fields)
                    {
                        store.createIndex(field, field, {unique:false})
                    }
                }
            }

            openRequest.onsuccess = () => resolve(new IDatabase(openRequest.result));
        });
    }

    static delete(database: string)
    {
        return new Promise<void>((resolve, reject) =>
        {
            const deleteRequest = indexedDB.deleteDatabase(database);

            deleteRequest.onblocked = () => reject(new Error("Delete request blocked"));
            deleteRequest.onerror = () => reject(deleteRequest.error);
            deleteRequest.onupgradeneeded = () => reject(new Error("How??? How did you do this?"));

            deleteRequest.onsuccess = () => resolve();
        })
    }

    static openFromConfig(config: DatabaseConfig)
    {
        return new Promise<IDatabase>((resolve, reject) =>
        {
            const openRequest = indexedDB.open(config.name, config.version);
            openRequest.onerror = () => reject(openRequest.error);

            openRequest.onupgradeneeded = evt =>
            {
                //@ts-ignore
                const db = evt.target.result as IDBDatabase;

                for (const {name, primary, fields} of config.tables)
                {
                    const store = db.createObjectStore(name, primary ? { keyPath: primary } : undefined);

                    for (const field of fields)
                    {
                        store.createIndex(field, field, {unique:false})
                    }
                }
            }

            openRequest.onsuccess = () => resolve(new IDatabase(openRequest.result));
        });
    }

    constructor(private _db: IDBDatabase) {}

    get name()
    {
        return this._db.name;
    }

    get version()
    {
        return this._db.version;
    }

    get stores()
    {
        return this._db.objectStoreNames;
    }

    transaction(stores: string | string[], permission?: "readwrite" | "readonly")
    {
        return new Transaction( this._db.transaction(stores, permission) );
    }
    
    store(name: string, permissions?: "readwrite" | "readonly")
    {
        return this
            .transaction(name, permissions)
            .store(name);
    }

    close()
    {
        this._db.close();
    }
}