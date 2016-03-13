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

function pack_int(value) {
    return new PyInt(value);
}

function pack_bool(boolean) {
    return boolean ? True : False;
}

function pack_float(value) {
    return new PyFloat(value);
}

function pack_str(value) {
    return new PyStr(value);
}

function pack_bytes(array) {
    return new PyBytes(array);
}

function pack_tuple(array) {
    return new PyTuple(array);
}

function pack_object(object) {
    return new PyJSObject(object);
}

function pack_array(array) {
    return new PyJSArray(array);
}

function pack_function(func) {
    return new PyJSFunction(func);
}

function pack_error(error) {
    return new PyException(pack_tuple([pack_str(error.name), pack_str(error.message)]), JSError);
}

function unpack_int(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyInt)) {
        raise(TypeError, 'unable to unpack integer from object');
    }
    return object.number();
}

function unpack_number(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyInt) && !(object instanceof PyFloat)) {
        raise(TypeError, 'unable to unpack number from object');
    }
    return object.number();
}

function unpack_str(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyStr)) {
        raise(TypeError, 'unable to unpack string from object');
    }
    return object.value;
}

function unpack_bytes(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyBytes)) {
        raise(TypeError, 'unable to unpack bytes from object');
    }
    return object.array;
}

function unpack_tuple(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyTuple)) {
        raise(TypeError, 'unable to unpack tuple from object');
    }
    return object.array;
}

function unpack_object(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyJSObject)) {
        raise(TypeError, 'unable to unpack js object');
    }
    return object.object;
}

function unpack_array(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyJSArray)) {
        raise(TypeError, 'unable to unpack js array');
    }
    return object.array;
}

function unpack_function(object, fallback) {
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
$.pack_error = pack_error;

$.unpack_int = unpack_int;
$.unpack_number = unpack_number;
$.unpack_str = unpack_str;
$.unpack_bytes = unpack_bytes;
$.unpack_tuple = unpack_tuple;
$.unpack_object = unpack_object;
$.unpack_array = unpack_array;
$.unpack_function = unpack_function;
