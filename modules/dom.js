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


    Element.$def('__new__', function (cls, tag) {
        cls.check_subclass(Element);
        var self = new $.PyObject(cls);
        self.element = document.createElement($.unpack_str(tag, 'div'));
        self.element.__element__ = self;
        return self;
    }, ['tag'], {defaults: {'tag': builtins.None}});

    Element.$def('__str__', function (self) {
        self.check_type(Element);
        return $.pack_str('<' + self.element.nodeName.toLowerCase() + ' element at 0x' + self.get_address() + '>');
    });

    Element.$def('__getitem__', function (self, name) {
        self.check_type(Element);
        return $.pack_str(self.element.getAttribute($.unpack_str(name)));
    }, ['name']);

    Element.$def('__setitem__', function (self, name, value) {
        self.check_type(Element);
        self.element.setAttribute($.unpack_str(name), $.unpack_str(value));
    }, ['name', 'value']);

    Element.$def('__getattr__', function (self, name) {
        self.check_type(Element);
        var child = Element.create(name);
        self.element.appendChild(child.element);
        return child;
    }, ['name']);

    Element.$def_property('text', function (self) {
        self.check_type(Element);
        return $.pack_str(self.element.textContent);
    }, function (self, value) {
        self.check_type(Element);
        self.element.textContent = $.unpack_str(value);
    });

    Element.$def_property('html', function (self) {
        self.check_type(Element);
        return $.pack_str(self.element.innerHTML);
    }, function (self, value) {
        self.check_type(Element);
        self.element.innerHTML = $.unpack_str(value);
    });

    Element.$def('css', function (self, name, value) {
        self.check_type(Element);
        if (value === builtins.NotImplemented) {
            return $.pack_str(self.element.style[$.unpack_str(name)]);
        } else {
            self.element.style[$.unpack_str(name)] = $.unpack_str(value, '');
        }
    }, ['name', 'value'], {defaults: {'value': builtins.NotImplemented}});

    Element.$def('append', function (self, other) {
        self.check_type(Element);
        other.check_type(Element);
        self.element.appendChild(other.element);
    }, ['other']);


    module.$def('get_body', function () {
        if (document.body) {
            if (document.body.__element__) {
                return document.body.__element__;
            }
            var element = new $.PyObject(Element);
            element.element = document.body;
            document.body.__element__ = element;
            return element;
        } else {
            $.raise(builtins.ValueError, 'unable to load body from dom');
        }
    });


    Element.$def('register_listener', function (self, name, callback) {
        var element = self.unpack('element');
        element.addEventListener($.unpack_str(name), function (event) {
            $.resume(callback, [self], {});
        });
    }, ['name', 'resume']);




    module.$def('set_interval', function (interval, callback) {
        var handle = $.pack_int(setInterval(function () {
            $.resume(callback, [handle], {});
        }, $.unpack_int(interval)));
        return handle;
        console.log($.unpack_int(interval));
    }, ['interval', 'resume']);

}, ['builtins']);