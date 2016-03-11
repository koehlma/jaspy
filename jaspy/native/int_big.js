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
    this.value = bigInt(value);
}

extend(PyInt, PyObject);

PyInt.prototype.toString = function () {
    return this.value.toString();
};

PyInt.prototype.valueOf = function () {
    return this.number();
};

PyInt.prototype.bool = function () {
    return this.value.neq(0);
};

PyInt.prototype.is = function (other) {
    if (other instanceof PyInt) {
        return this.value.eq(other.value);
    }
    return false;
};

PyInt.prototype.number = function () {
    var number = this.value.toJSNumber();
    if (number == Infinity || number == -Infinity) {
        raise(OverflowError, 'int too large to convert to float');
    }
    return number;
};

PyInt.prototype.float = function () {
    return new PyFloat(this.number());
};

PyInt.prototype.abs = function () {
    return new PyInt(this.value.abs());
};

PyInt.prototype.pos = function () {
    return this;
};

PyInt.prototype.neg = function () {
    return new PyInt(this.value.negate());
};

PyInt.prototype.invert = function () {
    return new PyInt(this.value.not());
};

PyInt.prototype.add = function (other) {
    return new PyInt(this.value.add(other.value));
};

PyInt.prototype.sub = function (other) {
    return new PyInt(this.value.subtract(other.value));
};

PyInt.prototype.pow = function (other) {
    if (other < 0) {
        return pack_float(Math.pow(this.number(), other.number()));
    }
    return new PyInt(this.value.pow(other.value));
};

PyInt.prototype.mul = function (other) {
    return new PyInt(this.value.multiply(other.value));
};

PyInt.prototype.floordiv = function (other) {
    return new PyInt(this.value.divide(other.value));
};

PyInt.prototype.truediv = function (other) {
    return pack_float(this.number() / other.number());
};

PyInt.prototype.mod = function (other) {
    if (!this.value.sign && other.value.sign) {
        return new PyInt(this.value.mod(other.value).substract(other.value));
    } else if (this.value.sign && !other.value.sign) {
        return new PyInt(other.value.substract(this.value.mod(other.value)));
    }
    return new PyInt(this.value.mod(other.value));
};

PyInt.prototype.lshift = function (other) {
    return new PyInt(this.value.shiftLeft(other.value));
};


PyInt.prototype.rshift = function (other) {
    return new PyInt(this.value.shiftRight(other.value));
};

PyInt.prototype.and = function (other) {
    return new PyInt(this.value.and(other.value));
};

PyInt.prototype.xor = function (other) {
    return new PyInt(this.value.xor(other.value));
};

PyInt.prototype.or = function (other) {
    return new PyInt(this.value.or(other.value));
};

PyInt.prototype.lt = function (other) {
    return pack_bool(this.value.lt(other.value));
};

PyInt.prototype.le = function (other) {
    return pack_bool(this.value.leq(other.value));
};

PyInt.prototype.eq = function (other) {
    return pack_bool(this.value.eq(other.value));
};

PyInt.prototype.ne = function (other) {
    return pack_bool(this.value.neq(other.value));
};

PyInt.prototype.gt = function (other) {
    return pack_bool(this.value.gt(other.value));
};

PyInt.prototype.ge = function (other) {
    return pack_bool(this.value.geq(other.value));
};

PyInt.implementation = 'big';

PyInt.parse = function (string, base) {
    if (base instanceof PyInt) {
        return new PyInt(bigInt(string, base.value));
    }
    raise(TypeError, 'invalid type of integer base');
};


$.PyInt = PyInt;
