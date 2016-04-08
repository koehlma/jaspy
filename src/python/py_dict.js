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

py_dict.$def('__setitem__', function (self, key, value, state, frame) {
    if (!(self instanceof Dict)) {
        raise(TypeError, 'invalid type of \'self\' argument');
    }
    switch (state) {
        case 0:
            if (key.cls === py_str) {
                vm.return_value = key;
            } else if (key.call('__hash__')) {
                return 1;
            }
        case 1:
            if (!vm.return_value) {
                return null;
            }
            if (vm.return_value instanceof Str) {
                self.set(vm.return_value, value);
            } else if (vm.return_value instanceof Int) {
                self.set(pack_str(vm.return_value.value.toString()), value);
            } else {
                raise(TypeError, 'invalid result type of key hash');
            }
            return None;
    }
}, ['key', 'value']);
