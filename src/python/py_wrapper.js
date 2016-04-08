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


py_js_object.$def('__getattr__', function (self, name) {
    var value;
    py_js_object.check(self);
    name = unpack_str(name);
    if (name in self.object) {
        value = self.object[name];
        if (typeof value == 'function') {
            value = value.bind(self.object);
        }
        return pack(value);
    }
    raise(AttributeError, '\'' + self.cls.name + '\' object has no attribute \'' + name + '\'');
}, ['name']);

py_js_object.$def('__setattr__', function (self, name, value) {
    py_js_object.check(self);
    self.object[unpack_str(name)] = unpack(value);
}, ['name', 'value']);


py_js_function.$def('__call__', function (self, args) {
    py_js_function.check(self);
    return pack(self.func.apply(null, args.map(unpack)));
}, ['*args']);


 
