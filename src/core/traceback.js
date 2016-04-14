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


var Traceback = $Class('traceback', {
    constructor: function (frame, position, line, next) {
        PyObject.call(this, Traceback.cls);
        this.frame = frame;
        this.position = position;
        this.line = line;
        this.next = next || None;
    }
});


function format_traceback(traceback) {
    var string = ['Traceback (most recent call last):'];
    while (traceback && traceback != None) {
        string.push('    File \'' + traceback.frame.code.filename + '\', line ' + traceback.line + ', in ' + traceback.frame.code.name);
        traceback = traceback.next;
    }
    return string.join('\n');
}

function print_traceback(traceback) {
    console.error(format_traceback(traceback));
}


$.Traceback = Traceback;
