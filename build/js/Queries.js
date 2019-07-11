export var QueryBuilder;
(function (QueryBuilder) {
    function buildDelete(cb) {
        const request = {
            table: ""
        };
        const resolve = () => cb(request);
        return (table) => {
            request.table = table;
            return {
                key: key => { request.key = key; return resolve(); },
                keys: keys => { request.keys = keys; return resolve(); },
                where: condition => { request.condition = condition; return resolve(); },
                all: () => { request.condition = () => true; return resolve(); }
            };
        };
    }
    QueryBuilder.buildDelete = buildDelete;
    function buildInsert(cb) {
        const request = {
            table: "",
            item: undefined,
            key: ""
        };
        const setItem = (item) => {
            request.item = item;
            return cb(request);
        };
        const setKey = (key) => {
            request.key = key;
            return {
                item: setItem
            };
        };
        return (table) => {
            request.table = table;
            return {
                key: setKey,
                item: setItem,
            };
        };
    }
    QueryBuilder.buildInsert = buildInsert;
    function buildUpdate(cb) {
        const request = {
            table: "",
            updater: i => i
        };
        const setSet = (u) => {
            request.updater = u;
            return cb(request);
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
    function buildSelect(cb) {
        const request = {
            table: "",
            mode: "all"
        };
        const modeSetter = (mode) => (def) => {
            request.mode = mode;
            request.def = def;
            return cb(request);
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
