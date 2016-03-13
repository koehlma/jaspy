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

jaspy.module('greenlet', function ($, module, builtins) {
    var Greenlet = module.$class('greenlet');
    var GreenletExit = module.$class('GreenletExit', [builtins.Exception]);


    var current = new $.PyObject(Greenlet);
    current.started = true;

    Greenlet.$def('__new__', function (cls, run) {
        Greenlet.check_subclass(cls);
        var self = new $.PyObject(cls);
        self.run = run;
        self.started = false;
        self.setattr('parent', current);
        return self;
    }, ['run']);

    Greenlet.$def('switch', function (self, state, frame) {
        Greenlet.check(self);
        console.log(self.repr(), 'switch', self.started, state, frame.previous);
        if (self.started) {
            switch (state) {
                case 0:
                    current.frame = frame;
                    $.vm.frame = self.frame;
                    current = self;
                    return 1;
                case 1:
                    return;
            }
        } else {
            current.frame = frame;
            current = self;
            self.started = true;
            if ($.call(self.run)) {
                return 1;
            }
        }
    });

    module.$def('getcurrent', function () {
        return current;
    });

}, ['builtins']);