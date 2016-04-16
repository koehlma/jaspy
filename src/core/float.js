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

    add: function(other) {

        return this.value + other.value;
    }
});

Float.pack = function (value) {
    return new Float(value);
};


Float.unpack = function (object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof Int) && !(object instanceof Float)) {
        raise(TypeError, 'unable to unpack number from object');
    }
    return object.number();
};

$.Float = Float;
