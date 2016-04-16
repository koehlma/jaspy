/*
 * Copyright (C) 2016, Maximilian Koehl <mail@koehlma.de>
 * Copyright (C) 2016, Matthias Heerde <mail@m-heerde.de>
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


var Float = $Class('float', {
    constructor: function (value, cls) {
        if (!(typeof value == 'number')) {
            raise(TypeError, 'invalid type of native float initializer');
        }
        PyObject.call(this, cls || Float.cls);
        this.value = value;
    },

    number: function () {
        return this.value;
    },

    equals: function(other) {
        other = Float.unpack(other);
        return this.value == other ? True : False;
    },

    add: function(other) {
        other = Float.unpack(other);
        return new Float(this.value + other);
    },

    is_integer: function() {
        return Math.floor(this.value) == this.value ? True : False;
    },

    as_integer_ratio: function() {
        if (this.value == Number.POSITIVE_INFINITY || this.value == Number.NEGATIVE_INFINITY) {
            raise(OverflowError, 'Cannot pass infinity to float.as_integer_ratio.');
        }
        if (!Number.isFinite(this.value)) {
            raise(ValueError, 'Cannot pass NaN to float.as_integer_ratio.');
        }
        raise(NotImplemented);
    }
});

Float.pack = function (value) {
    return new Float(value);
};


Float.unpack = function (object, fallback) {
    if ((object === None || !object) && fallback != undefined) {
        return fallback;
    }
    if (typeof object == 'number') {
        return object;
    }
    if (!(object instanceof Int) && !(object instanceof Float)) {
        raise(TypeError, 'unable to unpack number from object');
    }
    return object.number();
};

$.Float = Float;
