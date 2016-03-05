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











function PyFloat(value, cls) {
    PyObject.call(this, cls || py_float);
    this.value = value;
}
PyFloat.prototype = new PyObject;

function PyStr(value, cls) {
    PyObject.call(this, cls || py_str);
    this.value = value;
}
PyStr.prototype = new PyObject;

function PyBytes(value, cls) {
    PyObject.call(this, cls || py_bytes);
    this.value = value;
}
PyBytes.prototype = new PyObject;

function PyTuple(value, cls) {
    PyObject.call(this, cls || py_tuple);
    this.value = value;
}
PyTuple.prototype = new PyObject;

function PyCode(value, cls) {
    PyObject.call(this, cls || py_code);
    this.value = value;
}
PyCode.prototype = new PyObject;

function PyList(initializer, size, cls) {
    PyObject.call(this, cls || py_list);
    this.array = new Array(4);
    if (initializer) {
        this.size = initializer.length;
    } else {
        this.size = size || 0;
    }
    this.grow();
    if (initializer) {
        for (var index = 0; index < initializer.length; index++) {
            this.array[index] = initializer[index];
        }
    }
}
PyList.prototype = new PyObject;
PyList.prototype.check = function (index) {
    if (index < 0) {
        index = this.size - index;
    }
    if (index < 0 || index > this.size - 1) {
        raise(IndexError, 'index out of range');
    }
    return index;
};
PyList.prototype.grow = function () {
    while (this.array.length <= this.size) {
        var length = this.array.length * 2;
        while (length <= this.size) {
            length *= 2;
        }
        this.array.length = length;
    }
};
PyList.prototype.shrink = function () {
    if (this.array.length > 4 && this.array.length / 4 >= this.size) {
        var length = this.array.length / 2;
        while (length / 4 >= this.size && length > 4) {
            length /= 2;
        }
        this.array.length = length;
    }
};
PyList.prototype.get = function (index) {
    index = this.check(index);
    return this.array[index] || None;
};
PyList.prototype.set = function (index, item) {
    index = this.check(index);
    return this.array[index] = item;
};
PyList.prototype.append = function (item) {
    this.size++;
    this.grow();
    this.array[this.size - 1] = item;
    return item;
};
PyList.prototype.pop = function (index) {
    index = this.check(index);
    this.size--;
    if (index == null) {
        index = this.size;
    }
    var item = this.array[index];
    for (; index < this.size; index++) {
        this.array[index] = this.array[index + 1];
    }
    this.array[index] = null;
    this.shrink();
    return item;
};
PyList.prototype.clear = function () {
    this.array = new Array(4);
    this.size = 0;
};
PyList.prototype.slice = function (start, stop, step) {
    var index, list = new PyList();
    if (start == undefined) {
        start = 0;
    } else if (start < 0) {
        start = this.size + start;
    }
    if (stop == undefined) {
        stop = this.size;
    } else if (stop < 0) {
        stop = this.size + stop;
    }
    step = step || 1;
    if (step > 0) {
        if (start < 0) {
            start = 0;
        }
        if (stop > this.size) {
            stop = this.size;
        }
        for (index = start; index < stop; index += step) {
            list.append(this.array[index]);
        }
    } else if (step < 0) {
        if (start >= this.size) {
            start = this.size - 1;
        }
        if (stop < 0) {
            stop = 0;
        }
        for (index = start; index > stop; index += step) {
            list.append(this.array[index]);
        }
    } else {
        raise(ValueError, 'slice step cannot be zero')
    }
    return list;
};
PyList.prototype.concat = function (list_or_array) {
    var list, index, size;
    if (list_or_array instanceof PyList) {
        size = list_or_array.size;
        list_or_array = list_or_array.array;
    } else if (list_or_array instanceof Array) {
        size = list_or_array.length;
    } else {
        raise(TypeError, 'invalid type of concatenation object');
    }
    list = new PyList(null, this.size + size);
    for (index = 0; index < this.size; index++) {
        list.array[index] = this.array[index];
    }
    for (index = 0; index < size; index++) {
        list.array[index + this.size] = list_or_array[index];
    }
    return list;
};
PyList.prototype.copy = function () {
    return this.concat([]);
};



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


var None = new PyObject(PyType.native('NoneType'));
var NotImplemented = new PyObject(PyType.native('NotImplemented'));
var Ellipsis = new PyObject(PyType.native('Ellipsis'));

var False = new PyInt(0, py_bool);
var True = new PyInt(1, py_bool);

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
