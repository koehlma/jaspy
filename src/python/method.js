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


Method.$def('__repr__', function (self, state, frame) {
    switch (state) {
        case 0:
            if (self.self.call('__repr__')) {
                return 1;
            }
        case 1:
            if (vm.return_value) {
                return new Str('<bound method ' + self.self.__class__.name + '.' + self.func.name + ' of ' + vm.return_value.string() + '>');
            }
    }
});

py_classmethod.$def('__init__', function (self, func) {
    self.setattr('__func__', func);
}, ['func']);

py_classmethod.$def('__get__', function (self, instance, owner) {
    return new Method(self.getattr('__func__'), owner);
}, ['instance', 'owner']);