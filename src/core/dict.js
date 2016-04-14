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
    constructor: function (namespace, cls) {
        PyObject.call(this, cls || Dict.cls);
        this.table = namespace || {};
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
        return this.table[str_key] || fallback || null;
    },

    set: function (str_key, value) {
        if (typeof str_key == 'string') {
            str_key = pack_str(str_key);
        } else if (!(str_key instanceof Str)) {
            raise(TypeError, 'invalid native dict key type');
        }
        this.table[str_key] = value;
    },

    pop: function (str_key) {
        var value;
        if (str_key instanceof Str) {
            str_key = str_key.value;
        } else if (typeof str_key != 'string') {
            raise(TypeError, 'invalid native dict key type');
        }
        value = this.table[str_key];
        delete this.table[str_key];
        return value;
    }
});


$.Dict = Dict;
