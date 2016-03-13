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

function PyJSObject(object, cls) {
    if (!(object instanceof Object)) {
        raise(TypeError, 'invalid type of native object initializer');
    }
    PyObject.call(this, cls || py_js_object);
    this.object = object;
}

extend(PyJSObject, PyObject);


function PyJSArray(array, cls) {
    if (!(array instanceof Array)) {
        raise(TypeError, 'invalid type of native array initializer');
    }
    PyObject.call(this, cls || py_js_array);
    this.array = array;
}

extend(PyJSArray, PyObject);


function PyJSFunction(func, cls) {
    if (typeof func != 'function') {
        raise(TypeError, 'invalid type of native function initializer');
    }
    PyObject.call(this, cls || py_js_function);
    this.func = func;
}

extend(PyJSFunction, PyObject);


$.PyJSObject = PyJSObject;
$.PyJSArray = PyJSArray;
$.PyJSFunction = PyJSFunction;
