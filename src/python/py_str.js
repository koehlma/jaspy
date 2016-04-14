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



Str.$map('capitalize', Str.prototype.capitalize);
Str.$map('casefold', Str.prototype.casefold);
Str.$map('center', Str.prototype.center, ['width', 'fillchar'], {defaults: {'fillchar': None}});
Str.$map('count', Str.prototype.count, ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('encode', Str.prototype.encode);
Str.$map('endswith', Str.prototype.endswith, ['suffix', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('expandtabs', Str.prototype.expandtabs, ['tabsize'], {defaults: {'tabsize': new Int(8)}});
Str.$map('find', Str.prototype.find, ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('index', Str.prototype.index, ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('isalnum', Str.prototype.isalnum);
Str.$map('isalpha', Str.prototype.isalpha);
Str.$map('isdecimal', Str.prototype.isdecimal);
Str.$map('isdigit', Str.prototype.isdigit);
Str.$map('isidentifier', Str.prototype.isidentifier);
Str.$map('islower', Str.prototype.islower);
Str.$map('isnumeric', Str.prototype.isnumeric);
Str.$map('isprintable', Str.prototype.isprintable);
Str.$map('isspace', Str.prototype.isspace);
Str.$map('istitle', Str.prototype.istitle);
Str.$map('isupper', Str.prototype.isupper);
Str.$map('ljust', Str.prototype.ljust, ['width', 'fillchar'], {defaults: {'fillchar': None}});
Str.$map('lower', Str.prototype.lower);
Str.$map('lstrip', Str.prototype.lstrip, ['chars'], {defaults: {'chars': None}});
Str.$map('partition', Str.prototype.partition, ['sep']);
Str.$map('replace', Str.prototype.replace, ['old', 'new', 'count'], {defaults: {'count': new Int(-1)}});
Str.$map('rfind', Str.prototype.rfind, ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('rindex', Str.prototype.rindex, ['sub', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('rjust', Str.prototype.rjust, ['width', 'fillchar'], {defaults: {'fillchar': None}});
Str.$map('rpartition', Str.prototype.rpartition, ['sep']);
Str.$map('rsplit', Str.prototype.rsplit, ['sep', 'maxsplit'], {defaults: {'sep': None, 'maxsplit': new Int(-1)}});
Str.$map('rstrip', Str.prototype.rstrip, ['chars'], {defaults: {'chars': None}});
Str.$map('split', Str.prototype.split, ['sep', 'maxsplit'], {defaults: {'sep': None, 'maxsplit': new Int(-1)}});
Str.$map('splitlines', Str.prototype.splitlines, ['keepends'], {defaults: {'keepends': False}});
Str.$map('startswith', Str.prototype.startswith, ['prefix', 'start', 'end'], {defaults: {'start': None, 'end': None}});
Str.$map('strip', Str.prototype.strip, ['chars'], {defaults: {'chars': None}});
Str.$map('swapcase', Str.prototype.swapcase);
Str.$map('title', Str.prototype.title);
Str.$map('translate', Str.prototype.translate, ['table']);
Str.$map('upper', Str.prototype.upper);
Str.$map('zfill', Str.prototype.zfill);
