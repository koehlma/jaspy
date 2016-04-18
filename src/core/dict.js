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


var Dict = $Class('dict', {
    constructor: function (table, cls) {
        PyObject.call(this, cls || Dict.cls);
        if (!issubclass(this.__class__, Dict.cls)) {
            raise(TypeError, 'unable to create dict with non dict subclass');
        }
        this.table = table || {};
        this.size = 0;
        if (!(this.table instanceof Object)) {
            raise(TypeError, 'invalid type of native dict initializer');
        }
    },

    get: function (str_key, fallback) {
        if (str_key instanceof Str) {
            str_key = str_key.value;
        } else if (typeof str_key != 'string') {
            raise(TypeError, 'invalid native dict key type');
        }
        var entry = this.table[str_key];
        while (entry) {
            if (entry.key instanceof Str && entry.key.value == str_key) {
                return entry.value;
            }
            entry = entry.next;
        }
        return fallback;
    },

    set: function (str_key, value) {
        if (str_key instanceof Str) {
            str_key = str_key.value;
        } else if (typeof str_key != 'string') {
            raise(TypeError, 'invalid native dict key type');
        }
        var entry = this.table[str_key];
        while (entry) {
            if (entry.key instanceof Str && entry.key.value == str_key) {
                entry.value = value;
                return;
            }
            entry = entry.next;
        }
        this.table[str_key] = new Dict.Entry(new Str(str_key), value, this.table[str_key]);
        this.size++;
    },

    pop: function (str_key) {
        var entry, previous;
        if (str_key instanceof Str) {
            str_key = str_key.value;
        } else if (typeof str_key != 'string') {
            raise(TypeError, 'invalid native dict key type');
        }
        entry = this.table[str_key];
        while (entry) {
            if (entry.key instanceof Str && entry.key.value == str_key) {
                if (previous) {
                    previous.next = entry.next;
                } else if (entry.next) {
                    this.table[str_key] = entry.next;
                } else {
                    delete this.table[str_key];
                }
                this.size--;
                return entry.value;
            }
            previous = entry;
            entry = entry.next;
        }
    },

    entries: function () {
        var hash, entry;
        var entries = new List();
        for (hash in this.table) {
            if (this.table.hasOwnProperty(hash)) {
                entry = this.table[hash];
                while (entry) {
                    entries.append(entry);
                    entry = entry.next;
                }
            }
        }
        return entries;
    },

    copy: function () {
        var hash, entry;
        var dict = new Dict();
        dict.size = this.size;
        for (hash in this.table) {
            if (this.table.hasOwnProperty(hash)) {
                entry = this.table[hash];
                while (entry) {
                    dict.table[hash] = new Dict.Entry(entry.key, entry.value, dict.table[hash]);
                    entry = entry.next;
                }
            }
        }
        return dict;
    },

    clear: function () {
        this.table = {};
        this.size = 0;
    },

    __len__: function () {
        return new Int(this.size);
    }
});


Dict.Entry = Class({
    constructor: function (key, value, next) {
        this.key = key;
        this.value = value;
        this.next = next;
    }
});


Dict.Values = $Class('dict_values', {
    constructor: function (dict) {
        PyObject.call(this, Dict.Values.cls);
    }
});


Dict.Keys = $Class('dict_keys', {
    constructor: function (dict) {
        PyObject.call(this, Dict.Values.cls);
    }

});



$.Dict = Dict;
