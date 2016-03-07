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

function pack_float(value, cls) {
    return new PyFloat(value, cls);
}

function pack_str(value, cls) {
    return new PyStr(value, cls);
}

function pack_bytes(value, cls) {
    return new PyBytes(value, cls);
}

function pack_tuple(value, cls) {
    return new PyTuple(value, cls);
}

function pack_list(array, cls) {
    return new PyList(array, cls);
}

function pack_code(value) {
    return new PyCode(value);
}

function new_cell(item) {
    return new PyCell(item);
}

function new_frame(frame) {
    return new PyFrame(frame);
}

function new_js_object(object) {
    return new PyJSObject(object);
}

function new_js_array(array) {
    return new PyJSArray(array)
}

function new_js_function(func) {
    return new PyJSFunction(func);
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

function unpack_float(object, fallback) {
    if (object === None && fallback) {
        return fallback;
    }
    if (object instanceof PyFloat || object instanceof PyInt) {
        return object.value;
    } else {
        raise(UnpackError, 'unable to unpack float from object');
    }
}

function unpack_str(object, fallback) {
    if (object === None && fallback) {
        return fallback;
    }
    if (object instanceof PyStr) {
        return object.value;
    } else if (object instanceof PyInt || object instanceof PyFloat) {
        return object.value.toString();
    } else {
        raise(UnpackError, 'unable to unpack string from object');
    }
}

function unpack_bytes(object, fallback) {
    if (object === None && fallback) {
        return fallback;
    }
    if (object instanceof PyBytes) {
        return object.value;
    } else {
        raise(UnpackError, 'unable to unpack bytes from object');
    }
}

function unpack_tuple(object, fallback) {
    if (object === None && fallback) {
        return fallback;
    }
    if (object instanceof PyTuple) {
        return object.value;
    } else {
        raise(UnpackError, 'unable to unpack tuple from object');
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

function new_native(func, signature, options) {
    options = options || {};
    var code = new NativeCode(func, options, signature);
    func = new PyObject(py_function);
    func.setattr('__name__', pack_str(options.name || '<unkown>'));
    func.setattr('__qualname__', pack_str(options.qualname || '<unkown>'));
    func.setattr('__doc__', pack_str(options.doc || ''));
    func.setattr('__module__', options.module ? pack_str(options.module) : BUILTINS_STR);
    func.setattr('__code__', pack_code(code));
    func.setattr('__defaults__', new PyDict(options.defaults));
    func.defaults = options.defaults;
    return func;
}


function pack_error(error) {
    return new PyObject(JSError, {
        'args': pack_tuple([pack_str(error.name), pack_str(error.message)])
    });
}

function new_exception(cls, message) {
    var exc_value = new PyObject(cls);
    exc_value.namespace['args'] = pack_tuple([pack_str(message)]);
    return exc_value;
}


function new_property(getter, setter) {
    return new PyObject(py_property, {
        'fget': getter || None,
        'fset': setter || None
    });
}

function issubclass(object, cls) {
    if (!(object instanceof PyType)) {
        return false;
    }
    return object.is_subclass_of(cls);
}

function isiterable(object) {
    return object.cls.lookup('__next__') != undefined;
}


function pack_bool(object) {
    return object ? True : False;
}


//$.unpack_int = unpack_int;
$.unpack_float = unpack_float;
$.unpack_str = unpack_str;
$.unpack_bytes = unpack_bytes;
$.unpack_tuple = unpack_tuple;
$.unpack_code = unpack_code;


$.pack_int = pack_int;
$.pack_float = pack_float;
$.pack_str = pack_str;
$.pack_bytes = pack_bytes;
$.pack_tuple = pack_tuple;
$.pack_code = pack_code;

