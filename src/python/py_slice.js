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

Slice.cls.$def('__repr__', function (self, state, frame) {
    switch (state) {
        case 0:
            Slice.cls.check(self);
            frame.result = 'slice(';
            if (self.start.call('__repr__')) {
                return 1;
            }
        case 1:
            if (!vm.return_value) {
                return;
            }
            frame.result += unpack_str(vm.return_value) + ', ';
            if (self.stop.call('__repr__')) {
                return 2;
            }
        case 2:
            if (!vm.return_value) {
                return;
            }
            frame.result += unpack_str(vm.return_value) + ', ';
            if (self.step.call('__repr__')) {
                return 3;
            }
        case 3:
            if (!vm.return_value) {
                return;
            }
            frame.result += unpack_str(vm.return_value) + ')';
            return pack_str(frame.result);
    }
});
