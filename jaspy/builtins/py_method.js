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

function PyMethod(self, func) {
    PyObject.call(this, py_method);
    this.self = self;
    this.func = func;
}
PyMethod.prototype = new PyObject;

function new_method(func, instance) {
    return None;
}

py_method.$def('__str__', function (self) {
    return pack_str('<bound-method');
});

py_classmethod.$def('__init__', function (self, func) {
    self.setattr('__func__', func);
}, ['func']);

py_classmethod.$def('__get__', function (self, instance, owner) {
    return new_method(self.getattr('__func__'), owner);
}, ['instance', 'owner']);