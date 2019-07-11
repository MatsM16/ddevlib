import { IDatabase, DatabaseConfig, DatabaseConfigProxy } from "./IDatabase.js";
import { QueryBuilder, QueryRequests } from "./Queries.js";
import { Guid } from "./Guid.js";

/**
 * Query Database
 *
 * @export
 * @abstract
 * @class QDatabase
 */
export abstract class QDatabase
{
    static open()
    {
        if (this === QDatabase)
            throw new Error("Cannot create an instance of an abstract class");

        //@ts-ignore
        const queryDb = new this() as QDatabase;
        const config = queryDb._config;

        return IDatabase.openFromConfig(config).then(db =>
        {
            queryDb._database = db;
            return queryDb;
        });
    }

    static delete()
    {
        if (this === QDatabase)
            throw new Error("Cannot create an instance of an abstract class");

        //@ts-ignore
        const queryDb = new this() as QDatabase;
        const config = queryDb._config;

        return IDatabase.delete(config.name);
    }

    private _config: DatabaseConfig;
    private _database: IDatabase | undefined;

    protected get database()
    {
        if (!this._database)
            throw new Error("Database connection is not open");

        return this._database;
    }

    constructor()
    {
        this._config = IDatabase.getConfig(this.configure);

        console.log(this._config);

        throw new Error("Stop code from advancing!");
    }

    protected abstract configure(config: DatabaseConfigProxy): void;

    private getTable(name: string)
    {
        const tables = this._config.tables.filter(t => t.name === name);

        if (tables.length > 0)
            return tables[0];

        throw new Error("Table should not exist: " + name);
    }

    close(): Promise<void>
    {
        if (this._database)
            this._database.close();
        
        this._database = undefined;
        return Promise.resolve();
    }

    insert<T = any>(table: string)
    {
        return QueryBuilder.buildInsert(query => new Promise<any>((resolve, reject) =>
        {
            const {name, primary, primaryType} = this.getTable(table);

            const keyField = query.keyField || primary;

            let key = query.key;
            if (primaryType === "guid")
                key = Guid.RANDOM.value;

            if (keyField)
                query.item[keyField] = key;

            const store = this.database.store(name, "readwrite");

            store.add(query.item, keyField ? undefined : key)
                .then(resolve)
                .catch(reject)
        }))<T>(table);
    }

    delete<T = any>(table: string)
    {
        return QueryBuilder.buildDelete(query => new Promise<any>((resolve, reject) =>
        {
            const {name, primary, primaryType} = this.getTable(table);
            
            const store = this.database.store(name, "readwrite");

            if (query.keys)
            {
                const deletePromises = [];
                for (const key of query.keys)
                    deletePromises.push(store.delete(key))
                
                Promise.all(deletePromises)
                    .then(resolve)
                    .catch(reject)
            }
            else if (query.key)
            {
                store.delete(query.key)
                    .then(resolve)
                    .catch(reject)
            }
            else
            {
                const keys: IDBValidKey[] = [];
                store.traverse(({key, item}) =>
                {
                    if (!query.condition || query.condition(item))
                        keys.push(key)
                })
                .then(() =>
                {
                    const deletePromises = [];
                    for (const key of keys)
                        deletePromises.push(store.delete(key))
                    
                    Promise.all(deletePromises)
                        .then(resolve)
                        .catch(reject)
                })
            }
            
        }))<T>(table);
    }

    private join(query: QueryRequests.IJoin): (item: any) => Promise<any>
    {
        const store = this.database.store(query.table);

        return (main: any) =>
        {
            return new Promise((resolve, reject) =>
            {
                const otherJoin = query.join ? this.join(query.join) : ((i: any) => Promise.resolve(i));

                if (query.mode === "any")
                {
                    let match = false;

                    store.traverse(({item}) => 
                        otherJoin(item)
                            .then(joint => query.condition(main, joint))
                            .then(isMatch => { match = isMatch; return !isMatch }))

                    .then(() => resolve(query.merge(main, match)))
                    .catch(reject)
                }
                else if (query.mode === "count")
                {
                    let numberOfMatches = 0;

                    store.traverse(({item}) => 
                        otherJoin(item)
                            .then(joint => query.condition(main, joint))
                            .then(isMatch => { numberOfMatches += isMatch ? 1 : 0 }))

                    .then(() => resolve(query.merge(main, numberOfMatches)))
                    .catch(reject)
                }
                else if (query.mode === "all")
                {
                    let matches: any[] = [];

                    store.traverse(({item}) => 
                        otherJoin(item)
                            .then(joint => { query.condition(main, joint) ? matches.push(joint) : undefined }))

                    .then(() => resolve(query.merge(main, matches)))
                    .catch(reject)
                }
                else if (query.mode === "first")
                {
                    let match: any = null;

                    store.traverse(({item}) => 
                        otherJoin(item)
                            .then(joint => 
                            {
                                const isMatch = query.condition(main, joint);

                                match = isMatch ? joint : null;

                                return isMatch;
                            }))

                    .then(() => resolve(query.merge(main, match)))
                    .catch(reject)
                }
            })
        }
    }
    select<T = any>(table: string)
    {
        return QueryBuilder.buildSelect(query => new Promise<any>((resolve, reject) =>
        {
            const {name, primary, primaryType} = this.getTable(table);

            const store = this.database.store(name);

            const condition = query.condition || (() => true);
            const mutate    = query.mutation  || (i => i);
            const def       = query.def       || null;
            const offset    = query.offset    || 0;
            const limit     = query.limit     || Number.MAX_SAFE_INTEGER;
            const join      = query.join ? this.join(query.join) : (i: any) => Promise.resolve(i);
            
            const traverse = (handle: (item: any) => any | boolean) =>
            {
                let index = 0;
                let matchCount = 0;
                return store.traverse(({item}) =>
                    join(item).then(mutate).then(final =>
                    {
                        if (matchCount >= limit)
                            return false;

                        if (index++ < offset || !condition(final))
                            return true;
                        
                        matchCount++;
                        return handle(final)
                    }))
            }

            if (query.mode === "key")
            {
                if (!query.key)
                    return reject(new Error("Key is not defined"))

                store.get(query.key)
                    .then(join)
                    .then(mutate)
                    .then(item => condition(item) ? item : def)
                    .then(resolve)
                    .catch(reject)
            }
            else if (query.mode === "keys")
            {
                if (!query.keys)
                    return reject(new Error("Keys is not defined"))

                store.all(...query.keys)
                    .then(items => Promise.all(items.map(join)))
                    .then(items => items.map(mutate))
                    .then(items => items.map(item => condition(item) ? item : def))
                    .then(resolve)
                    .catch(reject)
            }
            else if (query.mode === "all")
            {
                const items: any[] = [];

                traverse(item => items.push(item))
                    .then(() => resolve(items))
                    .catch(reject)
            }
            else if (query.mode === "count")
            {
                let count = 0;

                traverse(_ => count++)
                    .then(() => resolve(count))
                    .catch(reject)
            }
            else if (query.mode === "first")
            {
                let match: any = null;

                traverse(item => { match = item; if (item) return false } )
                    .then(_ => match ? resolve(match) : reject(new Error("No items found")))
                    .catch(reject)
            }
            else if (query.mode === "single")
            {
                const items: any[] = [];

                traverse(item => items.push(item))
                    .then(_ => items.length === 1 ? resolve(items[0]) : reject(new Error("More or less than one item found")))
                    .catch(reject)
            }
            else if (query.mode === "firstOrDefault")
            {
                let match = def;

                traverse(item => { match = item; if (item) return false } )
                    .then(_ => resolve(match))
                    .catch(reject)
            }
            else if (query.mode === "singleOrDefault")
            {
                const items: any[] = [];

                traverse(item => items.push(item))
                    .then(_ => resolve(items.length === 1 ? items[0] : def))
                    .catch(reject)
            }
            else if (query.mode === "any")
            {
                let match: any = null;

                traverse(item => { match = item; if (item) return false } )
                    .then(_ => resolve(match !== null))
                    .catch(reject)
            }
            else if (query.mode === "forEach")
            {
                traverse(item => { query.forEach ? query.forEach(item) : reject(new Error("forEach not defined")) } )
                    .then(_ => resolve())
                    .catch(reject)
            }
            else
            {
                reject(new Error("Unknown mode: " + query.mode))
            }
            
        }))<T>(table);
    }

    update<T = any>(table: string)
    {
        return QueryBuilder.buildUpdate(query => new Promise((resolve, reject) =>
        {
            const condition = query.condition || (() => true);
            const updater    = query.updater;

            const store = this.database.store(table, "readwrite");

            if (query.keys)
            {
                const keys = query.keys;

                Promise.all(keys.map(key => store.get(key).then(item => ({key, item}))))
                .then(pairs => pairs.filter(pair => condition(pair.item)))
                .then(pairs => Promise.all(pairs.map(pair => { updater(pair.item); return store.put(pair.item, pair.key) })))
                .then(_ => resolve())
                .catch(reject);
            }
            else if (query.key)
            {
                const key = query.key;

                store.get(query.key)
                    .then(function(item) { if (condition(item)) { updater(item); return store.put(item, key) } else return Promise.resolve("") })
                    .then(resolve)
                    .catch(reject)
            }
            else if (query.condition)
            {
                store.traverse(({item, update}) =>
                {
                    if (condition(item))
                    {
                        updater(item);
                        update(item);
                    }
                })
                .then(resolve)
                .catch(reject)
            }
            else
            {
                store.traverse(({item, update}) =>
                {
                    updater(item);
                    update(item);
                })
                .then(resolve)
                .catch(reject)
            }

        }))<T>(table)
    }
}