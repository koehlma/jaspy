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


var Bytes = $Class('bytes', {
    constructor: function (array, cls) {
        if (!(array instanceof Uint8Array)) {
            raise(TypeError, 'invalid type of native bytes initializer');
        }
        PyObject.call(this, cls || Bytes.cls);
        this.array = array;
    },

    bool: function () {
        return this.array.length != 0;
    },

    get: function (offset) {
        return this.array[offset];
    },

    str: function () {
        var index;
        var result = [];
        // TODO: improve performance
        for (index = 0; index < this.array.length; index++) {
            result.push(String.fromCharCode(this.array[index]));
        }
        return new Str(result.join(''));
    },

    __repr__: function () {
        return new Str('b' + this.str().repr().value);
    },

    decode: function (encoding) {
        var decoder, result;
        if (!TextDecoder) {
            // Polyfill: https://github.com/inexorabletash/text-encoding
            raise(RuntimeError, 'browser does not support decoding, please enable the polyfill');
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
    }
});

Bytes.prototype.toString = Bytes.prototype.repr;


$.Bytes = Bytes;
