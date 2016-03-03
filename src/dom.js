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


    Py_Element.define_method('__init__', function (self, tag) {
        self.pack('__element__', document.createElement(jaspy.unpack_str(tag, 'div')));
        self.pack('__css__', {});
    }, ['tag'], {defaults: {'tag': builtins.None}});

    Py_Element.define_method('__str__', function (self) {
        return jaspy.new_str('<' + self.unpack('__element__').nodeName.toLowerCase() + ' element at 0x' + self.get_address() + '>');
    });

    Py_Element.define_method('__getitem__', function (self, name) {
        name = jaspy.unpack_str(name);
        return jaspy.new_str(self.unpack('__element__').getAttribute(name));
    }, ['name']);

    Py_Element.define_method('__setitem__', function (self, name, value) {
        name = jaspy.unpack_str(name);
        value = jaspy.unpack_str(value);
        self.unpack('__element__').setAttribute(name, value);
    }, ['name', 'value']);

    Py_Element.define_method('__getattr__', function (self, name) {
        var child = new jaspy.PyObject(Py_Element, new jaspy.PyDict());
        child.pack('__element__', document.createElement(jaspy.unpack_str(name)));
        child.pack('__css__', {});
        self.unpack('__element__').appendChild(child.unpack('__element__'));
        return child;
    }, ['name']);

    Py_Element.define_method('css', function (self, name, value) {
        name = jaspy.unpack_str(name);
        value = jaspy.unpack_str(value);
        var css = self.unpack('__css__');
        var attributes = [];
        css[name] = value;
        for (name in css) {
            if (css.hasOwnProperty(name)) {
                attributes.push(name + ': ' + css[name]);
            }
        }
        self.unpack('__element__').setAttribute('style', attributes.join('; '));
    }, ['name', 'value']);

    Py_Element.define_method('text', function (self, text) {
        self.unpack('__element__').innerText = jaspy.unpack_str(text);
    }, ['text']);



    Py_Element.define_method('body_append', function (self) {
        document.getElementsByTagName('body')[0].appendChild(self.unpack('__element__'));
    });

    return {
        'MetaElement': Py_MetaElement,
        'Element': Py_Element
    }
}, ['builtins']);