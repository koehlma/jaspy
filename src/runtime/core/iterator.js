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


var Iterator = $Class('iterator', {
    constructor: function (cls) {
        PyObject.call(this, cls);
    },

    next: function () {
        raise(NotImplemented, 'next not implemented by native iterator');
    },

    __next__: function () {
        var value = this.next();
        if (!value) {
            raise(StopIteration);
        }
        return value;
    },

    __iter__: function () {
        return this;
    }
});


$.Iterator = Iterator;
