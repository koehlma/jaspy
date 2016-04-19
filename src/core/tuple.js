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


var Tuple = $Class('tuple', {
    constructor: function (array, cls) {
        if (!(array instanceof Array)) {
            raise(TypeError, 'invalid type of native tuple initializer');
        }
        PyObject.call(this, cls || Tuple.cls);
        this.array = array;
        Object.freeze(this.array);
    },

    get: function (index) {
        return this.array[index];
    },

    len: function () {
        return this.array.length;
    },

    __iter__: function () {
        return new Tuple.Iterator(this);
    }
});


Tuple.Iterator = Iterator.extend('tuple_iterator', {
    constructor: function (tuple) {
        PyObject.call(this, Tuple.Iterator.cls);
        this.tuple = tuple;
        this.position = 0;
    },

    next: function () {
        if (this.position < this.tuple.array.length) {
            return this.tuple.array[this.position++];
        }
    }
});

$.Tuple = Tuple;
