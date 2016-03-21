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

py_str.$def('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (!issubclass(cls, py_str)) {
                raise(TypeError, 'class is not an subclass of str');
            }
            if (initializer instanceof PyStr) {
                if (initializer.cls == cls) {
                    return initializer;
                } else {
                    return pack_str(initializer.value, cls);
                }
            }
            if (initializer.call('__str__')) {
                return 1;
            }
        case 1:
            if (except(MethodNotFoundError)) {
                raise(TypeError, 'invalid type of str initializer');
            } else if (vm.return_value) {
                return vm.return_value;
            }
            break;
    }
}, ['initializer']);

py_str.$def('__str__', function (self) {
    return self;
});

py_str.$def('__repr__', function (self) {
    return self.repr();
});

py_str.$def('__len__', function (self)  {
    py_str.check(self);
    return pack_int(self.value.length);
});

py_str.$def('__add__', function (self, other) {
    return pack_str(unpack_str(self) + unpack_str(other));
}, ['other']);
py_str.$def_alias('__add__', '__iadd__');
py_str.$def_alias('__add__', '__radd__');

py_str.$def('__hash__', function (self) {
    return self;
});

py_str.$def('startswith', function (self, prefix) {
    return unpack_str(self).indexOf(unpack_str(prefix)) == 0 ? True : False;
}, ['prefix']);

py_str.$def('split', function (self, sep) {
    py_str.check(self);
    return new PyList(self.split(unpack_str(sep)).map(pack_str));
}, ['sep']);

function str(object) {
    return py_str.call_classmethod('__new__', [object]);
}
