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


var PyFloat = PyObject.extend({
    constructor: function (value, cls) {
        if (!(typeof value == 'number')) {
            raise(TypeError, 'invalid type of native float initializer');
        }
        PyObject.call(this, cls || py_float);
        this.value = value;
    },

    number: function () {
        return this.value;
    }
});


$.PyFloat = PyFloat;
