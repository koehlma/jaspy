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


var PyCode = PyObject.extend({
    constructor: function (code, cls) {
        if (!(code instanceof Code)) {
            raise(TypeError, 'invalid type of native code initializer');
        }
        PyObject.call(this, cls || py_code);
        this.code = code;
    }
});


function new_code(value) {
    return new PyCode(value);
}


$.PyCode = PyCode;

$.new_code = new_code;
