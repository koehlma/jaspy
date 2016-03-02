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

jaspy.define_module('dom', function (module, builtins) {
    var Py_MetaElement = module.define_type('MetaElement', [builtins.type]);
    var Py_Element = module.define_type('Element', [builtins.object], Py_MetaElement);

    Py_Element.define_method('__init__', function (self) {
        var element = document.createElement('div');
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(element);
        self.pack('__element__', element);
    }, ['self']);

    Py_Element.define_method('__getitem__', function (self, name) {
        name = jaspy.unpack_str(name);
        return jaspy.new_str(self.unpack('__element__').getAttribute(name));
    }, ['self', 'name']);

    Py_Element.define_method('__setitem__', function (self, name, value) {
        name = jaspy.unpack_str(name);
        value = jaspy.unpack_str(value);
        self.unpack('__element__').setAttribute(name, value);
    }, ['self', 'name', 'value']);

    return {
        'MetaElement': Py_MetaElement,
        'Element': Py_Element
    }
}, ['builtins']);