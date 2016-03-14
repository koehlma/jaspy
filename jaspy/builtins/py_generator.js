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

py_generator.$def('__iter__', function (self) {
    return self;
});

py_generator.$def('__next__', function (self, state, frame) {
    switch (state) {
        case 0:
            py_generator.check(self);
            self.running = true;
            self.frame.back = frame;
            vm.frame = self.frame;
            vm.return_value = None;
            if (self.frame.run()) {
                return 1;
            }
        case 1:
            if (self.frame.why == CAUSES.YIELD) {
                return vm.return_value;
            } else if (self.frame.why == CAUSES.RETURN) {
                raise(StopIteration, new PyObject(StopIteration, {'args': pack_tuple([vm.return_value])}));
            }
    }
});