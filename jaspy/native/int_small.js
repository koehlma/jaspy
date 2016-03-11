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

function PyInt(value, cls) {
    PyObject.call(this, cls || py_int);
    if (!Number.isInteger(value)) {
        raise(ValueError, 'value is not an integer');
    }
    if (value > 9007199254740991 || value < -9007199254740992) {
        raise(OverflowError, 'result to large for javascript number');
    }
    this.value = value;
}

extend(PyInt, PyObject);

PyInt.prototype = new PyObject();

PyInt.prototype.toString = function () {
    return this.value.toString();
};

PyInt.prototype.valueOf = function () {
    return this.value;
};

PyInt.prototype.bool = function () {
    return this.value != 0;
};

PyInt.prototype.is = function (other) {
    if (other instanceof PyInt) {
        return this.value == other.value;
    }
    return false;
};

PyInt.prototype.number = function () {
    return this.value;
};

PyInt.prototype.float = function () {
    return new PyFloat(this.value);
};

PyInt.prototype.abs = function () {
    return new PyInt(Math.abs(value));
};

PyInt.prototype.pos = function () {
    return this;
};

PyInt.prototype.neg = function () {
    return new PyInt(-this.value);
};

PyInt.prototype.invert = function () {
    return new PyInt(~this.value);
};

PyInt.prototype.add = function (other) {
    return new PyInt(this.value + other.value);
};

PyInt.prototype.sub = function (other) {
    return new PyInt(this.value - other.value);
};

PyInt.prototype.pow = function (other) {
    return new PyInt(Math.pow(this.value, other.value));
};

PyInt.prototype.mul = function (other) {
    return new PyInt(this.value * other.value);
};

PyInt.prototype.floordiv = function (other) {
    return new PyInt(Math.floor(this.value / other.value));
};

PyInt.prototype.truediv = function (other) {
    return pack_float(this.value / other.value);
};

PyInt.prototype.mod = function (other) {
    if (this.value > 0 && other.value < 0) {
        return new PyInt((this.value % other.value) - other.value);
    } else if (this.value < 0 && other.value > 0) {
        return new PyInt(other - (this.value % other.value));
    }
    return new PyInt(this.value % other.value);
};

PyInt.prototype.lshift = function (other) {
    return new PyInt(this.value >> other.value);
};

PyInt.prototype.rshift = function (other) {
    return new PyInt(this.value << other.value);
};

PyInt.prototype.and = function (other) {
    return new PyInt(this.value & other.value);
};

PyInt.prototype.xor = function (other) {
    return new PyInt(this.value ^ other.value);
};

PyInt.prototype.or = function (other) {
    return new PyInt(this.value | other.value);
};

PyInt.prototype.lt = function (other) {
    return pack_bool(this.value < other.value);
};

PyInt.prototype.le = function (other) {
    return pack_bool(this.value <= other.value);
};

PyInt.prototype.eq = function (other) {
    return pack_bool(this.value == other.value);
};

PyInt.prototype.ne = function (other) {
    return pack_bool(this.value != other.value);
};

PyInt.prototype.gt = function (other) {
    return pack_bool(this.value > other.value);
};

PyInt.prototype.ge = function (other) {
    return pack_bool(this.value >= other.value);
};

PyInt.implementation = 'small';

PyInt.parse = function (string, base) {
    if (base instanceof PyInt) {
        return new PyInt(parseInt(string, base.value));
    }
    raise(TypeError, 'invalid type of integer base');
};


$.PyInt = PyInt;

