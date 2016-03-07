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

jaspy.module('dom', function ($, module, builtins) {
    var MetaElement = module.$class('MetaElement', [builtins.type]);
    var Element = module.$class('Element', [builtins.object], MetaElement);


    Element.$def('__init__', function (self, tag) {
        self.pack('element', document.createElement(jaspy.unpack_str(tag, 'div')));
    }, ['tag'], {defaults: {'tag': builtins.None}});

    Element.$def('__str__', function (self) {
        return jaspy.pack_str('<' + self.unpack('element').nodeName.toLowerCase() + ' element at 0x' + self.get_address() + '>');
    });

    Element.$def('__getitem__', function (self, name) {
        name = jaspy.unpack_str(name);
        return jaspy.pack_str(self.unpack('element').getAttribute(name));
    }, ['name']);

    Element.$def('__setitem__', function (self, name, value) {
        name = jaspy.unpack_str(name);
        value = jaspy.unpack_str(value);
        self.unpack('element').setAttribute(name, value);
    }, ['name', 'value']);

    Element.$def('__getattr__', function (self, name) {
        var child = Element.create(name);
        self.unpack('element').appendChild(child.unpack('element'));
        return child;
    }, ['name']);

    Element.$def('css', function (self, name, value) {
        name = jaspy.unpack_str(name);
        if (value === builtins.NotImplemented) {
            return jaspy.pack_str(self.unpack('element').style[name])
        } else {
            value = jaspy.unpack_str(value, '');
            self.unpack('element').style[name] = value;
        }
    }, ['name', 'value'], {defaults: {'value': builtins.NotImplemented}});

    Element.$def_property('text', function (self) {
        return jaspy.pack_str(self.unpack('element').textContent)
    }, function (self, value) {
        self.unpack('element').textContent = jaspy.unpack_str(value);
    });

    Element.$def_property('html', function (self) {
        return jaspy.pack_str(self.unpack('element').innerHTML)
    }, function (self, value) {
        self.unpack('element').innerHTML = jaspy.unpack_str(value);
    });

    Element.$def('append', function (self, other) {
        if (!(other.is_instance_of(Element))) {
            jaspy.raise(builtins.TypeError, 'invalid type of \'other\' argument');
        }
        self.unpack('element').appendChild(other.unpack('element'));
    }, ['other']);

    Element.$def('register_listener', function (self, name, callback) {
        var element = self.unpack('element');
        element.addEventListener($.unpack_str(name), function (event) {
            $.resume(callback, [self], {});
        });
    }, ['name', 'resume']);


    module.$def('get_body', function () {
        if (document.body) {
            var element = new jaspy.PyObject(Element, new jaspy.PyDict());
            element.pack('element', document.body);
            return element;
        } else {
            jaspy.raise(builtins.ValueError, 'unable to load body from dom')
        }
    });

    module.$def('set_interval', function (interval, callback) {
        var handle = $.pack_int(setInterval(function () {
            $.resume(callback, [handle], {});
        }, $.unpack_int(interval)));
        return handle;
        console.log($.unpack_int(interval));
    }, ['interval', 'resume']);

}, ['builtins']);