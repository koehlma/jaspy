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

py_list.$def('__repr__', function (self, state, frame) {
    while (true) {
        switch (state) {
            case 0:
                py_list.check(self);
                frame.parts = new Array(self.size);
                frame.index = 0;
            case 1:
                if (frame.index < self.size) {
                    if (self.get(frame.index).call('__repr__')) {
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
                return pack_str('[' + frame.parts.join(', ') + ']');
        }
    }
});

py_list.$def('append', function (self, item) {
    py_list.check(self);
    self.append(item);
}, ['item']);


py_list.$def('__getitem__', function (self, index_or_slice) {
    py_list.check(self);
    // TODO: do conversion with __index__ and support slice
    return self.get(unpack_int(index_or_slice));
}, ['index_or_slice']);
