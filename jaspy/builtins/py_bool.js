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

var TRUE_STR = pack_str('True');
var FALSE_STR = pack_str('False');

py_bool.$def('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (!(cls.is_subclass_of(py_bool))) {
                raise(TypeError, 'class is not an subclass of bool');
            }
            if (initializer.call_method('__bool__')) {
                return 1;
            }
        case 1:
            if (except(MethodNotFoundError)) {
                if (initializer.call_method('__len__')) {
                    return 2;
                }
            } else {
                // FIXME: create object of class cls
                return new vm.return_value;
            }
        case 2:
            if (except(MethodNotFoundError)) {
                return True;
            } else if (vm.return_value) {
                // FIXME: create object of class cls
                return vm.return_value.ne(False) ? True : False;
            }
    }
}, ['initializer'], {defaults: {initializer: False}});

py_bool.$def('__str__', function (self) {
    return self.ne(False) ? TRUE_STR : FALSE_STR;
});
