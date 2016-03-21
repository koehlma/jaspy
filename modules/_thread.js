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

jaspy.module('_thread', function ($, module) {
    module.$def('start_new_thread', function (target, args, kwargs) {
        var frame = $.vm.frame;
        var new_frame = $.call(target, args, kwargs);
        new_frame.thread = new $.Thread(new_frame);
        new_frame.back = null;
        new_frame.thread.enqueue();
        $.vm.frame = frame;
    }, ['target', '*args', '**kwargs']);


    var LockType = module.$class('LockType');

    LockType.$def('__exit__', function (self, exc_type, exc_value, exc_tb) {
        LockType.check(self);
        self.lock.release();
        return $.False;
    }, ['exc_type', 'exc_value', 'exc_tb']);

    LockType.$def('acquire', function (self, state, frame) {
        LockType.check(self);
        switch (state) {
            case 0:
                if (self.lock.acquire()) {
                    return $.True;
                } else {
                    $.threading.drop();
                    return 1;
                }
            case 1:
                return $.True;
        }
    });

    LockType.$def('release', function (self) {
        LockType.check(self);
        self.lock.release();
    });

    LockType.$def('locked', function (self) {
        LockType.check(self);
        return self.lock.locked() ? $.True : $.False;
    });

    LockType.$def_alias('acquire', '__enter__');





    module.$def('allocate_lock', function () {
        var lock = LockType.make();
        lock.lock = new $.Lock();
        return lock;
    });



});
