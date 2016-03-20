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
        new_frame.thread.start();
        $.vm.frame = frame;
    }, ['target', '*args', '**kwargs']);
});
