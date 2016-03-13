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

py_type.$def_classmethod('__prepare__', function (mcs, bases) {
    return new PyDict();
}, ['bases']);

py_type.$def('__new__', function (mcs, name, bases, attributes) {
    if (!(mcs instanceof PyType)) {
        raise(TypeError, 'invalid type of \'mcs\' argument');
    }
    if (!(attributes instanceof PyDict)) {
        raise(TypeError, 'invalid type of \'attributes\' argument');
    }
    return new PyType(unpack_str(name), unpack_tuple(bases), attributes, mcs);
}, ['name', 'bases', 'attributes']);

py_type.$def('__call__', function (cls, args, kwargs, state, frame) {
    switch (state) {
        case 0:
            if (cls.call_classmethod('__new__', args, kwargs)) {
                return 1;
            }
        case 1:
            if (!vm.return_value) {
                return null;
            }
            frame.instance = vm.return_value;
            if (vm.return_value.cls.lookup('__init__')) {
                if (vm.return_value.call('__init__', args, kwargs)) {
                    return 2;
                }
            }
        case 2:
            if (vm.return_value) {
                return frame.instance;
            }
    }
}, ['*args', '**kwargs']);

py_type.$def('__str__', function (cls) {
    var module = cls.getattr('__module__');
    if (!(cls instanceof PyType)) {
        raise(TypeError, 'invalid type of \'cls\' argument');
    }
    if (module instanceof PyStr) {
        return pack_str('<class \'' + unpack_str(module) + '.' + cls.name + '\'>');
    } else {
        return pack_str('<class \'' + cls.name + '\'>');
    }
});

py_type.$def_property('__name__', function (cls) {
    cls.check_type(py_type);
    return pack_str(cls.name);
}, function (cls, value) {
    cls.check_type(py_type);
    cls.name = unpack_str(value);
});

py_type.$def_property('__mro__', function (cls) {
    cls.check_type(py_type);
    return pack_tuple(cls.mro);
});