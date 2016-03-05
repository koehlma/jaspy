function get_mro(cls) {
    return cls.mro;
}

function compute_mro(cls) {
    var pending = cls.bases.map(get_mro), result = [cls];
    var index, head, good;
    while (pending.length != 0) {
        for (index = 0; index < pending.length; index++) {
            head = pending[index][0];
            good = true;
            pending.forEach(function (base_mro) {
                base_mro.slice(1, base_mro.length).forEach(function (base_cls) {
                    good &= base_cls != head;
                })
            });
            if (good) {
                result.push(head);
                break;
            }
        }
        if (!good) {
            raise(TypeError, 'unable to linearize class hierarchy');
        }
        for (index = 0; index < pending.length; index++) {
            pending[index] = pending[index].filter(function (base_cls) {
                return base_cls != head;
            })
        }
        pending = pending.filter(function (base_mro) {
            return base_mro.length > 0;
        });
    }
    return result;
}


var object_id_counter = 0;

function PyObject(cls, dict) {
    this.cls = cls;
    this.dict = dict || null;
    this.id = null;
}
PyObject.prototype.get_id = function () {
    if (this.id === null) {
        this.id = object_id_counter++;
    }
    return this.id;
};
PyObject.prototype.get_address = function () {
    return ('0000000000000' + this.get_id().toString(16)).substr(-13);
};
PyObject.prototype.is_instance_of = function (cls) {
    return this.cls.is_subclass_of(cls);
};
PyObject.prototype.is_native = function () {
    return this.cls.native === this.cls;
};
PyObject.prototype.call_method = function (name, args, kwargs) {
    var method = this.cls.lookup(name);
    if (method) {
        return call_object(method, [this].concat(args || []), kwargs);
    } else {
        vm.return_value = null;
        vm.last_exception = METHOD_NOT_FOUND;
        return false;
    }
};
PyObject.prototype.setattr = function (name, value) {
    if (!this.dict) {
        raise(TypeError, 'object does not support attribute access');
    }
    this.dict.set(name, value);
};
PyObject.prototype.getattr = function (name) {
    if (!this.dict) {
        raise(TypeError, 'object does not support attribute access');
    }
    return this.dict.get(name)
};
PyObject.prototype.unpack = function (name) {
    var item = this[name];
    if (!item) {
        raise(TypeError, 'unable to unpack ' + name + ' from object');
    }
    return item;
};
PyObject.prototype.pack = function (name, value) {
    this[name] = value;
};


function PyType(name, bases, attributes, mcs) {
    var index, native;
    PyObject.call(this, mcs || py_type, attributes || new PyDict());
    this.name = name;
    this.bases = bases || [py_object];
    this.mro = compute_mro(this);
    this.native = null;
    for (index = 0; index < this.mro.length; index++) {
        native = this.mro[index].native;
        if (native === py_object) {
            continue;
        }
        if (this.native && this.native !== native && native) {
            raise(TypeError, 'invalid native type hierarchy');
        }
        this.native = native;
    }
    this.native = this.native || py_object;
}
PyType.prototype = new PyObject;
PyType.prototype.is_subclass_of = function (cls) {
    var index;
    if (cls === this) {
        return true;
    } else {
        for (index = 0; index < this.mro.length; index++) {
            if (this.mro[index] === cls) {
                return true;
            }
        }
    }
    return false;
};
PyType.prototype.is_native = function () {
    return this.native === this;
};
PyType.prototype.lookup = function (name) {
    var index, value;
    for (index = 0; index < this.mro.length; index++) {
        value = this.mro[index].dict.get(name);
        if (value) {
            return value;
        }
    }
};
PyType.prototype.define = function (name, item) {
    this.dict.set(name, item);
    return item;
};
PyType.prototype.define_alias = function (name, alias) {
    return this.define(alias, this.lookup(name));
};
PyType.prototype.$def = function (name, func, signature, options) {
    options = options || {};
    options.name = options.name || name;
    options.qualname = options.qualname || (this.name + '.' + options.name);
    return this.define(name, new_native(func, ['self'].concat(signature || []), options));
};
PyType.prototype.define_property = function (name, getter, setter) {
    var options = {name: name, qualname: this.name + '.' + name};
    if (getter) {
        getter = new_native(getter, ['self'], options);
    }
    if (setter) {
        setter = new_native(setter, ['self', 'value'], options);
    }
    return this.define(name, new new_property(getter, setter));
};
PyType.prototype.define_classmethod = function (name, func, signature, options) {
    options = options || {};
    options.name = options.name || name;
    options.qualname = options.qualname || (this.name + '.' + options.name);
    return this.define(name, new_native(func, ['cls'].concat(signature || []), options));
};
PyType.prototype.call_classmethod = function (name, args, kwargs) {
    var method = this.lookup(name);
    if (method) {
        return call_object(method, [this].concat(args || []), kwargs);
    } else {
        vm.return_value = null;
        vm.last_exception = METHOD_NOT_FOUND;
        return false;
    }
};
PyType.prototype.call_staticmethod = function (name, args, kwargs) {
    var method = this.lookup(name);
    if (method) {
        return call_object(method, args, kwargs);
    } else {
        vm.return_value = null;
        vm.last_exception = METHOD_NOT_FOUND;
        return false;
    }
};
PyType.prototype.create = function (args, kwargs) {
    if (this.call_method('__call__', args, kwargs)) {
        raise(TypeError, 'invalid call to python code during object creation')
    }
    return vm.return_value;
};


function PyDict(initializer, cls) {
    var name;
    PyObject.call(this, cls || py_dict);
    this.table = {};
    if (initializer) {
        for (name in initializer) {
            if (initializer.hasOwnProperty(name)) {
                this.set(name, initializer[name]);
            }
        }
    }
}
PyDict.prototype = new PyObject;
PyDict.prototype.get = function (str_key) {
    var current;
    if (str_key instanceof PyStr) {
        str_key = str_key.value;
    } else if (typeof str_key != 'string') {
        raise(TypeError, 'invalid primitive dict key type');
    }
    current = this.table[str_key];
    while (current) {
        if (current.key.value === str_key) {
            return current.value;
        }
        current = current.next;
    }
};
PyDict.prototype.set = function (str_key, value) {
    var current;
    if (typeof str_key == 'string') {
        str_key = new_str(str_key);
    } else if (!(str_key instanceof PyStr)) {
        raise(TypeError, 'invalid primitive dict key type');
    }
    current = this.table[str_key];
    while (current) {
        if (current.key.value === str_key.value) {
            current.value = value;
            return;
        }
        current = current.next;
    }
    this.table[str_key.value] = {key: str_key, value: value, next: this.table[str_key]}
};
PyDict.prototype.pop = function (str_key) {
    var current, value;
    if (str_key instanceof PyStr) {
        str_key = str_key.value;
    } else if (typeof str_key != 'string') {
        raise(TypeError, 'invalid primitive dict key type');
    }
    current = this.table[str_key];
    if (current) {
        if (current.key.value === str_key) {
            if (!(this.table[str_key] = current.next)) {
                delete this.table[str_key];
            }
            return current.value;
        } else {
            while (current) {
                if (current.next && current.next.key.value === str_key) {
                    value = current.next.value;
                    current.next = current.next.next;
                    return value;
                }
                current = current.next;
            }
        }
    }
};


function new_type(name, bases, attributes, mcs) {
    return new PyType(name, bases, attributes, mcs);
}

function new_native_type(name, bases, attributes, mcs) {
    var type = new PyType(name, bases, attributes, mcs);
    type.native = type;
    return type;
}


var py_object = new_native_type('object', []);
var py_type = new_native_type('type', [py_object]);
var py_dict = new_native_type('dict', [py_object]);

py_object.cls = py_type.cls = py_dict.cls = py_type;
py_object.dict.cls = py_type.dict.cls = py_dict.dict.cls = py_dict;

var py_int = new_native_type('int');
var py_bool = new_native_type('bool', [py_int]);

var py_float = new_native_type('float');

var py_str = new_native_type('str');
var py_bytes = new_native_type('bytes');

var py_tuple = new_native_type('tuple');

var py_code = new_native_type('code');

var py_list = new_native_type('list');

var py_namespace = new_native_type('namespace');
var py_cell = new_native_type('cell');
var py_frame = new_native_type('frame');

var py_js_object = new_native_type('JSObject');
var py_js_array = new_native_type('JSArray');
var py_js_function = new_native_type('JSFunction');

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


function PyInt(value, cls) {
    PyObject.call(this, cls || py_int);
    this.value = value;
}
PyInt.prototype = new PyObject;

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

function PyNamespace(namespace) {
    PyObject.call(this, py_namespace);
    this.namespace = namespace || {};
}
PyNamespace.prototype = new PyObject();
PyNamespace.prototype.load = function (name) {
    var current;
    if (name instanceof PyStr) {
        name = name.value;
    } else if (typeof name != 'string') {
        raise(TypeError, 'invalid namespace name type');
    }
    return this.namespace[name];
};
PyNamespace.prototype.store = function (name, value) {
    this.namespace[name] = value;
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


function new_int(value, cls) {
    return new PyInt(value, cls);
}

function new_float(value, cls) {
    return new PyFloat(value, cls);
}

function new_str(value, cls) {
    return new PyStr(value, cls);
}

function new_bytes(value, cls) {
    return new PyBytes(value, cls);
}

function new_tuple(value, cls) {
    return new PyTuple(value, cls);
}

function new_list(array, cls) {
    return new PyList(array, cls);
}

function new_code(value) {
    return new PyCode(value);
}

function new_namespace(namespace) {
    return new PyNamespace(namespace);
}

function new_call(item) {
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


var None = new PyObject(new_native_type('NoneType'));
var NotImplemented = new PyObject(new_native_type('NotImplemented'));
var Ellipsis = new PyObject(new_native_type('Ellipsis'));

var False = new PyInt(0, py_bool);
var True = new PyInt(1, py_bool);


function unpack_int(object, fallback) {
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


var BUILTINS_STR = new_str('builtins');

function new_native(func, signature, options) {
    options = options || {};
    var code = new NativeCode(func, options, signature);
    func = new PyObject(py_function, new PyDict());
    func.setattr('__name__', new_str(options.name || '<unkown>'));
    func.setattr('__qualname__', new_str(options.qualname || '<unkown>'));
    func.setattr('__doc__', new_str(options.doc || ''));
    func.setattr('__module__', options.module ? new_str(options.module) : BUILTINS_STR);
    func.setattr('__code__', new_code(code));
    func.setattr('__defaults__', new_namespace(options.defaults));
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
    return new PyObject(JSError, new PyDict({
        'args': new_tuple([new_str(error.name), new_str(error.message)])
    }));
}

function new_exception(cls, message) {
    var exc_value = new PyObject(cls, new PyDict());
    exc_value.dict.set('args', new_tuple([new_str(message)]));
    return exc_value;
}


function new_property(getter, setter) {
    return new PyObject(py_property, new PyDict({
        'fget': getter || None,
        'fset': setter || None
    }));
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
