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

function PyStr(value, cls) {
    PyObject.call(this, cls || py_str);
    this.value = value;
}

extend(PyStr, PyObject);

PyStr.prototype.encode = function (encoding) {
    var encoder, result;
    if (!TextEncoder) {
        // Polyfill: https://github.com/inexorabletash/text-encoding
        raise(RuntimeError, 'browser does not support encoding, please use a polyfill');
    }
    try {
        encoder = new TextEncoder(encoding || 'utf-8');
    } catch (error) {
        raise(LookupError, 'unknown encoding: ' + encoding);
    }
    try {
        result = encoder.encode(this.value);
    } catch (error) {
        console.log(error);
        raise(UnicodeEncodeError, 'unable to decode bytes object, data is not valid');
    }
    return result;
};

PyStr.prototype.toString = function () {
    return this.value;
};


$.PyStr = PyStr;
