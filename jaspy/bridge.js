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

function pack_int(value, cls) {
    return new PyInt(value, cls);
}

function pack_bool(boolean) {
    return boolean ? True : False;
}

function pack_float(value, cls) {
    return new PyFloat(value, cls);
}

function pack_str(value, cls) {
    return new PyStr(value, cls);
}

function pack_bytes(array, cls) {
    return new PyBytes(array, cls);
}

function pack_tuple(array, cls) {
    return new PyTuple(array, cls);
}

function pack_object(object, cls) {
    return new PyJSObject(object, cls);
}

function pack_array(array, cls) {
    return new PyJSArray(array, cls);
}

function pack_function(func, cls) {
    return new PyJSFunction(func, cls);
}

function check_int(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyInt)) {
        raise(TypeError, 'unable to unpack integer from object');
    }
    return object.number();
}

function check_number(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyInt) && !(object instanceof PyFloat)) {
        raise(TypeError, 'unable to unpack number from object');
    }
    return object.number();
}

function check_str(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyStr)) {
        raise(TypeError, 'unable to unpack string from object');
    }
    return object.value;
}

function check_bytes(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyBytes)) {
        raise(TypeError, 'unable to unpack bytes from object');
    }
    return object.array;
}

function check_tuple(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyTuple)) {
        raise(TypeError, 'unable to unpack tuple from object');
    }
    return object.array;
}

function check_object(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyJSObject)) {
        raise(TypeError, 'unable to unpack js object');
    }
    return object.object;
}

function check_array(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyJSArray)) {
        raise(TypeError, 'unable to unpack js array');
    }
    return object.array;
}

function check_function(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyJSFunction)) {
        raise(TypeError, 'unable to unpack js function');
    }
    return object.func;
}


$.pack_int = pack_int;
$.pack_bool = pack_bool;
$.pack_float = pack_float;
$.pack_str = pack_str;
$.pack_bytes = pack_bytes;
$.pack_tuple = pack_tuple;
$.pack_object = pack_object;
$.pack_array = pack_array;
$.pack_function = pack_function;

$.check_int = check_int;
$.check_number = check_number;
$.check_str = check_str;
$.check_bytes = check_bytes;
$.check_tuple = check_tuple;
$.check_object = check_object;
$.check_array = check_array;
$.check_function = check_function;










/* ------------------------------------------------------------------------------------ */

$.unpack_code = unpack_code;








function pack_code(value) {
    return new PyCode(value);
}

function new_cell(item) {
    return new PyCell(item);
}

function unpack_int_old(object, fallback) {
    if (object === None && fallback) {
        return fallback;
    }
    if (object instanceof PyInt) {
        return object.value;
    } else {
        raise(UnpackError, 'unable to unpack int from object');
    }
}



function unpack_code(object, fallback) {
    if (object === None && fallback) {
        return fallback;
    }
    if (object instanceof PyCode) {
        return object.value;
    } else {
        raise(UnpackError, 'unable to unpack code from object');
    }
}

var BUILTINS_STR = pack_str('builtins');

function pack_error(error) {
    return new PyObject(JSError, {
        'args': pack_tuple([pack_str(error.name), pack_str(error.message)])
    });
}

function new_exception(cls, message) {
    var exc_value = new PyObject(cls, {});
    exc_value.dict['args'] = pack_tuple([pack_str(message)]);
    return exc_value;
}


function new_property(getter, setter) {
    return new PyObject(py_property, {
        'fget': getter || None,
        'fset': setter || None
    });
}

function isiterable(object) {
    return object.cls.lookup('__next__') != undefined;
}





$.pack_code = pack_code;

