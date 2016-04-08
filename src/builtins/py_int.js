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

py_int.$def('__new__', function (cls, initializer, base, state, frame) {
    switch (state) {
        case 0:
            if (!(issubclass(cls, py_int))) {
                raise(TypeError, 'class is not an subclass of int');
            }
            if (initializer instanceof Float) {
                return pack_int(Math.floor(initializer.value), cls);
            }
            if (initializer instanceof Int) {
                if (initializer.cls == cls) {
                    return initializer;
                } else {
                    return pack_int(initializer.value, cls);
                }
            }
            if (initializer instanceof Str) {
                return Int.parse(initializer.value, base);
            }
            if (initializer.call('__int__')) {
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
}, ['initializer', 'base'], {defaults: {initializer: pack_int(0), base: pack_int(10)}});

py_int.$def('__str__', function (self) {
    return pack_str(self.toString());
});

py_int.$def_alias('__str__', '__repr__');

py_int.$def('__bool__', function (self) {
    return pack_bool(self.ne(False));
});

py_int.$def('__neg__', function (self) {
    return self.neg();
});

py_int.$def('__pos__', function (self) {
    return self;
});

py_int.$def('__lt__', function (self, other) {
    return pack_bool(self.lt(other));
}, ['other']);

py_int.$def('__le__', function (self, other) {
    return pack_bool(self.le(other));
}, ['other']);

py_int.$def('__eq__', function (self, other) {
    return pack_bool(self.eq(other));
}, ['other']);

py_int.$def('__ne__', function (self, other) {
    return pack_bool(self.ne(other));
}, ['other']);

py_int.$def('__gt__', function (self, other) {
    return pack_bool(self.gt(other));
}, ['other']);

py_int.$def('__ge__', function (self, other) {
    return pack_bool(self.ge(other));
}, ['other']);

py_int.$def('__pow__', function (self, other) {
    return self.pow(other);
}, ['other']);
py_int.$def_alias('__pow__', '__ipow__');
py_int.$def_alias('__pow__', '__rpow__');

py_int.$def('__mul__', function (self, other) {
    return self.mul(other);
}, ['other']);
py_int.$def_alias('__mul__', '__imul__');
py_int.$def_alias('__mul__', '__rmul__');

py_int.$def('__floordiv__', function (self, other) {
    return self.floordiv(other);
}, ['other']);
py_int.$def_alias('__floordiv__', '__ifloordiv__');
py_int.$def_alias('__floordiv__', '__rfloordiv__');

py_int.$def('__truediv__', function (self, other) {
    return self.truediv(other);
}, ['other']);
py_int.$def_alias('__truediv__', '__itruediv__');
py_int.$def_alias('__truediv__', '__rtruediv__');

py_int.$def('__mod__', function (self, other) {
    return self.mod(other);
}, ['other']);
py_int.$def_alias('__mod__', '__imod__');
py_int.$def_alias('__mod__', '__rmod__');

py_int.$def('__add__', function (self, other) {
    return self.add(other);
}, ['other']);
py_int.$def_alias('__add__', '__iadd__');
py_int.$def_alias('__add__', '__radd__');

py_int.$def('__sub__', function (self, other) {
    return self.sub(other);
}, ['other']);
py_int.$def_alias('__sub__', '__isub__');
py_int.$def_alias('__sub__', '__rsub__');

py_int.$def('__lshift__', function (self, other) {
    return self.lshift(other);
}, ['other']);
py_int.$def_alias('__lshift__', '__ilshift__');
py_int.$def_alias('__lshift__', '__rlshift__');

py_int.$def('__rshift__', function (self, other) {
    return self.rshift(other);
}, ['other']);
py_int.$def_alias('__rshift__', '__irshift__');
py_int.$def_alias('__rshift__', '__rrshift__');

py_int.$def('__and__', function (self, other) {
    return self.and(other);
}, ['other']);
py_int.$def_alias('__and__', '__iand__');
py_int.$def_alias('__and__', '__rand__');

py_int.$def('__xor__', function (self, other) {
    return self.xor(other);
}, ['other']);
py_int.$def_alias('__xor__', '__ixor__');
py_int.$def_alias('__xor__', '__rxor__');

py_int.$def('__or__', function (self, other) {
    return self.or(other);
}, ['other']);
py_int.$def_alias('__or__', '__ior__');
py_int.$def_alias('__or__', '__ror__');
