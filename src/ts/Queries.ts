import { Guid } from "./Guid.js";

export namespace Queries
{
    export type SelectInit = <T>(table: string) => Select.IInit<T>;
    export type UpdateInit = <T>(table: string) => Update.IInit<T>;
    export type DeleteInit = <T>(table: string) => Delete.IInit<T>;
    export type InsertInit = <T>(table: string) => Insert.IInit<T>;

    export namespace Select
    {
        export interface IJoinCondition<T, TOther>
        {
            first: <TNew>(merge: (item: T, other:   TOther)   => TNew) => IInit<TNew>;
            all:   <TNew>(merge: (item: T, others:  TOther[]) => TNew) => IInit<TNew>;
            any:   <TNew>(merge: (item: T, match:   boolean)  => TNew) => IInit<TNew>;
            count: <TNew>(merge: (item: T, matches: number)   => TNew) => IInit<TNew>;
        }

        export interface IInit<T> extends IMutate<T>
        {
            join: <TOther>(table: string, condition: (item: T, other: TOther) => boolean) => IJoinCondition<T, TOther>
        }

        export interface IMutate<T> extends ICondition<T>
        {
            mutate: <TNew>(mutate: (item: T) => TNew) => ICondition<T>;
        }

        export interface ICondition<T> extends ILimit<T>
        {
            where: (condition: (item: T) => boolean) => ILimit<T>;
        }

        export interface ILimit<T> extends IFinalInfo<T>
        {
            limit: (count: number, offset?: number) => IFinalInfo<T>;
        }

        export interface IFinalInfo<T> extends IFinalResult<T>
        {
            forEach: (iterator: (item: T) => void) => Promise<void>;
            any: () => Promise<boolean>;
            count: () => Promise<number>;
        }
        
        export interface IFinalResult<T>
        {
            all: () => Promise<T[]>;

            single: () => Promise<T>;
            singleOrDefault: (def: T | null) => Promise<T | null>;

            first: () => Promise<T>;
            firstOrDefault: (def: T | null) => Promise<T | null>;

            key: (key: IDBValidKey) => Promise<T>;
            keys: (keys: IDBValidKey[]) => Promise<T[]>;
        }
    }

    export namespace Update
    {
        export interface IInit<T> extends IFinal<T>
        {
            where: (condition: (item: T) => boolean) => IFinal<T>;
            key: (key: IDBValidKey) => IFinal<T>;
            keys: (keys: IDBValidKey[]) => IFinal<T>;
        }

        export interface IFinal<T>
        {
            set: (change: (item: T) => T) => Promise<void>;
        }
    }

    export namespace Delete
    {
        export interface IInit<T>
        {
            where: (condition: (item: T) => boolean) => Promise<void>;
            key: (key: IDBValidKey) => Promise<void>;
            keys: (keys: IDBValidKey[]) => Promise<void>;
        }
    }

    export namespace Insert
    {
        export interface IInit<T> extends IKeyGeneration<T>
        {
            keyField: (field: string) => IKeyGeneration<T>;
        }

        export interface IKeyGeneration<T>
        {
            key: (key: IDBValidKey) => IFinalSingle<T>;
            keys: (keys: IDBValidKey[]) => IFinalMultiple<T>;
            auto: (mode: "guid" | "random") => IFinalMultiple<T> & IFinalSingle<T>;
        }

        export interface IFinalMultiple<T>
        {
            items: (items: T[]) => Promise<(IDBValidKey | null)[]>;
        }

        export interface IFinalSingle<T>
        {
            item: (item: T) => Promise<IDBValidKey>
        }
    }
}

export namespace QueryRequests
{
    export interface IJoin
    {
        // Table to join from
        table: string;

        // Must pass condition for 'other' to join.
        condition: (item: any, other: any) => boolean;

        // What to do with 'other's passing condition
        //   all - Collect all matches and pass as 'other' array to merge
        //   first - Get first match and pass as 'other' to merge
        //   any - If any 'other' passes, pass as true to merge, otherwise false
        //   count - Count all 'other's passing, and pass to merge as number
        mode: "all" | "first" | "any" | "count";

        // Merges the two table values, this is will be used
        // in the rest of the select query
        merge: (item: any, other: any) => any;

        // A new join
        // If present, run after merge
        // After all joins are ran, the final merged value will be passed back
        // to original select statement
        join?: IJoin;
    }

    export interface ISelect
    {
        // Where to collect data
        table: string;

        // If present, run first
        // Use output from merge in rest of query
        join?: IJoin;

        // If present, run before condition
        mutation?: (item: any) => any;

        // Item must pass condition, even
        // if key/keys are provided
        condition?: (item: any) => boolean;

        // Use if present AND keys are NOT set;
        key?: IDBValidKey;
        // Use if present
        keys?: IDBValidKey[];

        // Ignore if key or keys are set
        limit?: number;
        // Ignore if key or keys are set
        offset?: number;

        // If present, mode infered as 'forEach'
        forEach?: (item: any) => void;

        // If present, use as default in 'singleOrDefault' and 'firstOrDefault'
        // otherwise use null.
        def?: any;

        mode: "all"             // Return all matches as array
            | "single"          // Return single match as item. Throw if more or less than one result
            | "singleOrDefault" // Return single match as item or default. Throw if more than one result
            | "first"           // Return first match as item. Throw if less than one result
            | "firstOrDefault"  // Return first match as item or default.
            | "key"             // Return item with id. Throw if no item was found
            | "keys"            // Return array of equal size as keys with item in place of cooresponding key or null if not found
            | "any"             // Returns true if any matches, otherwise false
            | "count"           // Returns number of matches
            | "forEach"         // Return void. Run callback for each matching item
    }

    export interface IUpdate
    {
        // Where to update
        table: string;

        // Use if avaiable, even if key/keys are also awailable
        condition?: (item: any) => boolean;

        // Use this if provided AND keys are NOT provided
        key?: IDBValidKey;

        // Use this if provided
        keys?: IDBValidKey[];

        // Update to the item
        updator: (item: any) => any;
    }

    export interface IInsert
    {
        // Where to put new values
        table: string;

        // Keys to provide new values
        // Length must equal items.length
        keys: IDBValidKey[];

        // Set field to key if field exists
        // otherwise, create hidden property with key
        keyField?: string;

        // Items to insert
        // Length must equal keys.length
        items: any[];
    }

    export interface IDelete
    {
        // Where to delete
        table: string;

        // Use if avaiable, even if key/keys are also awailable
        condition?: ((item: any) => boolean);

        // Use this if provided AND keys are NOT provided
        key?: IDBValidKey;

        // Use this if provided
        keys?: IDBValidKey[];
    }

    export type SelectHandler = (query: ISelect) => Promise<any>;
    export type UpdateHandler = (query: IUpdate) => Promise<any>;
    export type InsertHandler = (query: IInsert) => Promise<any>;
    export type DeleteHandler = (query: IDelete) => Promise<any>;
}

export namespace QueryBuilder
{
    export function buildDelete(promise: Promise<any>, cb: (request: QueryRequests.IDelete) => void): Queries.DeleteInit
    {
        const request: QueryRequests.IDelete = 
        {
            table: ""
        }

        const resolve = () => { cb(request); return promise; }
        
        return <T>(table: string) => 
        { 
            request.table = table;

            return {
                key: key => { request.key = key; return resolve() },
                keys: keys => { request.keys = keys;  return resolve() },
                where: condition => { request.condition = condition; return resolve() }
            }
        }
    }

    export function buildInsert(promise: Promise<any>, cb: (request: QueryRequests.IInsert) => void): Queries.InsertInit
    {
        const request: QueryRequests.IInsert = 
        {
            table: "",
            items: [],
            keys: []
        }

        let _auto: "guid" | "random" | undefined;
        
        const setItems = (...items: any[]) =>
        {
            request.items.push(...items);
            cb(request);

            if (_auto)
            {
                if (_auto === "guid")
                    for (const _ in items)
                        request.keys.push(Guid.RANDOM.value)
                
                else if (_auto === "random")
                    request.keys.push(...crypto.getRandomValues(new Uint32Array(items.length)))
            }

            return promise;
        }

        const setKey = (key: any) =>
        {
            request.keys = [key];
            return {
                item: (i: any) => setItems(i)
            }
        }

        const setKeys = (keys: any[]) =>
        {
            request.keys = keys;
            return {
                items: (i: any[]) => setItems(...i)
            }
        }

        const setAuto = (mode: "guid" | "random") =>
        {
            _auto = mode;

            return {
                item: (i: any) => setItems(i),
                items: (i: any[]) => setItems(...i)
            }
        }

        const setKeyField = (field: string | undefined) =>
        {
            request.keyField = field;

            return {
                auto: setAuto,
                key: setKey,
                keys: setKeys
            }
        }

        return <T>(table: string) =>
        {
            request.table = table;

            return {
                key: setKey,
                keys: setKeys,
                keyField: setKeyField,
                auto: setAuto
            }
        }
    }

    export function buildUpdate(promise: Promise<any>, cb: (request: QueryRequests.IUpdate) => void): Queries.UpdateInit
    {
        const request: QueryRequests.IUpdate = 
        {
            table: "",
            updator: i => i
        }
        
        const setSet = (u: any) =>
        {
            request.updator = u;

            cb(request);
            return promise;
        }

        const setCondition = (con: any) =>
        {
            request.condition = con;

            return {
                set: setSet
            }
        }

        const setkey = (key: any) =>
        {
            request.key = key;

            return {
                set: setSet
            }
        }

        const setkeys = (keys: any[]) =>
        {
            request.keys = keys;

            return {
                set: setSet
            }
        }

        return <T>(table: string) =>
        {
            request.table = table;

            return {
                set: setSet,
                where: setCondition,
                key: setkey,
                keys: setkeys
            }
        }
    }

    export function buildSelect(promise: Promise<any>, cb: (request: QueryRequests.ISelect) => void): Queries.SelectInit
    {
        const request: QueryRequests.ISelect = 
        {
            table: "",
            mode: "all"
        }

        const modeSetter = (mode: any) => (def?: any) =>
        {
            request.mode = mode;
            request.def = def;

            cb(request);
            return promise;
        }

        const setKey = (key: any) =>
        {
            request.key = key;
            return modeSetter("key")(undefined);
        }

        const setKeys = (keys: any[]) =>
        {
            request.keys = keys;
            return modeSetter("keys")(undefined);
        }

        const setForEach = (forEach: any) =>
        {
            request.forEach = forEach;

            return modeSetter("forEach")(undefined);
        }

        const finalisers = 
        {
            all: modeSetter("all"),

            single: modeSetter("single"),
            singleOrDefault: modeSetter("singleOrDefault"),

            first: modeSetter("first"),
            firstOrDefault: modeSetter("firstOrDefault"),

            key: setKey,
            keys: setKeys,

            forEach: setForEach,
            count: modeSetter("count"),
            any: modeSetter("any")
        }

        const setLimits = (limit: number, offset?: number) =>
        {
            request.limit = limit;
            request.offset = offset;

            return finalisers;
        }

        const setCondition = (con: any) =>
        {
            request.condition = con;

            return {
                ...finalisers,
                limit: setLimits
            }
        }

        const setMutation = (mutate: any) =>
        {
            request.mutation = mutate;

            return {
                ...finalisers,
                limit: setLimits,
                where: setCondition
            }
        }

        const buildJoin = (request: QueryRequests.ISelect | QueryRequests.IJoin) => (table: string, condition: any) =>
        {
            const ijoin: QueryRequests.IJoin = 
            {
                table: table,
                condition: condition,
                mode: "all",
                merge: () => null
            }

            request.join = ijoin;

            const joinModeSetter = (mode: "first" | "all" | "count" | "any") => (merge: any) =>
            {
                ijoin.mode = mode;
                ijoin.merge = merge;

                return {
                    ...finalisers,
                    limit: setLimits,
                    where: setCondition,
                    mutate: setMutation,
                    join: buildJoin(ijoin)
                }
            }

            return {
                first: joinModeSetter("first"),
                all: joinModeSetter("all"),
                any: joinModeSetter("any"),
                count: joinModeSetter("count")
            }
        }

        return (table: string) =>
        {
            request.table = table;

            return {
                ...finalisers,
                limit: setLimits,
                where: setCondition,
                mutate: setMutation,
                join: buildJoin(request)
            }
        }
    }
}