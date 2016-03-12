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

function PyTuple(array, cls) {
    if (!(array instanceof Array)) {
        raise(TypeError, 'invalid type of native tuple initializer');
    }
    PyObject.call(this, cls || py_tuple);
    this.array = array;
}

extend(PyTuple, PyObject);

PyTuple.prototype.get = function (index) {
    return this.array[index];
};


$.PyTuple = PyTuple;
