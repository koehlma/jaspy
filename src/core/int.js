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

var Int = $Class('int', {
    constructor: function (value, cls) {
        PyObject.call(this, cls || Int.cls);
        try {
            this.value = bigInt(value);
        } catch (error) {
            raise(TypeError, 'invalid type of native int initializer');
        }
    },

    toString: function () {
        return this.value.toString();
    },

    valueOf: function () {
        return this.number();
    },

    to_bool: function () {
        return this.value.neq(0);
    },

    to_string: function () {
        return this.value.toString();
    },

    is: function (other) {
        if (other instanceof Int) {
            return this.value.eq(other.value);
        }
        return false;
    },

    to_number: function () {
        var number = this.value.toJSNumber();
        if (number == Infinity || number == -Infinity) {
            raise(OverflowError, 'int too large to convert to float');
        }
        return number;
    },

    float: function () {
        return new Float(this.to_number());
    },


    __abs__: function () {
        return new Int(this.value.abs());
    },

    __pos__: function () {
        return this;
    },

    __neg__: function () {
        return new Int(this.value.negate());
    },

    __invert__: function () {
        return new Int(this.value.not());
    },

    __add__: function (other) {
        return new Int(this.value.add(other.value));
    },

    __sub__: function (other) {
        return new Int(this.value.subtract(other.value));
    },

    __pow__: function (other) {
        if (other < 0) {
            return Float.pack(Math.pow(this.to_number(), other.to_number()));
        }
        return new Int(this.value.pow(other.value));
    },

    __mul__: function (other) {
        return new Int(this.value.multiply(other.value));
    },

    __floordiv__: function (other) {
        return new Int(this.value.divide(other.value));
    },

    __truediv__: function (other) {
        return Float.pack(this.to_number() / other.to_number());
    },

    __mod__: function (other) {
        if (!this.value.sign && other.value.sign) {
            return new Int(this.value.mod(other.value).substract(other.value));
        } else if (this.value.sign && !other.value.sign) {
            return new Int(other.value.substract(this.value.mod(other.value)));
        }
        return new Int(this.value.mod(other.value));
    },

    __lshift__: function (other) {
        return new Int(this.value.shiftLeft(other.value));
    },


    __rshift__: function (other) {
        return new Int(this.value.shiftRight(other.value));
    },

    __and__: function (other) {
        return new Int(this.value.and(other.value));
    },

    __xor__: function (other) {
        return new Int(this.value.xor(other.value));
    },

    __or__: function (other) {
        return new Int(this.value.or(other.value));
    },

    __lt__: function (other) {
        return this.value.lt(other.value);
    },

    __le__: function (other) {
        return this.value.leq(other.value);
    },

    __eq__: function (other) {
        if (!(other instanceof Int)) {
            return false;
        }
        return this.value.eq(other.value);
    },

    __ne__: function (other) {
        return this.value.neq(other.value);
    },

    __gt__: function (other) {
        return this.value.gt(other.value);
    },

    __ge__: function (other) {
        return this.value.geq(other.value);
    },

    __hash__: function () {
        if (this.value.eq(-1)) {
            return Int.pack(-2);
        } else {
            return this;
        }
    }
});


Int.parse = function (string, base) {
    if (base instanceof Int) {
        return new Int(bigInt(string, base.value));
    }
    raise(TypeError, 'invalid type of integer base');
};

Int.unpack = function (object, fallback) {
    if ((object === None || object == undefined) && fallback != undefined) {
        return fallback;
    }
    if (object instanceof Int) {
        return object.to_number();
    } else if (typeof object == 'number') {
        return object | 0;
    } else {
        raise(TypeError, 'unable to unpack integer from object');
    }
};

Int.pack = function (value) {
    return new Int(value);
};

Int.ZERO = new Int(0);
Int.ONE = new Int(1);
Int.MINUSONE = Int(-1);

$.Int = Int;
