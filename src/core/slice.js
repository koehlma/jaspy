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


var Slice = $Class('slice', {
    constructor: function (start, stop, step) {
        // TODO: check step

        PyObject.call(this, Slice.cls);
        
        this.start = start;
        this.stop = stop;
        this.step = step || None;
    },
    
    normalize: function (length) {
        var start, stop, step;
        length = Int.unpack(length);
        step = Int.unpack(this.step, 1);
        if (step == 0) {
            raise(ValueError, 'slice step must not be zero');
        }
        start = Int.unpack(this.start, 0);
        stop = Int.unpack(this.stop, length);
        if (start < 0) {
            start += length;
        }
        if (stop < 0) {
            stop += length;
        }
        return new Slice(Math.max(0, start), Math.min(stop, length), step);
    }
    
});


function new_slice(start, stop, step) {
    return new Slice(start, stop, step);
}

$.Slice = Slice;
