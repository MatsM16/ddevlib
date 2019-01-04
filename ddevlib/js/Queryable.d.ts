/**
 * A class for handling collections like quarries.
 * Simplifies sorting and searching.
 *
 * @export
 * @class QuarryAble
 * @template T
 */
export declare class QueryAble<T> {
    private base;
    private collection;
    /**
     * Creates an instance of QuarryAble. DO NOT USE THIS; USE QuarryAble.Create INSTEAD
     *
     * @param {(QueryAble<T> | null)} base Base collection
     * @param {(T[] | number[])} collection Indecies pointing at the base collection
     * @memberof QuarryAble
     */
    constructor(base: QueryAble<T> | null, collection: T[] | number[]);
    /**
     *
     * The number of items in the current collection
     *
     * @readonly
     * @memberof QuarryAble
     */
    readonly count: number;
    /**
     * Indicates wether the collection is empty or not
     *
     * @readonly
     * @memberof QuarryAble
     */
    readonly isEmpty: boolean;
    /**
     * Indicates wether the collection is an item array or a pointer array
     *
     * @readonly
     * @memberof QuarryAble
     */
    readonly isDecendant: boolean;
    /**
     * Safe way to instantiate a new QuarryAble instane
     *
     * @static
     * @template T Type of items in collection
     * @param {(T[] | Set<T> | Iterable<T>)} items Collection
     * @returns A new QuarryAble instance
     * @memberof QuarryAble
     */
    static Create<T>(items: T[] | Set<T> | Iterable<T>): QueryAble<T>;
    /**
     * Converts this collection to a simple array
     *
     * @returns An array of type T
     * @memberof QuarryAble
     */
    toArray(): T[];
    private _get;
    private _set;
    private _remove;
    private _push;
    private _getIndexRefrence;
    private _index;
    private _createChild;
    /**
     * Runs a function on all items in collection
     *
     * @param {(item: T) => void} func
     * @memberof QuarryAble
     */
    map(func: (item: T) => void): void;
    /**
     * Returns a new QuarryAble where only items passing the condition is present, a filter.
     *
     * @param {(item: T) => boolean} condition Condition for being included in the result
     * @returns QuarryAble<T>
     * @memberof QuarryAble
     */
    where(condition: (item: T) => boolean): QueryAble<T>;
    /**
     * Returns a new QuarryAble where the given limitations apply
     *
     * @param {number} count Max number of items in collection
     * @param {number} [offset] Where in collection to start getting new items
     * @returns
     * @memberof QuarryAble
     */
    limit(count: number, offset?: number): QueryAble<T>;
    /**
     * Removes all items in collection
     *
     * @memberof QuarryAble
     */
    delete(): void;
    /**
     * Returns a collection identical to this, but in revesred order
     *
     * @returns
     * @memberof QuarryAble
     */
    reverse(): QueryAble<T>;
    /**
     * Returns a sorted collection with all items in current collection
     *
     * @param {(a: T, b: T) => number} comparator
     * @returns
     * @memberof QuarryAble
     */
    sort(comparator: (a: T, b: T) => number): QueryAble<T>;
    update(update: (item: T) => T): void;
    append(...add: T[]): void;
    appendCollection(collection: T[] | Set<T> | Iterable<T>): void;
    single(): T;
    first(): T;
    copy(): QueryAble<T>;
    convert<T2>(conversion: (item: T) => T2): T2[];
}
