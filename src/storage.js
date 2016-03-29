let storageNames = [
    'selectronTube',
    'floppyDisk',
    'zipDrive',
    'DVD',
    'sdCard',
    'flashDrive',
    'SSD',
    'ssdArray',
    'serverRack',
    'serverRoom',
    'dataCenter',
    'multipleCenters',
    'smallAfricanCountry',
    'multipleCountries',
    'alienSpaceArray',
    'enslavedHumans'
];

/** Class representing a storage object.
 * @typeicalname storageObj
 * @class
 */
class Storage {
    /**
     * Instantiate a Storage object
     * @constructor
     * @param {string} name - Name of storage object.
     * @param {number} idx - Index in list of StorageContainer's storage objects.
     * @param {string | undefined} prev - Name of Storage object preceding this object in list of StorageContainer's storage objects.
     */
    constructor(name, idx, prev) {
        /** @prop {string} name - Name of storage object */
        this.name = name;
        /** @prop {number} idx - Index in list of StorageContainer's storage objects. */
        this.idx = idx;
        /** @prop {number} capacity - Capacity of storage object */
        this.capacity = Math.pow(1024, idx+1);
        /** @prop {number} price - Price of storage object */
        this.price = Math.pow(1024, idx) - 1;
        /** @prop {string | undefined} prev - Name of Storage object preceding this object in list of StorageContainer's storage objects. */
        this.prev = prev;
    }
}

let instance = null;

/** Class representing a container for all Storage instances, as well as a representation of the current Storage instance.
 * @typeicalname storage
 * @class
 */
class StorageContainer {
    constructor(storages) {
        var _storages = {};
        var _storageArr = [];
        for (let i = 0; i < storages.length; i++) {
            let name = storages[i];
            let prev = null;
            if (i > 0) {
                prev = storages[i-1];
            }
            let storage = new Storage(name, i, prev);
            _storageArr.push(storage);
            _storages[name] = storage;
        }
        this._storages = _storages;
        this._storageNames = storages;
        _storageArr.sort((a, b) => a.idx - b.idx);
        this._storageArr = _storageArr;
        this._current = _storages[storages[0]];
    }
    
    /**
     * Name of current storage.
     * @type {string}
     */
    get name() {
        return this._current.name;
    }
    
    /**
     * Capacity of current storage.
     * @type {number}
     */
    get capacity() {
        return this._current.capacity;
    }
    
    /**
     * Price of current storage.
     * @type {number}
     */
    get price() {
        return this._current.price;
    }
    
    /**
     * ID of current storage.
     * @type {number}
     */
    get idx() {
        return this._current.idx;
    }
    
    /**
     * Current storage.
     * @type {Storage}
     */
    get current() {
        return this._current;
    }
    
    
    set current(val) {
        console.log("Type of val:", val);
        console.log("Val:", val);
        if (typeof val === "string") {
            this._current = this._storages[val];
        } else if (typeof val === "object" && 'name' in val && val.name in this._storages) {
            this._current = this._storages[val.name];
        } else {
            console.error("Invalid parameter type.");
        }
    }
    
    /**
     * Next storage in upgrade list.
     * @type {Storage}
     */
    get upgrade() {
        return this._storageArr.find((e) => e.prev === this._current.name);
    }
    
    /**
     * Check if storage is full.
     * @param {number} data - Data to check against.
     * @param {number} increment - Increment to check against.
     * @return {boolean} If storage has enough space.
     */
    checkStorage(data, increment) {
        return ((data + increment) <= this._current.capacity);
    }
    
    /**
     * Names of all storages excluding the currently selected.
     * @type {string[]}
     */
    get otherNames() {
        var storNames = this._storageNames.slice();
        storNames.splice(this._current.idx, 1);
        return storNames;
    }
    
    /**
     * All storages excluding the currently selected.
     * @type {Object}
     */
    get others() {
        return this.otherNames.reduce((o, v) => {
            o[v] = this._storages[v];
            return o;
        }, {});
    }
    
    /**
     * Names of all storages.
     * @type {string[]}
     */
    get allNames() {
        return this._storageNames;
    }
    
    /**
     * All storages.
     * @type {Object}
     */
    get all() {
        return this._storages;
    }
}

/**
 * Instantiate StorageContainer
 * @memberof StorageContainer
 * @param {string[] | undefined} storages - Names of storages. If undefined, use default storages.
 * @return {StorageContainer}
 */
function getStorage(storages = storageNames) {
    if (!instance) {
        instance = new StorageContainer(storages);
    }
    return instance;
}

export { getStorage, Storage };
