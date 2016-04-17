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

var unpack_sequence = $def(function (sequence, limit, state, frame) {
    while (true) {
        switch (state) {
            case 0:
                frame.result = [];
                frame.limit = Int.unpack(limit, Infinity);
                if (sequence.cls.lookup('__next__')) {
                    frame.iterator = sequence;
                    state = 2;
                    break;
                }
                if (sequence.call('__iter__')) {
                    return 1;
                }
            case 1:
                if (!vm.return_value) {
                    if (except(MethodNotFoundError)) {
                        raise(TypeError, 'object does not support the iterable protocol');
                    }
                    return;
                }
                frame.iterator = vm.return_value;
            case 2:
                if (frame.iterator.call('__next__')) {
                    return 3;
                }
            case 3:
                if (!vm.return_value) {
                    if (except(StopIteration)) {
                        state = 4;
                        break;
                    } else if (except(MethodNotFoundError)) {
                        raise(TypeError, 'object does not support the iterable protocol');
                    }
                    return;
                }
                frame.result.push(vm.return_value);
                if (frame.result.length > frame.limit) {
                    raise(ValueError, 'too many values to unpack (expected ' + frame.limit + ')');
                }
                state = 2;
                break;
            case 4:
                return pack_tuple(frame.result);
        }
    }
}, ['sequence', 'limit'], {name: 'unpack_sequence', defaults: {'limit': None}});
