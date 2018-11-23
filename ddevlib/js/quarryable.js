/**
 * A class for handling collections like quarries.
 * Simplifies sorting and searching.
 *
 * @export
 * @class QuarryAble
 * @template T
 */
export class QuarryAble {
    /**
     * Creates an instance of QuarryAble. DO NOT USE THIS; USE QuarryAble.Create INSTEAD
     *
     * @param {(QuarryAble<T> | null)} base Base collection
     * @param {(T[] | number[])} collection Indecies pointing at the base collection
     * @memberof QuarryAble
     */
    constructor(base, collection) {
        this.base = base;
        this.collection = collection;
    }
    /**
     *
     * The number of items in the current collection
     *
     * @readonly
     * @memberof QuarryAble
     */
    get count() { return this.isEmpty ? 0 : this.collection.length; }
    /**
     * Indicates wether the collection is empty or not
     *
     * @readonly
     * @memberof QuarryAble
     */
    get isEmpty() { return this.collection === null || this.collection === undefined || this.collection.length < 1; }
    /**
     * Indicates wether the collection is an item array or a pointer array
     *
     * @readonly
     * @memberof QuarryAble
     */
    get isDecendant() { return this.base !== null; }
    /**
     * Safe way to instantiate a new QuarryAble instane
     *
     * @static
     * @template T Type of items in collection
     * @param {(T[] | Set<T> | Iterable<T>)} items Collection
     * @returns A new QuarryAble instance
     * @memberof QuarryAble
     */
    static Create(items) {
        let collection = [];
        for (let item of items) {
            collection.push(item);
        }
        return new QuarryAble(null, collection);
    }
    /**
     * Converts this collection to a simple array
     *
     * @returns An array of type T
     * @memberof QuarryAble
     */
    toArray() {
        let collection = [];
        for (let i = 0; i < this.count; i++) {
            collection.push(this._get(i));
        }
        return collection;
    }
    //
    // Private data handling
    //
    _get(index) {
        if (this.base !== null) {
            return this.base._get(this._index(index));
        }
        else {
            return this.collection[index];
        }
    }
    _set(index, item) {
        if (this.base !== null) {
            console.warn("The base collection changed and this might no longer be usable");
            this.base._set(this._index(index), item);
        }
        else {
            this.collection[index] = item;
        }
    }
    _remove(indices) {
        if (this.base !== null) {
            console.warn("The base collection changed and this might no longer be usable");
            let parentIndices = [];
            for (let i of indices) {
                parentIndices.push(this._index(indices[i]));
            }
            this.base._remove(parentIndices);
        }
        else {
            //
            // Set indices in correct order
            //
            indices.sort();
            //
            // Loop backwards to not change index stuff
            //
            for (let i = this.count - 1; i > -1; i--) {
                this.collection.splice(indices[i], 1);
            }
        }
    }
    _push(item) {
        if (this.base !== null) {
            console.warn("The base collection changed and this might no longer be usable");
            this.base._push(item);
        }
        else {
            this.collection.push(item);
        }
    }
    _getIndexRefrence() {
        let ref = [];
        for (let i = 0; i < this.count; i++) {
            ref[i] = i;
        }
        return ref;
    }
    _index(localIndex) {
        if (this.base !== null) {
            return this.collection[localIndex];
        }
        else {
            return localIndex;
        }
    }
    _createChild(indexCollection) {
        return new QuarryAble(this, indexCollection);
    }
    //
    // Iterators
    //
    /**
     * Runs a function on all items in collection
     *
     * @param {(item: T) => void} func
     * @memberof QuarryAble
     */
    map(func) {
        for (let i = 0; i < this.count; i++) {
            func(this._get(i));
        }
    }
    //
    // Selectors
    //
    /**
     * Returns a new QuarryAble where only items passing the condition is present, a filter.
     *
     * @param {(item: T) => boolean} condition Condition for being included in the result
     * @returns QuarryAble<T>
     * @memberof QuarryAble
     */
    where(condition) {
        let indexCollection = [];
        for (let i = 0; i < this.count; i++) {
            if (condition(this._get(i))) {
                indexCollection.push(i);
            }
        }
        return this._createChild(indexCollection);
    }
    /**
     * Returns a new QuarryAble where the given limitations apply
     *
     * @param {number} count Max number of items in collection
     * @param {number} [offset] Where in collection to start getting new items
     * @returns
     * @memberof QuarryAble
     */
    limit(count, offset) {
        if (offset === undefined) {
            offset = 0;
        }
        let indexCollection = [];
        for (let i = offset; i < this.count && i < offset + count; i++) {
            indexCollection.push(i);
        }
        return this._createChild(indexCollection);
    }
    //
    // Modifiers
    //
    /**
     * Removes all items in collection
     *
     * @memberof QuarryAble
     */
    delete() {
        if (this.base !== null) {
            this._remove(this.collection);
        }
        else {
            this.collection = [];
        }
    }
    /**
     * Returns a collection identical to this, but in revesred order
     *
     * @returns
     * @memberof QuarryAble
     */
    reverse() {
        return this._createChild(this._getIndexRefrence().reverse());
    }
    /**
     * Returns a sorted collection with all items in current collection
     *
     * @param {(a: T, b: T) => number} comparator
     * @returns
     * @memberof QuarryAble
     */
    sort(comparator) {
        const indexComparator = (ia, ib) => comparator(this._get(ia), this._get(ib));
        let indexRef = this._getIndexRefrence().sort(indexComparator);
        return this._createChild(indexRef);
    }
    update(update) {
        for (let i = 0; i < this.count; i++) {
            this._set(i, update(this._get(i)));
        }
    }
    append(...add) {
        this.appendCollection(add);
    }
    appendCollection(collection) {
        for (let item of collection) {
            this._push(item);
        }
    }
    //
    // Getters
    //
    single() {
        if (this.count === 1) {
            return this._get(0);
        }
        else {
            throw new Error("Quarry contains " + this.count + " iten, but was expected to contain 1");
        }
    }
    first() {
        if (this.count > 0) {
            return this._get(0);
        }
        else {
            throw new Error("Quarry is empty");
        }
    }
    copy() {
        let items = [];
        for (let i = 0; i < this.count; i++) {
            items.push(this._get(i));
        }
        return new QuarryAble(null, items);
    }
    convert(conversion) {
        let collection = [];
        for (let i = 0; i < this.count; i++) {
            collection.push(conversion(this._get(i)));
        }
        return collection;
    }
}
//# sourceMappingURL=quarryable.js.map