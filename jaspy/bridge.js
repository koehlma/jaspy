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
