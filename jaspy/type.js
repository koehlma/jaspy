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

function get_mro(cls) {
    return cls.mro;
}

function compute_mro(cls) {
    var pending = cls.bases.map(get_mro), result = [cls];
    var index, head, good;
    while (pending.length != 0) {
        for (index = 0; index < pending.length; index++) {
            head = pending[index][0];
            good = true;
            pending.forEach(function (base_mro) {
                base_mro.slice(1, base_mro.length).forEach(function (base_cls) {
                    good &= base_cls != head;
                })
            });
            if (good) {
                result.push(head);
                break;
            }
        }
        if (!good) {
            raise(TypeError, 'unable to linearize class hierarchy');
        }
        for (index = 0; index < pending.length; index++) {
            pending[index] = pending[index].filter(function (base_cls) {
                return base_cls != head;
            })
        }
        pending = pending.filter(function (base_mro) {
            return base_mro.length > 0;
        });
    }
    return result;
}





function PyType(name, bases, attributes, mcs) {
    var index, native;
    PyObject.call(this, mcs || py_type, attributes || {});
    this.name = name;
    this.bases = bases || [py_object];
    this.mro = compute_mro(this);
    this.native = null;
    for (index = 0; index < this.mro.length; index++) {
        native = this.mro[index].native;
        if (native === py_object) {
            continue;
        }
        if (this.native && this.native !== native && native) {
            raise(TypeError, 'invalid native type hierarchy');
        }
        this.native = native;
    }
    this.native = this.native || py_object;
}

extend(PyType, PyObject);

PyType.prototype.lookup = function (name) {
    var index, value;
    for (index = 0; index < this.mro.length; index++) {
        value = this.mro[index].getattr(name);
        if (value) {
            return value;
        }
    }
};

PyType.prototype.define = function (name, item) {
    this.dict[name] = item;
    return item;
};

PyType.prototype.define_alias = function (name, alias) {
    return this.define(alias, this.lookup(name));
};

PyType.prototype.$def = function (name, func, signature, options) {
    options = options || {};
    options.name = options.name || name;
    options.qualname = options.qualname || (this.name + '.' + options.name);
    return this.define(name, $def(func, ['self'].concat(signature || []), options));
};

PyType.prototype.$def_property = function (name, getter, setter) {
    var options = {name: name, qualname: this.name + '.' + name};
    if (getter) {
        getter = $def(getter, ['self'], options);
    }
    if (setter) {
        setter = $def(setter, ['self', 'value'], options);
    }
    return this.define(name, new new_property(getter, setter));
};

PyType.prototype.$def_classmethod = function (name, func, signature, options) {
    options = options || {};
    options.name = options.name || name;
    options.qualname = options.qualname || (this.name + '.' + options.name);
    return this.define(name, $def(func, ['cls'].concat(signature || []), options));
};

PyType.prototype.call_classmethod = function (name, args, kwargs) {
    var method = this.lookup(name);
    if (method) {
        return call(method, [this].concat(args || []), kwargs);
    } else {
        vm.return_value = null;
        vm.last_exception = METHOD_NOT_FOUND;
        return false;
    }
};

PyType.prototype.call_staticmethod = function (name, args, kwargs) {
    var method = this.lookup(name);
    if (method) {
        return call(method, args, kwargs);
    } else {
        vm.return_value = null;
        vm.last_exception = METHOD_NOT_FOUND;
        return false;
    }
};

PyType.prototype.create = function (args, kwargs) {
    if (this.call('__call__', args, kwargs)) {
        raise(TypeError, 'invalid call to python code during object creation')
    }
    return vm.return_value;
};

PyType.prototype.check = function (object) {
    if (!isinstance(object, this)) {
        raise(TypeError, 'native type check failed');
    }
};

PyType.native = function (name, bases, attributes, mcs) {
    var type = new PyType(name, bases, attributes, mcs);
    type.native = type;
    return type;
};

function $class(name, bases, attributes, mcs) {
    return new PyType(name, bases, attributes, mcs);
}


function issubclass(cls, superclass) {
    var index;
    if (!(cls instanceof PyType)) {
        raise(TypeError, 'first argument must be a class')
    }
    for (index = 0; index < cls.mro.length; index++) {
        if (cls.mro[index] === superclass) {
            return true;
        }
    }
    return false;
}


$.PyType = PyType;

$.$class = $class;

$.issubclass = issubclass;
