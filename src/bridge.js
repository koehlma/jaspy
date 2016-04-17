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

var pack_float = Float.pack;

function pack_bool(boolean) {
    return boolean ? True : False;
}

function pack_bytes(array) {
    return new Bytes(array);
}

function pack_tuple(array) {
    return new Tuple(array);
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
    return make_exception(JSError, '[' + error.name + '] ' + error.message);
}

function pack(object) {
    if (object == undefined) {
        return None;
    }
    if (object instanceof PyObject) {
        return object;
    } else if (typeof object == 'string') {
        return Str.pack(object);
    } else if (typeof object == 'number') {
        if (Number.isInteger(object)) {
            return Int.pack(object);
        } else {
            return pack_float(object);
        }
    } else if (typeof object == 'boolean') {
        return pack_bool(object);
    } else if (typeof object == 'function') {
        return pack_function(object);
    } else if (object instanceof Array) {
        return pack_array(object);
    } else if (object instanceof Object) {
        return pack_object(object);
    } else {
        raise(TypeError, 'unable to pack native object');
    }
}

var unpack_number = Float.unpack;

function unpack_bool(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object.cls === py_bool)) {
        raise(TypeError, 'unable to unpack bool from object');
    }
    return object === True;
}

function unpack_bytes(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof Bytes)) {
        raise(TypeError, 'unable to unpack bytes from object');
    }
    return object.array;
}

function unpack_tuple(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof Tuple)) {
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

function unpack(object, fallback) {
    if ((object === None || !object) && fallback) {
        return fallback;
    }
    if (!(object instanceof PyObject)) {
        raise(TypeError, 'object to unpack is not a python object');
    }
    if (object.cls === py_bool) {
        return unpack_bool(object);
    } else if (object === None) {
        return null;
    } else if (object instanceof Int) {
        return Int.unpack(object);
    } else if (object instanceof Float) {
        return unpack_float(object);
    } else if (object instanceof Str) {
        return Str.unpack(object);
    } else if (object instanceof Bytes) {
        return unpack_bytes(object);
    } else if (object instanceof Tuple) {
        return unpack_tuple(object);
    } else if (object instanceof PyJSObject) {
        return unpack_object(object);
    } else if (object instanceof PyJSArray) {
        return unpack_array(object);
    } else if (object instanceof PyJSFunction) {
        return unpack_function(object);
    } else {
        raise(TypeError, 'unable to unpack native value from object');
    }
}



$.pack_bool = pack_bool;
$.pack_float = pack_float;
$.pack_bytes = pack_bytes;
$.pack_tuple = pack_tuple;
$.pack_object = pack_object;
$.pack_array = pack_array;
$.pack_function = pack_function;
$.pack_error = pack_error;


$.unpack_bool = unpack_bool;
$.unpack_number = unpack_number;
$.unpack_bytes = unpack_bytes;
$.unpack_tuple = unpack_tuple;
$.unpack_object = unpack_object;
$.unpack_array = unpack_array;
$.unpack_function = unpack_function;

$.pack = pack;
$.unpack = unpack;

var Bool = {
    pack: pack_bool,
    unpack: unpack_bool
};
