import { Guid } from "./Guid.js";
export var QueryBuilder;
(function (QueryBuilder) {
    function buildDelete(promise, cb) {
        const request = {
            table: ""
        };
        const resolve = () => { cb(request); return promise; };
        return (table) => {
            request.table = table;
            return {
                key: key => { request.key = key; return resolve(); },
                keys: keys => { request.keys = keys; return resolve(); },
                where: condition => { request.condition = condition; return resolve(); }
            };
        };
    }
    QueryBuilder.buildDelete = buildDelete;
    function buildInsert(promise, cb) {
        const request = {
            table: "",
            items: [],
            keys: []
        };
        let _auto;
        const setItems = (...items) => {
            request.items.push(...items);
            cb(request);
            if (_auto) {
                if (_auto === "guid")
                    for (const _ in items)
                        request.keys.push(Guid.RANDOM.value);
                else if (_auto === "random")
                    request.keys.push(...crypto.getRandomValues(new Uint32Array(items.length)));
            }
            return promise;
        };
        const setKey = (key) => {
            request.keys = [key];
            return {
                item: (i) => setItems(i)
            };
        };
        const setKeys = (keys) => {
            request.keys = keys;
            return {
                items: (i) => setItems(...i)
            };
        };
        const setAuto = (mode) => {
            _auto = mode;
            return {
                item: (i) => setItems(i),
                items: (i) => setItems(...i)
            };
        };
        const setKeyField = (field) => {
            request.keyField = field;
            return {
                auto: setAuto,
                key: setKey,
                keys: setKeys
            };
        };
        return (table) => {
            request.table = table;
            return {
                key: setKey,
                keys: setKeys,
                keyField: setKeyField,
                auto: setAuto
            };
        };
    }
    QueryBuilder.buildInsert = buildInsert;
    function buildUpdate(promise, cb) {
        const request = {
            table: "",
            updator: i => i
        };
        const setSet = (u) => {
            request.updator = u;
            cb(request);
            return promise;
        };
        const setCondition = (con) => {
            request.condition = con;
            return {
                set: setSet
            };
        };
        const setkey = (key) => {
            request.key = key;
            return {
                set: setSet
            };
        };
        const setkeys = (keys) => {
            request.keys = keys;
            return {
                set: setSet
            };
        };
        return (table) => {
            request.table = table;
            return {
                set: setSet,
                where: setCondition,
                key: setkey,
                keys: setkeys
            };
        };
    }
    QueryBuilder.buildUpdate = buildUpdate;
    function buildSelect(promise, cb) {
        const request = {
            table: "",
            mode: "all"
        };
        const modeSetter = (mode) => (def) => {
            request.mode = mode;
            request.def = def;
            cb(request);
            return promise;
        };
        const setKey = (key) => {
            request.key = key;
            return modeSetter("key")(undefined);
        };
        const setKeys = (keys) => {
            request.keys = keys;
            return modeSetter("keys")(undefined);
        };
        const setForEach = (forEach) => {
            request.forEach = forEach;
            return modeSetter("forEach")(undefined);
        };
        const finalisers = {
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
        };
        const setLimits = (limit, offset) => {
            request.limit = limit;
            request.offset = offset;
            return finalisers;
        };
        const setCondition = (con) => {
            request.condition = con;
            return Object.assign({}, finalisers, { limit: setLimits });
        };
        const setMutation = (mutate) => {
            request.mutation = mutate;
            return Object.assign({}, finalisers, { limit: setLimits, where: setCondition });
        };
        const buildJoin = (request) => (table, condition) => {
            const ijoin = {
                table: table,
                condition: condition,
                mode: "all",
                merge: () => null
            };
            request.join = ijoin;
            const joinModeSetter = (mode) => (merge) => {
                ijoin.mode = mode;
                ijoin.merge = merge;
                return Object.assign({}, finalisers, { limit: setLimits, where: setCondition, mutate: setMutation, join: buildJoin(ijoin) });
            };
            return {
                first: joinModeSetter("first"),
                all: joinModeSetter("all"),
                any: joinModeSetter("any"),
                count: joinModeSetter("count")
            };
        };
        return (table) => {
            request.table = table;
            return Object.assign({}, finalisers, { limit: setLimits, where: setCondition, mutate: setMutation, join: buildJoin(request) });
        };
    }
    QueryBuilder.buildSelect = buildSelect;
})(QueryBuilder || (QueryBuilder = {}));
