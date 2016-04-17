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

Float.cls.$def('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (!(subclass(cls, Float.cls))) {
                raise(TypeError, 'class is not an subclass of float');
            }
            if (initializer instanceof Int || initializer instanceof Float) {
                if (initializer.cls == cls) {
                    return initializer;
                } else {
                    return Int.pack(initializer.value, cls);
                }
            }
            if (initializer instanceof Str) {
                return Float.pack(parseFloat(initializer.value));
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
}, ['initializer'], {defaults: {initializer: Float.pack(0)}});

Float.cls.$def('__str__', function (self) {
    return Str.pack(Float.unpack(self).toString());
});

Float.cls.$def('__neg__', function (self) {
    return Float.pack(-Float.unpack(self));
});

Float.cls.$def('__pos__', function (self) {
    return self;
});

Float.cls.$def('__lt__', function (self, other) {
    return Float.unpack(self) < Float.unpack(other) ? True : False;
}, ['other']);

Float.cls.$def('__le__', function (self, other) {
    return Float.unpack(self) <= Float.unpack(other) ? True : False;
}, ['other']);

Float.cls.$def('__eq__', function (self, other) {
    return Float.unpack(self) == Float.unpack(other) ? True : False;
}, ['other']);

Float.cls.$def('__ne__', function (self, other) {
    return Float.unpack(self) != Float.unpack(other) ? True : False;
}, ['other']);

Float.cls.$def('__gt__', function (self, other) {
    return Float.unpack(self) > Float.unpack(other) ? True : False;
}, ['other']);

Float.cls.$def('__ge__', function (self, other) {
    return Float.unpack(self) <= Float.unpack(other) ? True : False;
}, ['other']);

Float.cls.$def('__pow__', function (self, other) {
    return Float.pack(Math.pow(Float.unpack(self), Float.unpack(other)));
}, ['other']);
Float.cls.$def_alias('__pow__', '__ipow__');
Float.cls.$def_alias('__pow__', '__rpow__');

Float.cls.$def('__mul__', function (self, other) {
    return Float.pack(Float.unpack(self) * Float.unpack(other));
}, ['other']);
Float.cls.$def_alias('__mul__', '__imul__');
Float.cls.$def_alias('__mul__', '__rmul__');

Float.cls.$def('__floordiv__', function (self, other) {
    return Int.pack(Math.floor(Float.unpack(self) / Float.unpack(other)));
}, ['other']);
Float.cls.$def_alias('__floordiv__', '__ifloordiv__');
Float.cls.$def_alias('__floordiv__', '__rfloordiv__');

Float.cls.$def('__truediv__', function (self, other) {
    return Float.pack(Float.unpack(self) / Float.unpack(other));
}, ['other']);
Float.cls.$def_alias('__truediv__', '__itruediv__');
Float.cls.$def_alias('__truediv__', '__rtruediv__');

Float.cls.$def('__mod__', function (self, other) {
    return Float.pack(Float.unpack(self) % Float.unpack(other));
}, ['other']);
Float.cls.$def_alias('__mod__', '__imod__');
Float.cls.$def_alias('__mod__', '__rmod__');

Float.cls.$def('__add__', function (self, other) {
    return Float.pack(Float.unpack(self) + Float.unpack(other));
}, ['other']);
Float.cls.$def_alias('__add__', '__iadd__');
Float.cls.$def_alias('__add__', '__radd__');

Float.cls.$def('__sub__', function (self, other) {
    return Float.pack(Float.unpack(self) - Float.unpack(other));
}, ['other']);
Float.cls.$def_alias('__sub__', '__isub__');
Float.cls.$def_alias('__sub__', '__rsub__');