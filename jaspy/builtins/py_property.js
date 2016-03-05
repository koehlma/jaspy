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

py_property.$def('__get__', function (self, instance, owner, state, frame) {
    switch (state) {
        case 0:
            if (call_object(self.getattr('fget'), [instance])) {
                return 1;
            }
        case 1:
            return vm.return_value;
    }
}, ['instance', 'owner']);

py_property.$def('__set__', function (self, instance, value, state, frame) {
    switch (state) {
        case 0:
            if (call_object(self.getattr('fset'), [instance, value])) {
                return 1;
            }
        case 1:
            break;
    }
}, ['instance', 'value']);