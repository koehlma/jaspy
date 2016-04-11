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


Str.$def('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (!issubclass(cls, Str.cls)) {
                raise(TypeError, 'class is not an subclass of str');
            }
            if (initializer instanceof Str) {
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

Str.$def('__str__', function (self) {
    return self;
});

Str.$map('__repr__', Str.prototype.repr);

Str.$def('__len__', function (self)  {
    Str.cls.check(self);
    return pack_int(self.value.length);
});

Str.$map('__add__', Str.prototype.concat, ['other']);



Str.cls.$def_alias('__add__', '__iadd__');
Str.cls.$def_alias('__add__', '__radd__');

Str.$def('__hash__', function (self) {
    return self;
});



Str.cls.$def('startswith', function (self, prefix) {
    return unpack_str(self).indexOf(unpack_str(prefix)) == 0 ? True : False;
}, ['prefix']);

Str.cls.$def('split', function (self, sep) {
    Str.cls.check(self);
    return new List(self.split(unpack_str(sep)).map(pack_str));
}, ['sep']);



function str(object) {
    return Str.cls.call_classmethod('__new__', [object]);
}
