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


var object_id_counter = 0;


var PyObject = Class.extend({
    constructor: function (cls, dict) {
        this.__class__ = cls;
        this.__addr__ = null;
        this.__dict__ = dict === undefined ? {} : dict;
    },

    get_id: function () {
        if (this.__addr__ === null) {
            this.__addr__ = object_id_counter++;
        }
        return this.__addr__;
    },

    get_address: function () {
        return ('0000000000000' + this.get_id().toString(16)).substr(-13);
    },

    call: function (name, args, kwargs) {
        var method = this.__class__.lookup(name);
        if (method) {
            if (isinstance(method, py_classmethod)) {
                return call(method.func, [this.__class__].concat(args || []), kwargs);
            } else if (isinstance(method, py_staticmethod)) {
                return call(method.func, args, kwargs);
            } else if (name == '__new__') {
                return call(method, [this.__class__].concat(args || []), kwargs);
            }
            return call(method, [this].concat(args || []), kwargs);
        } else {
            vm.return_value = null;
            vm.last_exception = METHOD_NOT_FOUND;
            return false;
        }
    },

    setattr: function (name, value) {
        if (!this.__dict__) {
            raise(TypeError, 'object does not support attribute access');
        }
        if (name instanceof Str) {
            name = name.value;
        } else if (typeof name != 'string') {
            raise(TypeError, 'native attribute name must be a string');
        }
        if (this.__dict__ instanceof Dict) {
            return this.__dict__.set(name, value);
        } else {
            this.__dict__[name] = value;
        }
    },

    getattr: function (name) {
        if (!this.__dict__) {
            raise(TypeError, 'object does not support attribute access');
        }
        if (name instanceof Str) {
            name = name.value;
        } else if (typeof name != 'string') {
            raise(TypeError, 'native attribute name must be a string');
        }
        if (this.__dict__ instanceof Dict) {
            return this.__dict__.get(name);
        } else {
            return this.__dict__[name];
        }
    },

    is: function (other) {
        return this === other;
    },


    /* low level implicit conversions */

    to_bool: function () {
        return true;
    },

    to_number: function () {
        raise(TypeError, 'unable to convert object to native number implicitly');
    },

    to_string: function () {
        raise(TypeError, 'unable to convert object to native string implicitly');
    },


    /* expose special methods to native code */

    repr: function () {
        return this.__repr__();
    },

    str: function () {
        return this.__str__();
    },

    len: function () {
        return this.__len__();
    },

    iter: function () {
        return this.__iter__();
    },

    add: function (other) {
        return this.__add__(other);
    },

    sub: function (other) {
        return this.__sub__(other);
    },

    mul: function (other) {
        return this.__mul__(other);
    },

    truediv: function (other) {
        return this.__truediv__(other);
    },

    floordiv: function (other) {
        return this.__floordiv__(other);
    },

    mod: function (other) {
        return this.__mod__(other);
    },

    divmod: function (other) {
        return this.__divmod__(other);
    },

    lshift: function (other) {
        return this.__lshift__(other);
    },

    rshift: function (other) {
        return this.__rshift__(other);
    },

    and: function (other) {
        return this.__and__(other);
    },

    xor: function (other) {
        return this.__xor__(other);
    },

    or: function (other) {
        return this.__or__(other);
    },

    neg: function () {
        return this.__neg__();
    },

    pos: function () {
        return this.__pos__();
    },

    abs: function () {
        return this.__abs__();
    },

    invert: function () {
        return this.__invert__();
    },

    hash: function () {
        return this.__hash__();
    },

    eq: function (other) {
        return this.__eq__(other);
    },

    ne: function (other) {
        return this.__ne__(other);
    },

    gt: function (other) {
        return this.__gt__(other);
    },

    ge: function (other) {
        return this.__ge__(other);
    },

    lt: function (other) {
        return this.__lt__(other);
    },

    le: function (other) {
        return this.__le__(other);
    },


    /* special methods */

    __repr__: function () {
        return '<' + this.__class__.name + ' object at 0x' + this.get_address() + '>';
    },

    __str__: function () {
        return this.__repr__();
    }
});

PyObject.prototype.toString = PyObject.prototype.repr;


function isinstance(object, cls) {
    var index;
    for (index = 0; index < object.__class__.mro.length; index++) {
        if (object.__class__.mro[index] === cls) {
            return true;
        }
    }
    return false;
}


$.PyObject = PyObject;

$.isinstance = isinstance;
