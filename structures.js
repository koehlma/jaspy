/*
 * Copyright (C) 2016, Maximilian Koehl <mail@koehlma.de>
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

define(function () {
    'use strict';

    /* helper functions */
    function is_object(item) {
        return item instanceof Object;
    }

    function is_function(item) {
        return item instanceof Function;
    }

    function is_iterable(item) {
        return is_object(item) && is_function(item.iter);
    }


    /* exceptions */
    function IndexError() {
        Error.call(this, '[IndexError] index out of range');
    }
    IndexError.prototype = Object.create(RangeError.prototype);

    function KeyError() {
        Error.call(this, '[KeyError] key not found');
    }
    KeyError.prototype = Object.create(Error.prototype);

    function ValueError(message) {
        Error.call(this, '[ValueError] ' + (message || 'invalid value'));
    }
    ValueError.prototype = Object.create(Error.prototype);

    function TypeError(message) {
        Error.call(this, '[TypeError] ' + (message || 'invalid type'));
    }
    TypeError.prototype = Object.create(Error.prototype);


    /* custom equals and hash functions */
    function equals(item1, item2) {
        if (is_object(item1) && is_function(item1.equals)) {
            return item1.equals(item2);
        } else if (is_object(item2) && is_function(item2.equals)) {
            return item2.equals(item1);
        } else {
            return item1 == item2;
        }
    }

    function hash(item) {
        if (is_object(item) && is_function(item.hash)) {
            return item.hash();
        } else {
            return '' + item;
        }
    }


    /* array based list */
    function ListIterator(list) {
        this._list = list;
        this.index = 0;
    }
    ListIterator.prototype = {
        has_next: function () {
            return this.index < this._list.length;
        },
        next: function () {
            if (this.has_next()) {
                return this._list.get(this.index++);
            }
            return null;
        }
    };

    function List(initializer) {
        this._array = new Array(4);
        var index;
        if (initializer == undefined) {
            this.length = 0;
        } else if (initializer instanceof Array) {
            this.length = initializer.length;
            this._grow();
            for (index = 0; index < initializer.length; index++) {
                this._array[index] = initializer[index];
            }
        } else if (is_iterable(initializer)){
            this.length = 0;
            var iterator = initializer.iter(), item;
            while (item = iterator.next()) {
                this.append(item);
            }
        } else if (typeof initializer == 'number') {
            this.length = initializer;
            this._grow();
        } else {
            throw new TypeError('invalid type of list initializer')
        }
    }
    List.prototype = {
        _check: function (index) {
            if (index < 0) {
                index = this.length - index;
            }
            if (index < 0 || index > this.length - 1) {
                throw new IndexError();
            }
            return index;
        },
        _grow: function () {
            if (this._array.length <= this.length) {
                var length = this._array.length * 2;
                while (length <= this.length) {
                    length = length * 2;
                }
                this._array.length = length;
            }
        },
        _shrink: function () {
            if (this._array.length > 4 && this._array.length / 4 >= this.length) {
                var length = this._array.length / 2;
                while (length / 4 >= this.length && length > 4) {
                    length = length / 2;
                }
                this._array.length = length;
            }
        },
        get: function (index) {
            index = this._check(index);
            return this._array[index];
        },
        set: function (index, item) {
            index = this._check(index);
            return this._array[index] = item;
        },
        index: function (item, last) {
            var index;
            last = last || false;
            if (last) {
                for (index = this.length - 1; index >= 0; index--) {
                    if (equals(item, this._array[index])) {
                        return index;
                    }
                }
            } else {
                for (index = 0; index < this.length; index++) {
                    if (equals(item, this._array[index])) {
                        return index;
                    }
                }
            }
            return -1;
        },
        count: function (item) {
            var index, counter = 0;
            for (index = 0; index < this.length; index++) {
                if (equals(item, this._array[index])) {
                    counter++;
                }
            }
            return counter;
        },
        contains: function (item) {
            return this.index(item) >= 0;
        },
        append: function (item) {
            this.length++;
            this._grow();
            this._array[this.length - 1] = item;
            return item;
        },
        insert: function (position, item) {
            var index;
            if (position < 0) {
                position = 0
            }
            this.append(null);
            for (index = this.length - 1; index > position; index--) {
                this._array[index] = this._array[index - 1];
            }
            this._array[index] = item;
        },
        pop: function (index) {
            this._check(index);
            this.length--;
            if (index == null) {
                index = this.length;
            }
            var item = this._array[index];
            for (; index < this.length; index++) {
                this._array[index] = this._array[index + 1];
            }
            this._array[index] = null;
            this._shrink();
            return item;
        },
        remove: function (item) {
            var index = this.index(item);
            if (index < 0) {
                throw new ValueError('item not in list');
            } else {
                return this.pop(index);
            }
        },
        reverse: function () {
            var left = 0, right = this.length - 1, temp;
            while (right > left) {
                temp = this._array[left];
                this._array[left] = this._array[right];
                this._array[right] = temp;
                left++;
                right--;
            }
        },
        clear: function () {
            this._array = new Array(4);
            this.length = 0;
        },
        slice: function (start, stop, step) {
            var index, list = new List();
            if (start == null) {
                start = 0;
            } else if (start < 0) {
                start = this.length + start;
            }
            if (stop == null) {
                stop = this.length;
            } else if (stop < 0) {
                stop = this.length + stop;
            }
            step = step || 1;
            if (step > 0) {
                if (start < 0) {
                    start = 0;
                }
                if (stop > this.length) {
                    stop = this.length;
                }
                for (index = start; index < stop; index += step) {
                    list.append(this._array[index]);
                }
            } else if (step < 0) {
                if (start >= this.length) {
                    start = this.length - 1;
                }
                if (stop < 0) {
                    stop = 0;
                }
                for (index = start; index > stop; index += step) {
                    list.append(this._array[index]);
                }
            } else {
                throw new ValueError('slice step cannot be zero')
            }
            return list;
        },
        concat: function (list_or_array) {
            var list, index, length;
            if (!(list_or_array instanceof List || list_or_array instanceof Array)) {
                throw new TypeError('can only concat with list or array')
            }
            length = list_or_array.length;
            if (list_or_array instanceof List) {
                list_or_array = list_or_array._array;
            }
            list = new List(this.length + length);
            for (index = 0; index < this.length; index++) {
                list._array[index] = this._array[index];
            }
            for (index = 0; index < length; index++) {
                list._array[index + this.length] = list_or_array[index];
            }
            return list;
        },
        copy: function () {
            return this.concat([]);
        },
        iter: function () {
            return new ListIterator(this);
        },
        map: function (callback) {
            var result = new List(this.length), index;
            for (index = 0; index < this.length; index++) {
                result._array[index] = callback(this._array[index]);
            }
            return result;
        },
        filter: function (callback) {
            var result = new List(), index;
            for (index = 0; index < this.length; index++) {
                if (callback(this._array[index])) {
                    result.append(this._array[index]);
                }
            }
            return result;
        }
    };


    /* object based hash table */
    function DictItemsIterator(dict) {
        var items, hash_code, bucket, index;
        items = new List();
        for (hash_code in dict._buckets) {
            if (dict._buckets.hasOwnProperty(hash_code)) {
                bucket = dict._buckets[hash_code];
                for (index = 0; index < bucket.length; index++) {
                    items.append(bucket.get(index));
                }
            }
        }
        ListIterator.call(this, items);
    }
    DictItemsIterator.prototype = Object.create(ListIterator.prototype);

    function DictKeysIterator(dict) {
        DictItemsIterator.call(this, dict);
    }
    DictKeysIterator.prototype = Object.create(DictItemsIterator.prototype);
    DictKeysIterator.prototype.next = function () {
        var item = DictItemsIterator.prototype.next.call(this);
        if (item != null) {
            return item.key;
        }
        return null;
    };

    function DictValuesIterator(dict) {
        DictItemsIterator.call(this, dict);
    }
    DictValuesIterator.prototype = Object.create(DictItemsIterator.prototype);
    DictValuesIterator.prototype.next = function () {
        var item = DictItemsIterator.prototype.next.call(this);
        if (item != null) {
            return item.value;
        }
        return null;
    };

    function Dict(initializer) {
        this._buckets = {};
        this.length = 0;
        if (initializer != undefined) {
            this.update(initializer);
        }
    }
    Dict.prototype = {
        put: function (key, value) {
            var hash_code = hash(key), bucket, index, item;
            if (this._buckets[hash_code] == undefined) {
                this._buckets[hash_code] = new List();
            }
            bucket = this._buckets[hash_code];
            for (index = 0; index < bucket.length; index++) {
                item = bucket.get(index);
                if (equals(item.key, key)) {
                    item.value = value;
                    return;
                }
            }
            this.length++;
            bucket.append({'key': key, 'value': value});
        },
        get: function (key) {
            var bucket = this._buckets[hash(key)];
            if (bucket != undefined) {
                var index, item;
                for (index = 0; index < bucket.length; index++) {
                    item = bucket.get(index);
                    if (equals(item.key, key)) {
                        return item.value;
                    }
                }
            }
            throw new KeyError();
        },
        pop: function (key, default_value) {
            var hash_code = hash(key);
            var bucket = this._buckets[hash_code];
            if (bucket != undefined) {
                var index, item;
                for (index = 0; index < bucket.length; index++) {
                    item = bucket.get(index);
                    if (equals(item.key, key)) {
                        bucket.remove(item);
                        if (bucket.length == 0) {
                            delete this._buckets[hash_code];
                        }
                        this.length--;
                        return item.value;
                    }
                }
            }
            if (default_value == undefined) {
                throw new KeyError();
            } else {
                return default_value;
            }
        },
        popitem: function () {
            if (this.length > 0) {
                for (var hash_code in this._buckets) {
                    if (this._buckets.hasOwnProperty(hash_code)) {
                        var bucket = this._buckets[hash_code];
                        var item = bucket.pop();
                        if (bucket.length == 0) {
                            delete this._buckets[hash_code];
                        }
                        this.length--;
                        return item;
                    }
                }
            }
            throw new KeyError();
        },
        contains: function (key) {
            var bucket = this._buckets[hash(key)];
            if (bucket != undefined) {
                var index, item;
                for (index = 0; index < bucket.length; index++) {
                    item = bucket.get(index);
                    if (equals(item.key, key)) {
                        return true;
                    }
                }
            }
            return false;
        },
        update: function (dict_or_object) {
            if (dict_or_object instanceof Dict) {
                var iterator = dict_or_object.items(), item;
                while (item = iterator.next()) {
                    this.put(item.key, item.value)
                }
            } else if (is_object(dict_or_object)) {
                for (var key in dict_or_object) {
                    if (dict_or_object.hasOwnProperty(key)) {
                        this.put(key, dict_or_object[key]);
                    }
                }
            } else {
                throw new TypeError('can only update dict from dict or object')
            }
        },
        copy: function () {
            return new Dict(this);
        },
        clear: function () {
            this._buckets = {};
            this.length = 0;
        },
        items: function () {
            return new DictItemsIterator(this);
        },
        keys: function () {
            return new DictKeysIterator(this);
        },
        values: function () {
            return new DictValuesIterator(this);
        },
        iter: function () {
            return new DictItemsIterator(this);
        }
    };


    /* shortcuts */
    function list(initializer) {
        return new List(initializer);
    }

    function dict(initializer) {
        return new Dict(initializer);
    }


    /* module interface */
    var module = {
        'is_object': is_object,
        'is_function': is_function,
        'is_iterable': is_iterable,

        'IndexError': IndexError,
        'KeyError': KeyError,
        'ValueError': ValueError,
        'TypeError': TypeError,

        'equals': equals,
        'hash': hash,

        'List': List,
        'Dict': Dict,

        'list': list,
        'dict': dict
    };


    /* export */
    window['structures'] = module;
    return module;
});