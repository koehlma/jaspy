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

Tuple.$def('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (initializer === None) {
                return Tuple.EMPTY;
            }
            if (call(unpack_sequence, [initializer])) {
                return 1;
            }
        case 1:
            if (vm.return_value) {
                return vm.return_value;
            }
    }
}, ['initializer'], {defaults: {initializer: None}});

Tuple.$def('__repr__', function (self, state, frame) {
    while (true) {
        switch (state) {
            case 0:
                Tuple.check(self);
                frame.parts = new Array(self.array.length);
                frame.index = 0;
            case 1:
                if (frame.index < self.array.length) {
                    if (self.array[frame.index].call('__repr__')) {
                        return 2;
                    }
                } else {
                    state = 3;
                    break;
                }
            case 2:
                if (!vm.return_value) {
                    return;
                }
                frame.parts[frame.index] = vm.return_value.toString();
                frame.index++;
                state = 1;
                break;
            case 3:
                return Str.pack('(' + frame.parts.join(', ') + ')');
        }
    }
});

Tuple.$map('__iter__');
