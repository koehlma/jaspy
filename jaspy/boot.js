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

var py_object = PyType.native('object', []);
var py_type = PyType.native('type', [py_object]);

py_object.cls = py_type;
py_type.cls = py_type;

var py_dict = PyType.native('dict');

var py_int = PyType.native('int');
var py_bool = PyType.native('bool', [py_int]);

var py_float = PyType.native('float');

var py_str = PyType.native('str');
var py_bytes = PyType.native('bytes');

var py_tuple = PyType.native('tuple');

var py_code = PyType.native('code');

var py_list = PyType.native('list');


var py_cell = PyType.native('cell');
var py_frame = PyType.native('frame');

var py_js_object = PyType.native('JSObject');
var py_js_array = PyType.native('JSArray');
var py_js_function = PyType.native('JSFunction');

var py_traceback = new_type('traceback');

var py_function = new_type('function');
var py_method = new_type('method');
var py_generator = new_type('generator');

var py_set = new_type('set');
var py_frozenset = new_type('frozenset', [py_set]);

var py_classmethod = new_type('classmethod');
var py_staticmethod = new_type('staticmethod');

var py_module = new_type('ModuleType');

var py_property = new_type('property');

var None = new PyObject(PyType.native('NoneType'));
var NotImplemented = new PyObject(PyType.native('NotImplemented'));
var Ellipsis = new PyObject(PyType.native('Ellipsis'));

var False = new PyInt(0, py_bool);
var True = new PyInt(1, py_bool);






















function PyCell(item) {
    PyObject.call(this, py_cell);
    this.item = item;
}
PyCell.prototype = new PyObject;
PyCell.prototype.set = function (item) {
    this.item = item;
};
PyCell.prototype.get = function () {
    return this.item;
};

function PyFrame(frame) {
    PyObject.call(this, py_frame);
    this.frame = frame;
}
PyFrame.prototype = new PyObject;

function PyJSObject(object) {
    PyObject.call(this, py_js_object);
    this.object = object;
}
PyJSObject.prototype = new PyObject;

function PyJSArray(array) {
    PyObject.call(this, py_js_array);
    this.array = array;
}
PyJSArray.prototype = new PyObject;

function PyJSFunction(func) {
    PyObject.call(this, py_js_function);
    this.func = func;
}
PyJSFunction.prototype = new PyObject;


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


var BaseException = new PyType('BaseException');
var Exception = new PyType('Exception', [BaseException]);
var ValueError = new PyType('ValueError', [Exception]);
var ArithmeticError = new PyType('ArithmeticError', [Exception]);
var LookupError = new PyType('LookupError', [Exception]);
var RuntimeError = new PyType('RuntimeError', [Exception]);
var BufferError = new PyType('BufferError', [Exception]);
var AssertionError = new PyType('AssertionError', [Exception]);
var AttributeError = new PyType('AttributeError', [Exception]);
var EOFError = new PyType('EOFError', [Exception]);
var FloatingPointError = new PyType('FloatingPointError', [ArithmeticError]);
var GeneratorExit = new PyType('GeneratorExit', [BaseException]);
var ImportError = new PyType('ImportError', [Exception]);
var IndexError = new PyType('IndexError', [LookupError]);
var KeyError = new PyType('KeyError', [Exception]);
var KeyboardInterrupt = new PyType('KeyboardInterrupt', [BaseException]);
var MemoryError = new PyType('MemoryError', [Exception]);
var NameError = new PyType('NameError', [Exception]);
var NotImplementedError = new PyType('NotImplementedError', [RuntimeError]);
var OSError = new PyType('OSError', [Exception]);
var OverflowError = new PyType('OverflowError', [Exception]);
var RecursionError = new PyType('RecursionError', [RuntimeError]);
var ReferenceError = new PyType('ReferenceError', [Exception]);
var StopIteration = new PyType('StopIteration', [Exception]);
var SyntaxError = new PyType('SyntaxError', [Exception]);
var IndentationError = new PyType('IndentationError', [SyntaxError]);
var TabError = new PyType('TabError', [IndentationError]);
var SystemError = new PyType('SystemError', [Exception]);
var SystemExit = new PyType('SystemExit', [BaseException]);
var TypeError = new PyType('TypeError', [Exception]);
var UnboundLocalError = new PyType('UnboundLocalError', [NameError]);
var UnicodeError = new PyType('UnicodeError', [ValueError]);
var UnicodeEncodeError = new PyType('UnicodeEncodeError', [UnicodeError]);
var UnicodeDecodeError = new PyType('UnicodeDecodeError', [UnicodeError]);
var UnicodeTranslateError = new PyType('UnicodeTranslateError', [UnicodeError]);
var ZeroDivisionError = new PyType('ZeroDivisionError', [ArithmeticError]);
var EnvironmentError = OSError;
var IOError = OSError;

var BlockingIOError = new PyType('BlockingIOError', [OSError]);
var ChildProcessError = new PyType('ChildProcessError', [OSError]);
var BrokenPipeError = new PyType('BrokenPipeError', [OSError]);
var ConnectionError = new PyType('ConnectionError', [OSError]);
var ConnectionAbortedError = new PyType('ConnectionAbortedError', [ConnectionError]);
var ConnectionRefusedError = new PyType('ConnectionRefusedError', [ConnectionError]);
var ConnectionResetError = new PyType('ConnectionResetError', [ConnectionError]);
var FileExistsError = new PyType('FileExistsError', [OSError]);
var FileNotFoundError = new PyType('FileNotFoundError', [OSError]);
var InterruptedError = new PyType('InterruptedError', [OSError]);
var IsADirectoryError = new PyType('IsADirectoryError', [OSError]);
var NotADirectoryError = new PyType('NotADirectoryError', [OSError]);
var PermissionError = new PyType('PermissionError', [OSError]);
var ProcessLookupError = new PyType('ProcessLookupError', [OSError]);
var TimeoutError = new PyType('TimeoutError', [OSError]);

var MethodNotFoundError = new PyType('MethodNotFoundError', [TypeError]);
var METHOD_NOT_FOUND = {
    exc_type: MethodNotFoundError,
    exc_value: new_exception(MethodNotFoundError, 'method not found'),
    exc_tb: None
};

var UnpackError = new PyType('UnpackError', [TypeError]);

var JSError = new PyType('JSError', [Exception]);


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


function main(name) {
    resume(modules[name].code);
}

function pack_bool(object) {
    return object ? True : False;
}


$.pack_int = pack_int;
$.pack_float = pack_float;
$.pack_str = pack_str;
$.pack_bytes = pack_bytes;
$.pack_tuple = pack_tuple;
$.pack_code = pack_code;

$.PyObject = PyObject;
$.PyType = PyType;
$.PyDict = PyDict;
$.PyFloat = PyFloat;
$.PyStr = PyStr;
$.PyBytes = PyBytes;
$.PyTuple = PyTuple;
$.PyCode = PyCode;

//$.unpack_int = unpack_int;
$.unpack_float = unpack_float;
$.unpack_str = unpack_str;
$.unpack_bytes = unpack_bytes;
$.unpack_tuple = unpack_tuple;
$.unpack_code = unpack_code;
