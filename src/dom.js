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
        self.unpack('__element__').appendChild(child.unpack('__element__'));
        return child;
    }, ['name']);

    Py_Element.define_method('css', function (self, name, value) {
        name = jaspy.unpack_str(name);
        if (value === builtins.NotImplemented) {
            return jaspy.new_str(self.unpack('__element__').style[name])
        } else {
            value = jaspy.unpack_str(value, '');
            self.unpack('__element__').style[name] = value;
        }
    }, ['name', 'value'], {defaults: {'value': builtins.NotImplemented}});

    Py_Element.define_property('text', function (self) {
        return jaspy.new_str(self.unpack('__element__').innerText)
    }, function (self, value) {
        self.unpack('__element__').innerText = jaspy.unpack_str(value);
    });

    Py_Element.define_property('html', function (self) {
        return jaspy.new_str(self.unpack('__element__').innerHTML)
    }, function (self, value) {
        self.unpack('__element__').innerHTML = jaspy.unpack_str(value);
    });

    Py_Element.define_method('append', function (self, other) {
        if (!(other.is_instance_of(Py_Element))) {
            jaspy.raise(builtins.TypeError, 'invalid type of \'other\' argument');
        }
        self.unpack('__element__').appendChild(other.unpack('__element__'));
    }, ['other']);

    var get_body = module.define_function('get_body', function () {
        if (document.body) {
            var element = new jaspy.PyObject(Py_Element, new jaspy.PyDict());
            element.pack('__element__', document.body);
            return element;
        } else {
            jaspy.raise(builtins.ValueError, 'unable to load body from dom')
        }
    });

    Py_Element.define_method('body_append', function (self) {
        document.getElementsByTagName('body')[0].appendChild(self.unpack('__element__'));
    });


    return {
        'MetaElement': Py_MetaElement,
        'Element': Py_Element,
        'get_body': get_body
    }
}, ['builtins']);