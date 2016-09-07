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

Int.cls.$def('__new__', function (cls, initializer, base, state, frame) {
    switch (state) {
        case 0:
            if (!(issubclass(cls, Int.cls))) {
                raise(TypeError, 'class is not an subclass of int');
            }
            if (initializer instanceof Float) {
                return Int.pack(Math.floor(initializer.value), cls);
            }
            if (initializer instanceof Int) {
                if (initializer.__class__ == cls) {
                    return initializer;
                } else {
                    return Int.pack(initializer.value, cls);
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
}, ['initializer', 'base'], {defaults: {initializer: Int.pack(0), base: Int.pack(10)}});

Int.cls.$def('__str__', function (self) {
    return Str.pack(self.toString());
});

Int.cls.$def_alias('__str__', '__repr__');


Int.cls.$def('__bool__', function (self) {
    return pack_bool(self.ne(False));
});

Int.$def('__not__', function (self) {
    return pack_bool(!self.ne(False));
});

Int.cls.$def('__neg__', function (self) {
    return self.neg();
});

Int.cls.$def('__pos__', function (self) {
    return self;
});

Int.cls.$def('__lt__', function (self, other) {
    return pack_bool(self.lt(other));
}, ['other']);

Int.cls.$def('__le__', function (self, other) {
    return pack_bool(self.le(other));
}, ['other']);

Int.cls.$def('__eq__', function (self, other) {
    return pack_bool(self.eq(other));
}, ['other']);

Int.cls.$def('__ne__', function (self, other) {
    return pack_bool(self.ne(other));
}, ['other']);

Int.cls.$def('__gt__', function (self, other) {
    return pack_bool(self.gt(other));
}, ['other']);

Int.cls.$def('__ge__', function (self, other) {
    return pack_bool(self.ge(other));
}, ['other']);

Int.cls.$def('__pow__', function (self, other) {
    return self.pow(other);
}, ['other']);
Int.cls.$def_alias('__pow__', '__ipow__');
Int.cls.$def_alias('__pow__', '__rpow__');

Int.cls.$def('__mul__', function (self, other) {
    return self.mul(other);
}, ['other']);
Int.cls.$def_alias('__mul__', '__imul__');
Int.cls.$def_alias('__mul__', '__rmul__');

Int.cls.$def('__floordiv__', function (self, other) {
    return self.floordiv(other);
}, ['other']);
Int.cls.$def_alias('__floordiv__', '__ifloordiv__');
Int.cls.$def_alias('__floordiv__', '__rfloordiv__');

Int.cls.$def('__truediv__', function (self, other) {
    return self.truediv(other);
}, ['other']);
Int.cls.$def_alias('__truediv__', '__itruediv__');
Int.cls.$def_alias('__truediv__', '__rtruediv__');

Int.cls.$def('__mod__', function (self, other) {
    return self.mod(other);
}, ['other']);
Int.cls.$def_alias('__mod__', '__imod__');
Int.cls.$def_alias('__mod__', '__rmod__');

Int.cls.$def('__add__', function (self, other) {
    return self.add(other);
}, ['other']);
Int.cls.$def_alias('__add__', '__iadd__');
Int.cls.$def_alias('__add__', '__radd__');

Int.cls.$def('__sub__', function (self, other) {
    return self.sub(other);
}, ['other']);
Int.cls.$def_alias('__sub__', '__isub__');
Int.cls.$def_alias('__sub__', '__rsub__');

Int.cls.$def('__lshift__', function (self, other) {
    return self.lshift(other);
}, ['other']);
Int.cls.$def_alias('__lshift__', '__ilshift__');
Int.cls.$def_alias('__lshift__', '__rlshift__');

Int.cls.$def('__rshift__', function (self, other) {
    return self.rshift(other);
}, ['other']);
Int.cls.$def_alias('__rshift__', '__irshift__');
Int.cls.$def_alias('__rshift__', '__rrshift__');

Int.cls.$def('__and__', function (self, other) {
    return self.and(other);
}, ['other']);
Int.cls.$def_alias('__and__', '__iand__');
Int.cls.$def_alias('__and__', '__rand__');

Int.cls.$def('__xor__', function (self, other) {
    return self.xor(other);
}, ['other']);
Int.cls.$def_alias('__xor__', '__ixor__');
Int.cls.$def_alias('__xor__', '__rxor__');

Int.cls.$def('__or__', function (self, other) {
    return self.or(other);
}, ['other']);
Int.cls.$def_alias('__or__', '__ior__');
Int.cls.$def_alias('__or__', '__ror__');


Int.$map('__abs__');
Int.$map('__hash__');
