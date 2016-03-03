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
    var MetaElement = module.define_type('MetaElement', [builtins.type]);
    var Element = module.define_type('Element', [builtins.object], MetaElement);


    Element.define_method('__init__', function (self, tag) {
        self.pack('element', document.createElement(jaspy.unpack_str(tag, 'div')));
    }, ['tag'], {defaults: {'tag': builtins.None}});

    Element.define_method('__str__', function (self) {
        return jaspy.new_str('<' + self.unpack('element').nodeName.toLowerCase() + ' element at 0x' + self.get_address() + '>');
    });

    Element.define_method('__getitem__', function (self, name) {
        name = jaspy.unpack_str(name);
        return jaspy.new_str(self.unpack('element').getAttribute(name));
    }, ['name']);

    Element.define_method('__setitem__', function (self, name, value) {
        name = jaspy.unpack_str(name);
        value = jaspy.unpack_str(value);
        self.unpack('element').setAttribute(name, value);
    }, ['name', 'value']);

    Element.define_method('__getattr__', function (self, name) {
        var child = Element.create(name);
        self.unpack('element').appendChild(child.unpack('element'));
        return child;
    }, ['name']);

    Element.define_method('css', function (self, name, value) {
        name = jaspy.unpack_str(name);
        if (value === builtins.NotImplemented) {
            return jaspy.new_str(self.unpack('element').style[name])
        } else {
            value = jaspy.unpack_str(value, '');
            self.unpack('element').style[name] = value;
        }
    }, ['name', 'value'], {defaults: {'value': builtins.NotImplemented}});

    Element.define_property('text', function (self) {
        return jaspy.new_str(self.unpack('element').textContent)
    }, function (self, value) {
        self.unpack('element').textContent = jaspy.unpack_str(value);
    });

    Element.define_property('html', function (self) {
        return jaspy.new_str(self.unpack('element').innerHTML)
    }, function (self, value) {
        self.unpack('element').innerHTML = jaspy.unpack_str(value);
    });

    Element.define_method('append', function (self, other) {
        if (!(other.is_instance_of(Element))) {
            jaspy.raise(builtins.TypeError, 'invalid type of \'other\' argument');
        }
        self.unpack('element').appendChild(other.unpack('element'));
    }, ['other']);



    module.define_function('get_body', function () {
        if (document.body) {
            var element = new jaspy.PyObject(Element, new jaspy.PyDict());
            element.pack('element', document.body);
            return element;
        } else {
            jaspy.raise(builtins.ValueError, 'unable to load body from dom')
        }
    });
}, ['builtins']);