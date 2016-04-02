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

function PyException(args, cls) {
    PyObject.call(this, cls);
    this.args = args;
}

extend(PyException, PyObject);


function make_exception(cls, message) {
    var exc_value = new PyObject(cls, {});
    exc_value.dict['args'] = pack_tuple([pack_str(message)]);
    return exc_value;
}




function format_exception(exc_value) {
    var string = [];
    if (exc_value.traceback) {
        string.push(format_traceback(exc_value.traceback));
    }
    if (exc_value.getattr('args') instanceof PyTuple && exc_value.getattr('args').array[0] instanceof PyStr) {
        string.push(exc_value.cls.name + ': ' + exc_value.getattr('args').array[0]);
    } else {
        string.push(exc_value.cls.name);
    }
    return string.join('\n');
}

function print_exception(exc_value) {
    console.error(format_exception(exc_value));
}
