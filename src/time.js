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

jaspy.define_module('time', function (module, builtins) {
    var sleep = module.define_function('sleep', function (frame, args) {
        var timeout, vm;
        switch (frame.position) {
            case 0:
                timeout = jaspy.unpack_float(args.seconds) * 1000;
                vm = jaspy.vm;
                vm.frame = null;
                setTimeout(function () {
                    vm.run(frame);
                }, timeout);
                return 1;
            case 1:
                break;
        }
    }, ['seconds'], {complex: true});


    return {
        'sleep': sleep
    }
}, ['builtins']);