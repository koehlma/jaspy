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

var SINGLE_QUOTES_CODE = 39;
var DOUBLE_QUOTES_CODE = 34;

function PyBytes(value, cls) {
    if (!(value instanceof Uint8Array)) {
        raise(TypeError, 'invalid type of native bytes initializer');
    }
    PyObject.call(this, cls || py_bytes);
    this.array = value;
}

extend(PyBytes, PyObject);

PyBytes.prototype.bool = function () {
    return this.array.length != 0;
};

PyBytes.prototype.get = function (offset) {
    return this.array[offset];
};

PyBytes.prototype.repr = function () {
    var offset, char;
    var chars = new Array(this.array.length);
    for (offset = 0; offset < chars.length; offset++) {
        char = this.array[offset];
        if (char == SINGLE_QUOTES_CODE) {
            chars[offset] = '\\\'';
        } else if (char >= 32 && char <= 126) {
            chars[offset] = String.fromCharCode(char);
        } else {
            chars[offset] = '\\x' + ('0' + char.toString(16)).substr(-2);
        }
    }
    return 'b\'' + chars.join('') + '\'';
};

PyBytes.prototype.decode = function (encoding) {
    var decoder, result;
    if (!TextDecoder) {
        // Polyfill: https://github.com/inexorabletash/text-encoding
        raise(RuntimeError, 'browser does not support decoding, please use a polyfill');
    }
    try {
        decoder = new TextDecoder(encoding || 'utf-8', {fatal: true});
    } catch (error) {
        raise(LookupError, 'unknown encoding: ' + encoding);
    }
    try {
        result = decoder.decode(this.array);
    } catch (error) {
        raise(UnicodeDecodeError, 'unable to decode bytes object, data is not valid');
    }
    return result;
};

PyBytes.prototype.toString = PyBytes.prototype.repr;


$.PyBytes = PyBytes;
