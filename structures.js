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

    /* Helper Functions */
    function is_object(item) {
        return item instanceof Object;
    }

    function is_function(item) {
        return item instanceof Function;
    }

    function is_iterable(item) {
        return is_object(item) && is_function(item.iter);
    }


    function Exception() {
        this.name = 'Exception';
        this.message = 'an error occoured'
    }
    Exception.prototype = {
        toString: function () {
            return '[' + this.name + '] ' + this.message;
        }
    };

    function IndexError() {
        this.name = 'IndexError';
        this.message = 'list index out of range';
    }
    IndexError.prototype = Object.create(Exception.prototype, {});

    function KeyError() {
        this.name = 'KeyError';
        this.message = 'key not in mapping';
    }
    IndexError.prototype = Object.create(Exception.prototype, {});

    function ValueError(message) {
        this.name = 'ValueError';
        this.message = message || 'invalid value'
    }
    ValueError.prototype = Object.create(Exception.prototype, {});

    function TypeError(message) {
        this.name = 'TypeError';
        this.message = message || 'invalid type'
    }
    TypeError.prototype = Object.create(Exception.prototype, {});


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

    function iter(item) {
        if (is_iterable(item)) {
            return item.iter();
        } else if (item instanceof Array) {
            return new ArrayIterator(item);
        } else {
            throw new TypeError('item does not support iterable protocol')
        }
    }

    function ArrayIterator(array) {
        this.array = array;
        this.position = 0;
    }
    ArrayIterator.prototype = {
        has_next: function () {
            return this.position < this.array.length;
        },
        next: function () {
            if (this.has_next()) {
                return this.array[this.position++];
            }
            return null;
        }
    };


    function ListIterator(list) {
        this.list = list;
        this.position = 0;
    }
    ListIterator.prototype = {
        has_next: function () {
            return this.position < this.list.length;
        },
        next: function () {
            if (this.has_next()) {
                return this.list.get(this.position++);
            }
            return null;
        }
    };

    function List(initializer) {
        var index;
        this.array = new Array(4);
        if (initializer == null) {
            this.length = 0;
        } else if (initializer instanceof Array) {
            this.length = initializer.length;
            this.grow();
            for (index = 0; index < initializer.length; index++) {
                this.array[index] = initializer[index];
            }
        } else if (typeof initializer == 'number') {
            this.length = initializer;
            this.grow();
        } else if (is_iterable(initializer)){
            this.length = 0;
            var iterator = initializer.iter(), item;
            while (item = iterator.next()) {
                this.append(item);
            }
        } else {
            throw new TypeError('invalid type of list initializer')
        }
    }
    List.prototype = {
        _check: function (index) {
            if (index < 0 || index > this.length - 1) {
                throw new IndexError();
            }
        },
        grow: function () {
            if (this.array.length <= this.length) {
                var length = this.array.length * 2;
                while (length <= this.length) {
                    length = length * 2;
                }
                this.array.length = length;
            }
        },
        shrink: function () {
            if (this.array.length > 4 && this.array.length / 4 >= this.length) {
                var length = this.array.length / 2;
                while (length / 4 >= this.length && length > 4) {
                    length = length / 2;
                }
                this.array.length = length;
            }
        },
        get: function (index) {
            if (index < 0) {
                index = this.length - index;
            }
            this._check(index);
            return this.array[index];
        },
        set: function (index, item) {
            this._check(index);
            this.array[index] = item;
            return item;
        },
        index: function (item, last) {
            var index;
            last = last || false;
            if (last) {
                for (index = this.length - 1; index >= 0; index--) {
                    if (equals(item, this.array[index])) {
                        return index;
                    }
                }
            } else {
                for (index = 0; index < this.length; index++) {
                    if (equals(item, this.array[index])) {
                        return index;
                    }
                }
            }
            return -1;
        },
        count: function (item) {
            var index, counter = 0;
            for (index = 0; index < this.length; index++) {
                if (equals(item, this.array[index])) {
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
            this.grow();
            this.array[this.length - 1] = item;
            return item;
        },
        concat: function (list_or_array) {
            var new_list, index, length;
            if (!(list_or_array instanceof List || list_or_array instanceof Array)) {
                throw new TypeError('can only concat list and list or list and array')
            }
            length = list_or_array.length;
            if (list_or_array instanceof List) {
                list_or_array = list_or_array.array;
            }
            new_list = new List(this.length + length);
            for (index = 0; index < this.length; index++) {
                new_list.array[index] = this.array[index];
            }
            for (index = 0; index < length; index++) {
                new_list.array[index + this.length] = list_or_array[index];
            }
            return new_list;
        },
        insert: function (position, item) {
            var index;
            this.append(null);
            for (index = this.length - 1; index > position; index--) {
                this.array[index] = this.array[index - 1];
            }
            this.array[index] = item;
        },
        pop: function (index) {
            this._check(index);
            this.length--;
            if (index == null) {
                index = this.length;
            }
            var item = this.array[index];
            for (; index < this.length; index++) {
                this.array[index] = this.array[index + 1];
            }
            this.array[index] = null;
            this.shrink();
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
                temp = this.array[left];
                this.array[left] = this.array[right];
                this.array[right] = temp;
                left++;
                right--;
            }
        },
        clear: function () {
            this.array = new Array(4);
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
                    list.append(this.array[index]);
                }
            } else if (step < 0) {
                if (start >= this.length) {
                    start = this.length - 1;
                }
                if (stop < 0) {
                    stop = 0;
                }
                for (index = start; index > stop; index += step) {
                    list.append(this.array[index]);
                }
            } else {
                throw new ValueError('slice step cannot be zero')
            }
            return list;
        },
        copy: function () {
            return this.concat([]);
        },
        iter: function () {
            return new ListIterator(this);
        },
        sort: function () {

        }
    };


    function DictItemsIterator(dict) {
        var hash_code, bucket, index;
        this.dict = dict;
        this.items = new List();
        for (hash_code in this.dict.buckets) {
            if (this.dict.buckets.hasOwnProperty(hash_code)) {
                bucket = this.dict.buckets[hash_code];
                for (index = 0; index < bucket.length; index++) {
                    this.items.append(bucket.get(index));
                }
            }
        }
        this.iterator = this.items.iter();
    }
    DictItemsIterator.prototype = {
        has_next: function () {
            return this.iterator.has_next();
        },
        next: function () {
            return this.iterator.next();
        }
    };

    function DictKeysIterator(dict) {
        this.iterator = new DictItemsIterator(dict);
    }
    DictKeysIterator.prototype = {
        has_next: function () {
            return this.iterator.has_next();
        },
        next: function () {
            var item = this.iterator.next();
            if (item != null) {
                return item.key;
            }
            return null;
        }
    };

    function DictValuesIterator(dict) {
        this.iterator = new DictItemsIterator(dict);
    }
    DictValuesIterator.prototype = {
        has_next: function () {
            return this.iterator.has_next();
        },
        next: function () {
            var item = this.iterator.next();
            if (item != null) {
                return item.value;
            }
            return null;
        }
    };


    function Dict(initializer) {
        this.buckets = {};
        this.length = 0;
        if (initializer != undefined) {
            this.update(initializer);
        }
    }
    Dict.prototype = {
        put: function (key, value) {
            var hash_code = hash(key), bucket, index, item;
            if (this.buckets[hash_code] == undefined) {
                this.buckets[hash_code] = new List();
            }
            bucket = this.buckets[hash_code];
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
            var bucket = this.buckets[hash(key)];
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
            var bucket = this.buckets[hash_code];
            if (bucket != undefined) {
                var index, item;
                for (index = 0; index < bucket.length; index++) {
                    item = bucket.get(index);
                    if (equals(item.key, key)) {
                        bucket.remove(item);
                        if (bucket.length == 0) {
                            delete this.buckets[hash_code];
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
                for (var hash_code in this.buckets) {
                    if (this.buckets.hasOwnProperty(hash_code)) {
                        var bucket = this.buckets[hash_code];
                        var item = bucket.pop();
                        if (bucket.length == 0) {
                            delete this.buckets[hash_code];
                        }
                        this.length--;
                        return item;
                    }
                }
            }
            throw new KeyError();
        },
        contains: function (key) {
            var bucket = this.buckets[hash(key)];
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
        },
        update: function (dict_or_object) {
            if (dict_or_object instanceof Dict) {
                var iterator = dict_or_object.items(), item;
                while (item = iterator.next()) {
                    this.put(item.key, item.value)
                }
            } else if (is_object(dict_or_object)) {
                var key;
                for (key in dict_or_object) {
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
            this.buckets = {};
            this.length = 0;
        }
    };


    function list(initializer) {
        return new List(initializer);
    }

    function dict(initializer) {
        return new Dict(initializer);
    }



    var module = {
        'is_object': is_object,
        'is_function': is_function,
        'is_iterable': is_iterable,

        'Exception': Exception,
        'IndexError': IndexError,
        'KeyError': KeyError,
        'ValueError': ValueError,
        'TypeError': TypeError,

        'equals': equals,
        'hash': hash,
        'iter': iter,

        'List': List,
        'Dict': Dict,

        'list': list,
        'dict': dict
    };

    window.structures = module;
    return module;
});