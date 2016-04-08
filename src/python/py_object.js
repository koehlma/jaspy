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

py_object.$def('__new__', function (cls, args, kwargs) {
    if (!(cls instanceof PyType)) {
        raise(TypeError, 'object.__new__(X): X is not a type object');
    }
    if (cls.native !== py_object) {
        raise(TypeError, 'object.__new__() is not safe, use ' + cls.native.name + '.__new__()');
    }
    return new PyObject(cls, {});
}, ['*args', '**kwargs']);

py_object.$def('__getattribute__', function (self, name, state, frame) {
    var value;
    switch (state) {
        case 0:
            name = unpack_str(name);
            value = self.dict ? self.getattr(name) : null;
            if (!value) {
                value = self.cls.lookup(name);
                if (value) {
                    if (value.call('__get__', [self, self.cls])) {
                        return 1;
                    }
                } else {
                    raise(AttributeError, '\'' + self.cls.name + '\' object has no attribute \'' + name + '\'');
                }
            } else {
                return value;
            }
        case 1:
            if (except(MethodNotFoundError)) {
                return value;
            } else if (vm.return_value) {
                return vm.return_value
            } else {
                return null;
            }
    }
}, ['name']);

py_object.$def('__setattr__', function (self, name, item, state, frame) {
    var descriptor;
    switch (state) {
        case 0:
            descriptor = self.cls.lookup(name);
            if (descriptor && descriptor.cls.lookup('__set__')) {
                if (descriptor.call('__set__', [self, item])) {
                    return 1;
                }
            } else {
                self.setattr(name, item);
                return null;
            }
        case 1:
            return null;
    }
}, ['name', 'item']);

py_object.$def('__repr__', function (self) {
    var module = self.cls.getattr('__module__');
    if (module instanceof Str) {
        return pack_str('<' + module.value + '.' + self.cls.name + ' object at 0x' + self.get_address() + '>');
    } else {
        return pack_str('<' + self.cls.name + ' object at 0x' + self.get_address() + '>');
    }
});

py_object.$def('__str__', function (self, state, frame) {
    switch (state) {
        case 0:
            if (self.call('__repr__')) {
                return 1;
            }
        case 1:
            return vm.return_value;
    }
});

py_object.$def('__hash__', function (self) {
    return pack_str('object: ' + self.get_address());
});

py_object.$def('__eq__', function (self, other) {
    return self === other ? True : False;
}, ['other']);

py_object.$def_property('__class__', function (self) {
    return self.cls;
}, function (self, value) {
    if (!(value instanceof PyType) || value.native != py_object) {
        raise(TypeError, 'invalid type of \'value\' argument');
    }
    if (self instanceof PyType || self.cls.native != py_object) {
        raise(TypeError, 'object does not support class assignment');
    }
    self.cls = value;
});
