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

py_float.$def('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (!(subclass(cls, py_float))) {
                raise(TypeError, 'class is not an subclass of float');
            }
            if (initializer instanceof Int || initializer instanceof Float) {
                if (initializer.cls == cls) {
                    return initializer;
                } else {
                    return pack_int(initializer.value, cls);
                }
            }
            if (initializer instanceof Str) {
                return pack_float(parseFloat(initializer.value));
            }
            if (initializer.call('__float__')) {
                return 1;
            }
        case 1:
            if (except(MethodNotFoundError)) {
                raise(TypeError, 'invalid type of int initializer');
            } else if (vm.return_value) {
                return vm.return_value;
            }
            break;
    }
}, ['initializer'], {defaults: {initializer: pack_float(0)}});

py_float.$def('__str__', function (self) {
    return pack_str(unpack_number(self).toString());
});

py_float.$def('__neg__', function (self) {
    return pack_float(-unpack_number(self));
});

py_float.$def('__pos__', function (self) {
    return self;
});

py_float.$def('__lt__', function (self, other) {
    return unpack_number(self) < unpack_number(other) ? True : False;
}, ['other']);

py_float.$def('__le__', function (self, other) {
    return unpack_number(self) <= unpack_number(other) ? True : False;
}, ['other']);

py_float.$def('__eq__', function (self, other) {
    return unpack_number(self) == unpack_number(other) ? True : False;
}, ['other']);

py_float.$def('__ne__', function (self, other) {
    return unpack_number(self) != unpack_number(other) ? True : False;
}, ['other']);

py_float.$def('__gt__', function (self, other) {
    return unpack_number(self) > unpack_number(other) ? True : False;
}, ['other']);

py_float.$def('__ge__', function (self, other) {
    return unpack_number(self) <= unpack_number(other) ? True : False;
}, ['other']);

py_float.$def('__pow__', function (self, other) {
    return pack_float(Math.pow(unpack_number(self), unpack_number(other)));
}, ['other']);
py_float.$def_alias('__pow__', '__ipow__');
py_float.$def_alias('__pow__', '__rpow__');

py_float.$def('__mul__', function (self, other) {
    return pack_float(unpack_number(self) * unpack_number(other));
}, ['other']);
py_float.$def_alias('__mul__', '__imul__');
py_float.$def_alias('__mul__', '__rmul__');

py_float.$def('__floordiv__', function (self, other) {
    return pack_int(Math.floor(unpack_number(self) / unpack_number(other)));
}, ['other']);
py_float.$def_alias('__floordiv__', '__ifloordiv__');
py_float.$def_alias('__floordiv__', '__rfloordiv__');

py_float.$def('__truediv__', function (self, other) {
    return pack_float(unpack_number(self) / unpack_number(other));
}, ['other']);
py_float.$def_alias('__truediv__', '__itruediv__');
py_float.$def_alias('__truediv__', '__rtruediv__');

py_float.$def('__mod__', function (self, other) {
    return pack_float(unpack_number(self) % unpack_number(other));
}, ['other']);
py_float.$def_alias('__mod__', '__imod__');
py_float.$def_alias('__mod__', '__rmod__');

py_float.$def('__add__', function (self, other) {
    return pack_float(unpack_number(self) + unpack_number(other));
}, ['other']);
py_float.$def_alias('__add__', '__iadd__');
py_float.$def_alias('__add__', '__radd__');

py_float.$def('__sub__', function (self, other) {
    return pack_float(unpack_number(self) - unpack_number(other));
}, ['other']);
py_float.$def_alias('__sub__', '__isub__');
py_float.$def_alias('__sub__', '__rsub__');