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
                if (initializer.__class__ == cls) {
                    return initializer;
                } else {
                    return Str.pack(initializer.value, cls);
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



Str.$def('__len__', function (self)  {
    Str.cls.check(self);
    return Int.pack(self.value.length);
});





Str.cls.$def_alias('__add__', '__iadd__');
Str.cls.$def_alias('__add__', '__radd__');

Str.$def('__hash__', function (self) {
    return self;
});



Str.$map('__repr__');

Str.$map('__add__', ['other']);

Str.$map('capitalize');
Str.$map('casefold');
Str.$map('center', ['width', 'fillchar'], {defaults: {'fillchar': None}});
Str.$map('count', ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('encode');
Str.$map('endswith', ['suffix', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('expandtabs', ['tabsize'], {defaults: {'tabsize': new Int(8)}});
Str.$map('find', ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('index', ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('isalnum');
Str.$map('isalpha');
Str.$map('isdecimal');
Str.$map('isdigit');
Str.$map('isidentifier');
Str.$map('islower');
Str.$map('isnumeric');
Str.$map('isprintable');
Str.$map('isspace');
Str.$map('istitle');
Str.$map('isupper');
Str.$map('ljust', ['width', 'fillchar'], {defaults: {'fillchar': None}});
Str.$map('lower');
Str.$map('lstrip', ['chars'], {defaults: {'chars': None}});
Str.$map('partition', ['sep']);
Str.$map('replace', ['old', 'new', 'count'], {defaults: {'count': new Int(-1)}});
Str.$map('rfind', ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('rindex', ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('rjust', ['width', 'fillchar'], {defaults: {'fillchar': None}});
Str.$map('rpartition', ['sep']);
Str.$map('rsplit', ['sep', 'maxsplit'], {defaults: {'sep': None, 'maxsplit': new Int(-1)}});
Str.$map('rstrip', ['chars'], {defaults: {'chars': None}});
Str.$map('split', ['sep', 'maxsplit'], {defaults: {'sep': None, 'maxsplit': new Int(-1)}});
Str.$map('splitlines', ['keepends'], {defaults: {'keepends': False}});
Str.$map('startswith', ['prefix', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('strip', ['chars'], {defaults: {'chars': None}});
Str.$map('swapcase');
Str.$map('title');
Str.$map('translate', ['table']);
Str.$map('upper');
Str.$map('zfill');
