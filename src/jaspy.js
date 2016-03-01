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

window['jaspy'] = (function () {
    'use strict';


    var DEBUG = true;

    var CODE_FLAGS = {
        OPTIMIZED: 1 << 0,
        NEWLOCALS: 1 << 1,
        NESTED: 1 << 4,
        GENERATOR: 1 << 5,
        NOFREE: 1 << 6,

        VAR_ARGS: 1 << 2,
        VAR_KWARGS: 1 << 3,

        PYTHON: 1 << 10,
        NATIVE: 1 << 11
    };
    var BLOCK_TYPES = {
        BASE: 0,
        LOOP: 1,
        EXCEPT: 2,
        FINALLY: 3
    };
    var UNWIND_CAUSES = {
        RETURN: 0,
        EXCEPTION: 1
    };

    var OPCODES = {
        BEFORE_ASYNC_WITH: 52,
        BINARY_ADD: 23,
        BINARY_AND: 64,
        BINARY_FLOOR_DIVIDE: 26,
        BINARY_LSHIFT: 62,
        BINARY_MATRIX_MULTIPLY: 16,
        BINARY_MODULO: 22,
        BINARY_MULTIPLY: 20,
        BINARY_OR: 66,
        BINARY_POWER: 19,
        BINARY_RSHIFT: 63,
        BINARY_SUBSCR: 25,
        BINARY_SUBTRACT: 24,
        BINARY_TRUE_DIVIDE: 27,
        BINARY_XOR: 65,
        BREAK_LOOP: 80,
        BUILD_LIST: 103,
        BUILD_LIST_UNPACK: 149,
        BUILD_MAP: 105,
        BUILD_MAP_UNPACK: 150,
        BUILD_MAP_UNPACK_WITH_CALL: 151,
        BUILD_SET: 104,
        BUILD_SET_UNPACK: 153,
        BUILD_SLICE: 133,
        BUILD_TUPLE: 102,
        BUILD_TUPLE_UNPACK: 152,
        CALL_FUNCTION: 131,
        CALL_FUNCTION_KW: 141,
        CALL_FUNCTION_VAR: 140,
        CALL_FUNCTION_VAR_KW: 142,
        COMPARE_OP: 107,
        CONTINUE_LOOP: 119,
        DELETE_ATTR: 96,
        DELETE_DEREF: 138,
        DELETE_FAST: 126,
        DELETE_GLOBAL: 98,
        DELETE_NAME: 91,
        DELETE_SUBSCR: 61,
        DUP_TOP: 4,
        DUP_TOP_TWO: 5,
        END_FINALLY: 88,
        EXTENDED_ARG: 144,
        FOR_ITER: 93,
        GET_AITER: 50,
        GET_ANEXT: 51,
        GET_AWAITABLE: 73,
        GET_ITER: 68,
        GET_YIELD_FROM_ITER: 69,
        IMPORT_FROM: 109,
        IMPORT_NAME: 108,
        IMPORT_STAR: 84,
        INPLACE_ADD: 55,
        INPLACE_AND: 77,
        INPLACE_FLOOR_DIVIDE: 28,
        INPLACE_LSHIFT: 75,
        INPLACE_MATRIX_MULTIPLY: 17,
        INPLACE_MODULO: 59,
        INPLACE_MULTIPLY: 57,
        INPLACE_OR: 79,
        INPLACE_POWER: 67,
        INPLACE_RSHIFT: 76,
        INPLACE_SUBTRACT: 56,
        INPLACE_TRUE_DIVIDE: 29,
        INPLACE_XOR: 78,
        JUMP_ABSOLUTE: 113,
        JUMP_FORWARD: 110,
        JUMP_IF_FALSE_OR_POP: 111,
        JUMP_IF_TRUE_OR_POP: 112,
        LIST_APPEND: 145,
        LOAD_ATTR: 106,
        LOAD_BUILD_CLASS: 71,
        LOAD_CLASSDEREF: 148,
        LOAD_CLOSURE: 135,
        LOAD_CONST: 100,
        LOAD_DEREF: 136,
        LOAD_FAST: 124,
        LOAD_GLOBAL: 116,
        LOAD_NAME: 101,
        MAKE_CLOSURE: 134,
        MAKE_FUNCTION: 132,
        MAP_ADD: 147,
        NOP: 9,
        POP_BLOCK: 87,
        POP_EXCEPT: 89,
        POP_JUMP_IF_FALSE: 114,
        POP_JUMP_IF_TRUE: 115,
        POP_TOP: 1,
        PRINT_EXPR: 70,
        RAISE_VARARGS: 130,
        RETURN_VALUE: 83,
        ROT_THREE: 3,
        ROT_TWO: 2,
        SETUP_ASYNC_WITH: 154,
        SETUP_EXCEPT: 121,
        SETUP_FINALLY: 122,
        SETUP_LOOP: 120,
        SETUP_WITH: 143,
        SET_ADD: 146,
        STORE_ATTR: 95,
        STORE_DEREF: 137,
        STORE_FAST: 125,
        STORE_GLOBAL: 97,
        STORE_NAME: 90,
        STORE_SUBSCR: 60,
        UNARY_INVERT: 15,
        UNARY_NEGATIVE: 11,
        UNARY_NOT: 12,
        UNARY_POSITIVE: 10,
        UNPACK_EX: 94,
        UNPACK_SEQUENCE: 92,
        WITH_CLEANUP_FINISH: 82,
        WITH_CLEANUP_START: 81,
        YIELD_FROM: 72,
        YIELD_VALUE: 86
    };
    var OPCODES_EXTRA = (function () {
        var map = new Array(200);
        map[OPCODES.UNARY_POSITIVE] = '__pos__';
        map[OPCODES.UNARY_NEGATIVE] = '__neg__';
        map[OPCODES.UNARY_NOT] = '__not__';
        map[OPCODES.UNARY_INVERT] = '__invert__';
        map[OPCODES.GET_ITER] = '__iter__';

        map[OPCODES.BINARY_POWER] = 'pow';
        map[OPCODES.BINARY_MULTIPLY] = 'mul';
        map[OPCODES.BINARY_MATRIX_MULTIPLY] = 'matmul';
        map[OPCODES.BINARY_FLOOR_DIVIDE] = 'floordiv';
        map[OPCODES.BINARY_TRUE_DIVIDE] = 'truediv';
        map[OPCODES.BINARY_MODULO] = 'mod';
        map[OPCODES.BINARY_ADD] = 'add';
        map[OPCODES.BINARY_SUBTRACT] = 'sub';
        map[OPCODES.BINARY_SUBSCR] = 'getitem';
        map[OPCODES.BINARY_LSHIFT] = 'lshift';
        map[OPCODES.BINARY_RSHIFT] = 'rshift';
        map[OPCODES.BINARY_AND] = 'and';
        map[OPCODES.BINARY_XOR] = 'xor';
        map[OPCODES.BINARY_OR] = 'or';

        map[OPCODES.INPLACE_POWER] = '__ipow__';
        map[OPCODES.INPLACE_MULTIPLY] = '__imul__';
        map[OPCODES.INPLACE_MATRIX_MULTIPLY] = '__imatmul__';
        map[OPCODES.INPLACE_FLOOR_DIVIDE] = '__ifloordiv__';
        map[OPCODES.INPLACE_TRUE_DIVIDE] = '__itruediv__';
        map[OPCODES.INPLACE_MODULO] = '__imod__';
        map[OPCODES.INPLACE_ADD] = '__iadd__';
        map[OPCODES.INPLACE_SUBTRACT] = '__isub__';
        map[OPCODES.INPLACE_LSHIFT] = '__ilshift__';
        map[OPCODES.INPLACE_RSHIFT] = '__irshift__';
        map[OPCODES.INPLACE_AND] = '__iand__';
        map[OPCODES.INPLACE_XOR] = '__ixor__';
        map[OPCODES.INPLACE_OR] = '__ior__';
        map[OPCODES.STORE_SUBSCR] = '__setitem__';
        map[OPCODES.DELETE_SUBSCR] = '__delitem__';

        map[OPCODES.SETUP_LOOP] = BLOCK_TYPES.LOOP;
        map[OPCODES.SETUP_EXCEPT] = BLOCK_TYPES.EXCEPT;
        map[OPCODES.SETUP_FINALLY] = BLOCK_TYPES.FINALLY;

        return map;
    })();
    var OPCODES_ARGUMENT = 90;

    var COMPARE_OPS = {
        LT: 0, LE: 1, EQ: 2, NE: 3, GT: 4, GE: 5, IN: 6, NIN: 7, IS: 8, NIS: 9, EXC: 10
    };


    function error(message) {
        throw new Error('[FATAL ERROR] ' + (message || 'fatal interpreter error'));
    }
    function assert(condition, message) {
        if (!condition) {
            error(message);
        }
    }
    function raise(exc_type, message) {
        if (exc_type) {
            throw new_exception(exc_type, message);
        } else {
            error(message);
        }
    }


    function ArrayList(size) {
        this.array = new Array(4);
        this.size = size || 0;
        this.grow();
    }
    ArrayList.prototype.check = function (index) {
        if (index < 0) {
            index = this.size - index;
        }
        if (index < 0 || index > this.size - 1) {
            raise(IndexError, 'index out of range');
        }
        return index;
    };
    ArrayList.prototype.grow = function () {
        while (this.array.length <= this.size) {
            var length = this.array.length * 2;
            while (length <= this.size) {
                length *= 2;
            }
            this.array.length = length;
        }
    };
    ArrayList.prototype.shrink = function () {
        if (this.array.length > 4 && this.array.length / 4 >= this.size) {
            var length = this.array.length / 2;
            while (length / 4 >= this.size && length > 4) {
                length /= 2;
            }
            this.array.length = length;
        }
    };
    ArrayList.prototype.get = function (index) {
        index = this.check(index);
        return this.array[index];
    };
    ArrayList.prototype.set = function (index, item) {
        index = this.check(index);
        return this.array[index] = item;
    };
    ArrayList.prototype.append = function (item) {
        this.size++;
        this.grow();
        this.array[this.size - 1] = item;
        return item;
    };
    ArrayList.prototype.pop = function (index) {
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
    ArrayList.prototype.clear = function () {
        this.array = new Array(4);
        this.size = 0;
    };
    ArrayList.prototype.slice = function (start, stop, step) {
        var index, list = new ArrayList();
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
    ArrayList.prototype.concat = function (list_or_array) {
        var list, index, size;
        if (list_or_array instanceof ArrayList) {
            size = list_or_array.size;
            list_or_array = list_or_array.array;
        } else if (list_or_array instanceof Array) {
            size = list_or_array.length;
        } else {
            raise(TypeError, 'invalid type of "list_or_array" argument');
        }
        list = new ArrayList(this.size + size);
        for (index = 0; index < this.size; index++) {
            list.array[index] = this.array[index];
        }
        for (index = 0; index < size; index++) {
            list.array[index + this.size] = list_or_array[index];
        }
        return list;
    };
    ArrayList.prototype.copy = function () {
        return this.concat([]);
    };


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
        return ('0000000000000' + args.self.get_id().toString(16)).substr(-13);
    };
    PyObject.prototype.is_instance_of = function (cls) {
        return this.cls.is_subclass_of(cls);
    };
    PyObject.prototype.call_method = function (vm, name, args, kwargs) {
        var method = this.cls.lookup(name);
        if (method) {
            return vm.call_object(method, [this].concat(args || []), kwargs);
        } else {
            vm.return_value = null;
            vm.last_exception = METHOD_NOT_FOUND;
            return false;
        }
    };


    function PyType(name, bases, attributes, mcs) {
        var index, builtin;
        PyObject.call(this, mcs || py_type, attributes || new PyDict());
        this.name = name;
        this.bases = bases || [py_object];
        this.mro = compute_mro(this);
        this.native = null;
        for (index = 0; index < this.mro.length; index++) {
            builtin = this.mro[index].native;
            if (builtin === py_object) {
                continue;
            }
            if (this.native && this.native !== builtin && builtin) {
                raise(TypeError, 'invalid native type hierarchy');
            }
            this.native = builtin;
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
    };
    PyType.prototype.define_method = function (name, func, signature, options) {
        options = options || {};
        options.name = options.name || name;
        options.qualname = options.qualname || (this.name + '.' + options.name);
        this.define(name, new_native(func, signature, options));
    };
    PyType.prototype.call_classmethod = function (vm, name, args, kwargs) {
        var method = this.lookup(name);
        if (method) {
            return vm.call_object(method, [this].concat(args || []), kwargs);
        } else {
            vm.return_value = null;
            vm.last_exception = METHOD_NOT_FOUND;
            return false;
        }
    };
    PyType.prototype.call_staticmethod = function (vm, name, args, kwargs) {
        var method = this.lookup(name);
        if (method) {
            return vm.call_object(method, args, kwargs);
        } else {
            vm.return_value = null;
            vm.last_exception = METHOD_NOT_FOUND;
            return false;
        }
    };


    function PyDict(cls) {
        PyObject.call(this, cls || py_dict);
        this.table = {};
    }
    PyDict.prototype = new PyObject;
    PyDict.prototype.get = function (str_key) {
        var current;
        if (str_key instanceof PyStr) {
            str_key = str_key.value;
        } else if (typeof str_key != 'string') {
            raise(TypeError, 'invalid primitive key type');
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
            raise(TypeError, 'invalid primitive key type');
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
            raise(TypeError, 'invalid primitive key type');
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
    var py_set = new_native_type('set');

    var py_function = new_native_type('function');
    var py_method = new_native_type('method');
    var py_generator = new_native_type('generator');

    var py_frame = new_native_type('frame');
    var py_traceback = new_native_type('traceback');

    var py_module = new_native_type('ModuleType');


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


    var None = new PyObject(new_native_type('NoneType'));
    var NotImplemented = new PyObject(new_native_type('NotImplemented'));
    var Ellipsis = new PyObject(new_native_type('Ellipsis'));

    var False = new PyInt(0, py_bool);
    var True = new PyInt(1, py_bool);


    function new_int(value) {
        return new PyInt(value);
    }
    function new_float(value) {
        return new PyFloat(value);
    }
    function new_str(value) {
        return new PyStr(value);
    }
    function new_bytes(value) {
        return new PyBytes(value);
    }
    function new_tuple(value) {
        return new PyTuple(value);
    }
    function new_code(value) {
        return new PyCode(value);
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
    var EnvironmentError = OSError, IOError = OSError;

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

    var MethodNotFoundError = new PyType('MethodNotFoundError', [Exception]);
    var METHOD_NOT_FOUND = {exc_type: MethodNotFoundError, exc_value: None, exc_tb: None};

    function new_exception(cls, message) {
        var exc_value = new PyObject(cls, new PyDict());
        exc_value.dict.set('args', new_tuple([new_str(message)]));
        return exc_value;
    }


    var Property = new PyType('property');

    function new_property() {
        return new PyObject(Property);
    }


    function Code(options) {
        options = options || {};

        this.name = options.name || '<unknown>';
        this.filename = options.filename || '<unknown>';

        this.flags = options.flags || 0;

        this.argnames = options.argnames || [];

        this.argcount = options.argcount || 0;
        this.kwargcount = options.kwargcount || 0;
    }
    Code.prototype.parse_args = function (args, kwargs, defaults) {
        var index, name, result = {};

        args = args || [];
        kwargs = kwargs || {};

        for (index = 0; index < this.argcount; index++) {
            name = this.argnames[index];
            if (args[index]) {
                result[name] = args[index];
            } else if (name in kwargs) {
                result[name] = kwargs[name];
                delete kwargs[name];
            } else if (defaults && name in defaults) {
                result[name] = defaults[name];
            } else {
                raise(TypeError, 'missing required positional argument "' + name + '"');
            }
            if (name in kwargs) {
                raise(TypeError, 'got multiple values for argument "' + name + '"');
            }
        }
        for (; index < this.argcount + this.kwargcount; index++) {
            name = this.argnames[index];
            if (name in kwargs) {
                result[name] = kwargs[name];
                delete kwargs[name];
            } else if (defaults && name in defaults) {
                result[name] = defaults[name];
            } else {
                raise(TypeError, 'missing required keyword argument "' + name +'"');
            }
        }
        if ((this.flags & CODE_FLAGS.VAR_ARGS) != 0) {
            name = this.argnames[index++];
            result[name] = args.slice(this.argcount, args.length);
        } else if (args.length > this.argcount) {
            raise(TypeError, 'too many positional arguments given');
        }
        if ((this.flags & CODE_FLAGS.VAR_KWARGS) != 0) {
            name = this.argnames[index];
            result[name] = kwargs;
        } else {
            for (name in kwargs) {
                if (name in kwargs) {
                    raise(TypeError, 'too many keyword arguments given');
                }
            }
        }

        return result;
    };

    function PythonCode(bytecode, options) {
        this.bytecode = bytecode;

        options = options || {};
        options.flags = (options.flags || 0) | CODE_FLAGS.PYTHON;
        options.name = options.name || '<module>';
        options.argnames = options.varnames || [];

        Code.call(this, options);

        this.names = options.names || [];
        this.varnames = options.varnames || [];
        this.freevars = options.freevars || [];
        this.callvars = options.callvars || [];

        this.constants = options.constants || [];

        this.firstline = options.firstline || 1;
        this.lnotab = options.lnotab || '';
    }
    PythonCode.prototype = new Code;
    PythonCode.prototype.get_line_number = function (position) {
        var line_number = this.firstline, offset = 0;
        var index, offset_increment, line_increment;
        for (index = 0; index < this.lnotab.length; index++) {
            offset_increment = this.lnotab.charCodeAt(index++);
            line_increment = this.lnotab.charCodeAt(index);
            offset += offset_increment;
            if (offset > position) {
                break;
            }
            line_number += line_increment;
        }
        return line_number;
    };

    function NativeCode(func, options, signature) {
        this.func = func;

        options = options || {};
        options.flags = (options.flags || 0) | CODE_FLAGS.NATIVE;
        options.name = options.name || '<native>';

        if (signature) {
            options.argnames = options.argnames || signature;
            if (!options.argcount) {
                options.argcount = signature.length;
                if ((options.flags & CODE_FLAGS.VAR_ARGS) != 0) {
                    options.argcount--;
                }
                if ((options.flags & CODE_FLAGS.VAR_KWARGS) != 0) {
                    options.argcount--;
                }
                if (options.kwargcount) {
                    options.argcount -= options.kwargcount;
                }
            }
        }

        Code.call(this, options);

        this.simple = options.simple || false;
    }
    NativeCode.prototype = new Code;
    NativeCode.prototype.get_line_number = function (position) {
        return position;
    };


    function Frame(code, options) {
        this.code = code;

        options = options || {};

        this.back = options.back || null;

        this.globals = options.globals || (this.back ? this.back.globals : {});
        this.builtins = options.builtins || (this.back ? this.back.builtins : {});

        this.position = options.position || 0;

        this.vm = options.vm || null;

        if (this.code === undefined) return;

        this.args = this.code.parse_args(options.args, options.kwargs, options.defaults);
    }
    Frame.prototype.get_line_number = function () {
        return this.code.get_line_number(this.position);
    };

    function PythonFrame(code, options) {
        options = options || {};

        Frame.call(this, code, options);

        this.locals = options.locals || this.args;

        this.namespace = options.namespace || null;

        this.stack = options.stack || [];
        this.blocks = options.blocks || [];
        if (!options.blocks) {
            this.push_block(BLOCK_TYPES.BASE, 0);
        }

        this.state = options.state || 0;
        this.raising = false;
    }
    PythonFrame.prototype = new Frame;
    PythonFrame.prototype.top_block = function () {
        return this.blocks[this.blocks.length - 1];
    };
    PythonFrame.prototype.push_block = function (type, position) {
        this.blocks.push({type: type, position: position, active: false});
    };
    PythonFrame.prototype.pop_block = function () {
        return this.blocks.pop();
    };
    PythonFrame.prototype.pop = function () {
        return this.stack.pop();
    };
    PythonFrame.prototype.popn = function (number) {
        return number > 0 ? this.stack.splice(this.stack.length - number, number) : [];
    };
    PythonFrame.prototype.top0 = function () {
        return this.stack[this.stack.length - 1];
    };
    PythonFrame.prototype.top1 = function () {
        return this.stack[this.stack.length - 2];
    };
    PythonFrame.prototype.topn = function (number) {
        return number > 0 ? this.stack.slice(this.stack.length - number, number) : [];
    };
    PythonFrame.prototype.push = function (item) {
        assert(item instanceof PyObject);
        this.stack.push(item);
    };
    PythonFrame.prototype.fetch = function () {
        var high, low, argument = null;
        if (this.position >= this.code.bytecode.length) {
            error('bytecode overflow');
        }
        var opcode = this.code.bytecode.charCodeAt(this.position++);
        console.log('opcode: ' + opcode + ' | ' + 'position: ' + this.position);
        if (opcode >= OPCODES_ARGUMENT) {
            low = this.code.bytecode.charCodeAt(this.position++);
            high = this.code.bytecode.charCodeAt(this.position++);
            argument = high << 8 | low;
        }
        return {opcode: opcode, argument: argument};
    };
    PythonFrame.prototype.unwind = function (cause) {
        console.log(cause);
        while (this.blocks.length > 0) {
            var block = this.top_block();
            if (block.active) {
                this.blocks.pop();
                continue;
            }
            switch (cause) {
                case UNWIND_CAUSES.EXCEPTION:
                    console.log('exc', block.type, block.type == BLOCK_TYPES.EXCEPT);
                    if (block.type == BLOCK_TYPES.EXCEPT || block.type == BLOCK_TYPES.FINALLY) {
                        this.position = block.position;
                        block.active = true;
                        return;
                    } else if (block.type == BLOCK_TYPES.BASE) {
                        this.vm.frame = this.back;
                        return;
                    } else {
                        this.blocks.pop()
                    }
                    break;
                case UNWIND_CAUSES.RETURN:
                    if (block.type == BLOCK_TYPES.FINALLY) {
                        this.position = block.position;
                        block.active = true;
                        return;
                    } else if (block.type == BLOCK_TYPES.BASE) {
                        this.vm.frame = this.back;
                        return;
                    } else {
                        this.blocks.pop();
                    }
                    break;
                default:
                    throw new Error('unknwen bloclk')
            }
        }
    };
    PythonFrame.prototype.step = function () {
        var top, value, low, high, mid, name, code, defaults, globals, index, slot, func;
        var head, right, left, kwargs, args, type, block, temp;
        var exc_type, exc_traceback, exc_value;
        if (vm.return_value === null && !this.raising) {
            this.push(this.vm.last_exception.exc_tb);
            this.push(this.vm.last_exception.exc_value);
            this.push(this.vm.last_exception.exc_type);
            console.log(this.vm.last_exception);
            this.raising = true;
            this.unwind(UNWIND_CAUSES.EXCEPTION);
            return;
        }
        var instruction = this.fetch();
        if (DEBUG) {
            console.log('executing instruction', instruction);
        }
        switch (instruction.opcode) {
            case OPCODES.NOP:
                break;

            case OPCODES.POP_TOP:
                this.pop();
                break;
            case OPCODES.ROT_TWO:
                top = this.popn(2);
                this.push(top[1]);
                this.push(top[0]);
                break;
            case OPCODES.ROT_THREE:
                top = this.popn(3);
                this.push(top[2]);
                this.push(top[1]);
                this.push(top[0]);
                break;
            case OPCODES.DUP_TOP:
                this.push(this.top0());
                break;
            case OPCODES.DUP_TOP_TWO:
                this.push(this.top1());
                this.push(this.top1());
                break;

            case OPCODES.UNARY_POSITIVE:
            case OPCODES.UNARY_NEGATIVE:
            case OPCODES.UNARY_NOT:
            case OPCODES.UNARY_INVERT:
            case OPCODES.GET_ITER:
                switch (this.state) {
                    case 0:
                        if (this.pop().call_method(this.vm, OPCODES_EXTRA[instruction.opcode])) {
                            this.state = 1;
                            this.position--;
                            break;
                        }
                    case 1:
                        this.state = 0;
                        if (vm.return_value == NotImplemented || vm.except(MethodNotFoundError)) {
                            vm.raise(TypeError, 'unsupported operand type');
                        } else if (vm.return_value) {
                            this.push(vm.return_value);
                        }
                        break;
                }
                break;

            case OPCODES.GET_YIELD_FROM_ITER:
                error('not implemented');
                break;

            case OPCODES.BINARY_POWER:
            case OPCODES.BINARY_MULTIPLY:
            case OPCODES.BINARY_MATRIX_MULTIPLY:
            case OPCODES.BINARY_FLOOR_DIVIDE:
            case OPCODES.BINARY_TRUE_DIVIDE:
            case OPCODES.BINARY_MODULO:
            case OPCODES.BINARY_ADD:
            case OPCODES.BINARY_SUBTRACT:
            case OPCODES.BINARY_SUBSCR:
            case OPCODES.BINARY_LSHIFT:
            case OPCODES.BINARY_RSHIFT:
            case OPCODES.BINARY_AND:
            case OPCODES.BINARY_XOR:
            case OPCODES.BINARY_OR:
                switch (this.state) {
                    case 0:
                        slot = OPCODES_EXTRA[instruction.opcode];
                        left = this.top1();
                        right = this.top0();
                        if (left.call_method(this.vm, '__' + slot + '__', [right])) {
                            this.state++;
                            this.position--;
                            break;
                        }
                    case 1:
                        if (!vm.return_value) {
                            error('exception raised');
                        }
                        if (vm.return_value != NotImplemented) {
                            this.state = 0;
                            this.popn(2);
                            this.push(vm.return_value);
                            break;
                        }
                        slot = OPCODES_EXTRA[instruction.opcode];
                        right = this.pop();
                        left = this.pop();
                        func = right.cls.lookup('__r' + slot + '__');
                        if (func) {
                            if (vm.c(func, [right, left])) {
                                this.state++;
                                this.position--;
                            }
                            break;
                        } else {
                            this.state = 0;
                            this.vm.raise(TypeError, 'unsupported operand type');
                            break;
                        }
                        break;
                    case 2:
                        this.state = 0;
                        if (vm.return_value != NotImplemented) {
                            this.push(vm.return_value);
                        } else {
                            this.vm.raise(TypeError, 'unsupported operand type');
                        }
                        break;
                }
                break;

            case OPCODES.INPLACE_POWER:
            case OPCODES.INPLACE_MULTIPLY:
            case OPCODES.INPLACE_MATRIX_MULTIPLY:
            case OPCODES.INPLACE_FLOOR_DIVIDE:
            case OPCODES.INPLACE_TRUE_DIVIDE:
            case OPCODES.INPLACE_MODULO:
            case OPCODES.INPLACE_ADD:
            case OPCODES.INPLACE_SUBTRACT:
            case OPCODES.INPLACE_LSHIFT:
            case OPCODES.INPLACE_RSHIFT:
            case OPCODES.INPLACE_AND:
            case OPCODES.INPLACE_XOR:
            case OPCODES.INPLACE_OR:
            case OPCODES.STORE_SUBSCR:
            case OPCODES.DELETE_SUBSCR:
                switch (this.state) {
                    case 0:
                        slot = OPCODES_EXTRA[instruction.opcode];
                        right = this.pop();
                        left = this.pop();
                        func = left.cls.lookup('__' + slot + '__');
                        if (func) {
                            if (vm.c(func, [left, right])) {
                                this.state++;
                                this.position--;
                                break;
                            }
                        } else {
                            vm.return_value = NotImplemented;
                        }
                    case 1:
                        this.state = 0;
                        if (!vm.return_value) {
                            error('exception raised');
                        }
                        if (vm.return_value != NotImplemented) {
                            this.push(vm.return_value);
                            break;
                        } else {
                            this.vm.raise(TypeError, 'unsupported operand type');
                            break;
                        }
                }
                break;

            case OPCODES.PRINT_EXPR:
                console.log(this.pop());
                break;


            case OPCODES.POP_JUMP_IF_TRUE:
                if (this.top0() instanceof PyInt) {
                    if (this.pop().value) {
                        this.position = instruction.argument;
                    }
                    break;
                }
                switch (this.state) {
                    case 0:
                        if (this.top0().call_method(this.vm, '__bool__')) {
                            this.state = 1;
                            this.position--;
                            break;
                        }
                    case 1:
                        if (this.vm.except(MethodNotFoundError)) {
                            if (this.top0().call_method(this.vm, '__len__')) {
                                this.state = 2;
                                this.position--;
                            }
                        } else if (!this.vm.return_value) {
                            this.pop();
                            this.state = 0;
                            break;
                        }
                    case 2:
                        this.pop();
                        this.state = 0;
                        if (this.vm.except(MethodNotFoundError)) {
                            this.position = instruction.argument;
                            break;
                        }
                        if (this.vm.return_value) {
                            if (this.vm.return_value instanceof PyInt) {
                                if (this.vm.return_value.value) {
                                    this.position = instruction.argument;
                                }
                            } else {
                                this.vm.raise(TypeError, 'invalid result type of boolean conversion');
                            }
                        }
                        break;
                }
                break;
            case OPCODES.POP_JUMP_IF_FALSE:
                if (this.top0() instanceof PyInt) {
                    if (!this.pop().value) {
                        this.position = instruction.argument;
                    }
                    break;
                }
                switch (this.state) {
                    case 0:
                        if (this.top0().call_method(this.vm, '__bool__')) {
                            this.state = 1;
                            this.position--;
                            break;
                        }
                    case 1:
                        if (this.vm.except(MethodNotFoundError)) {
                            if (this.top0().call_method(this.vm, '__len__')) {
                                this.state = 2;
                                this.position--;
                            }
                        } else if (!this.vm.return_value) {
                            this.pop();
                            this.state = 0;
                            break;
                        }
                    case 2:
                        this.pop();
                        this.state = 0;
                        if (this.vm.except(MethodNotFoundError)) {
                            break;
                        }
                        if (this.vm.return_value) {
                            if (this.vm.return_value instanceof PyInt) {
                                if (!this.vm.return_value.value) {
                                    this.position = instruction.argument;
                                }
                            } else {
                                this.vm.raise(TypeError, 'invalid result type of boolean conversion');
                            }
                        }
                        break;
                }
                break;



            case OPCODES.LOAD_CONST:
                this.push(this.code.constants[instruction.argument]);
                break;

            case OPCODES.LOAD_NAME:
                name = this.code.names[instruction.argument];
                if (name in this.locals) {
                    this.push(this.locals[name]);
                } else if (name in this.globals) {
                    this.push(this.globals[name]);
                } else if (name in this.builtins) {
                    this.push(this.builtins[name]);
                } else {
                    throw new Error('[INVALID NAME] ' + name);
                }
                break;
            case OPCODES.LOAD_FAST:
                name = this.code.varnames[instruction.argument];
                if (name in this.locals) {
                    this.push(this.locals[name]);
                } else {
                    throw new Error('[INVALID NAME] ' + name);
                }
                break;
            case OPCODES.LOAD_GLOBAL:
                name = this.code.names[instruction.argument];
                if (name in this.globals) {
                    this.push(this.globals[name]);
                } else if (name in this.builtins) {
                    this.push(this.builtins[name]);
                } else {
                    throw new Error('[INVALID NAME] ' + name);
                }
                break;

            case OPCODES.STORE_NAME:
                name = this.code.names[instruction.argument];
                if (this.namespace) {
                    this.namespace.call_method(this.vm, '__setitem__', [name, this.pop()]);
                } else {
                    this.locals[name] = this.pop();
                }
                break;
            case OPCODES.STORE_FAST:
                if (this.namespace) {
                    console.log(this.namespace);
                }
                name = this.code.varnames[instruction.argument];
                this.locals[name] = this.pop();
                break;
            case OPCODES.STORE_GLOBAL:
                name = this.code.names[instruction.argument];
                this.globals[name] = this.pop();
                break;

            case OPCODES.CALL_FUNCTION:
                switch (this.state) {
                    case 0:
                        low = instruction.argument & 0xFF;
                        high = instruction.argument >> 8;
                        kwargs = {};
                        for (index = 0; index < high; index++) {
                            value = this.pop();
                            kwargs[this.pop().value] = value;
                        }
                        args = this.popn(low);
                        func = this.pop();
                        if (vm.call_object(func, args, kwargs)) {
                            this.state = 1;
                            this.position -= 3;
                            break;
                        }
                    case 1:
                        this.push(vm.return_value);
                        this.state = 0;
                        break;
                }
                break;

            case OPCODES.LOAD_BUILD_CLASS:
                this.push(build_class);
                break;

            case OPCODES.MAKE_FUNCTION:
                low = instruction.argument & 0xFF;
                mid = (instruction.argument >> 8) & 0xFF;
                high = (instruction.argument >> 16) & 0x7FFF;
                name = this.pop();
                code = this.pop();
                if (high) {
                    throw new Error('annotations not supported');
                }
                defaults = {};
                for (index = 0; index < mid; index++) {
                    value = this.pop();
                    defaults[this.pop().value] = value;
                }
                for (index = 0; index < low; index++) {
                    defaults[code.value.argnames[index]] = this.pop();
                }
                globals = this.globals;
                this.push(new PyObject(py_function, {
                    '__name__': name,
                    '__code__': code
                }));
                this.top0().defaults = defaults;
                break;

            case OPCODES.SETUP_LOOP:
            case OPCODES.SETUP_EXCEPT:
            case OPCODES.SETUP_FINALLY:
                type = OPCODES_EXTRA[instruction.opcode];
                this.push_block(type, instruction.argument + this.position);
                break;

            case OPCODES.END_FINALLY:
                this.unwind(this.vm.return_value === null ? UNWIND_CAUSES.EXCEPTION : UNWIND_CAUSES.RETURN);
                break;

            case OPCODES.POP_EXCEPT:
                block = this.blocks.pop();
                assert(block.type == BLOCK_TYPES.EXCEPT);
                this.vm.return_value = None;
                break;

            case OPCODES.COMPARE_OP:
                switch (instruction.argument) {
                    case COMPARE_OPS.EXC:
                        exc_type = this.pop();
                        console.log('comp-exc', this.top0(), exc_type);
                        console.log(this.stack);
                        this.push(this.pop().is_subclass_of(exc_type) ? True : False);
                        break;
                    default:
                        error('unknown comparison operator')
                }
                break;

            case OPCODES.JUMP_FORWARD:
                this.position += instruction.argument;
                break;

            case OPCODES.RAISE_VARARGS:
                if (instruction.argument != 1) {
                    throw new Error('invalid raise')
                }
                exc_type = this.pop();
                vm.last_exception = {exc_type: exc_type};
                this.action = ACTIONS.RAISE;
                this.unwind(vm);
                break;


            case OPCODES.LOAD_ATTR:
                switch (this.state) {
                    case 0:
                        if (this.top().call_method(this.vm, '__getattribute__')) {

                        }
                }
                break;

            case OPCODES.POP_BLOCK:
                this.blocks.pop();
                break;


            case OPCODES.RETURN_VALUE:
                vm.return_value = this.pop();
                //this.unwind(vm);
                vm.frame = this.back;
                break;

            default:
                console.error('[UNKNOWN OPCODE] ', instruction);
                throw new Error('[UNKNOWN OPCODE]');
        }
    };

    function NativeFrame(code, options) {
        options = options || {};

        Frame.call(this, code, options);

        this.store = options.store || {};
    }
    NativeFrame.prototype = new Frame;
    NativeFrame.prototype.step = function () {
        assert(!this.code.simple);
        var result = this.code.func(this.vm, this, this.args);
        if (result == undefined || result instanceof PyObject) {
            if (result instanceof PyObject) {
                vm.return_value = result;
            }
            vm.frame = this.back;
        } else {
            this.position = result;
            return true;
        }
    };


    function VM() {
        this.frame = null;

        this.return_value = None;
        this.last_exception = null;
    }
    VM.prototype.step = function () {
        this.frame.step();
    };
    VM.prototype.except = function (exc_type) {
        if (!this.return_value && this.last_exception.exc_type.is_subclass_of(exc_type)) {
            this.return_value = None;
            return true;
        }
        return false;
    };
    VM.prototype.raise = function (exc_type, exc_value, exc_tb) {
        if (typeof exc_value == 'string') {
            exc_value = new_exception(exc_type, new_str(exc_value));
        }
        if (this.return_value === null) {
            exc_value.dict.set('__context__', this.last_exception.exc_value);
        } else {
            this.return_value = null;
        }

        if (!exc_tb) {
            // TODO: create traceback
            console.log('error in line: ' + this.frame.get_line_number());
            exc_tb = None;
            exc_value.dict.set('__traceback__', exc_tb);
        }
        this.last_exception = {exc_type: exc_type, exc_value: exc_value, exc_tb: exc_tb};
    };
    VM.prototype.run = function (object, args, kwargs) {
        var old_frame = this.frame;
        if (object instanceof Frame) {
            this.frame = object;
        } else if (object instanceof PyCode) {
            this.frame = new PythonFrame(object.value, {
                vm: this, builtins: builtins,
                globals: {'__name__': new_str('__main__')}
            })
        } else {
            error('object is not runnable');
        }
        while (this.frame) {
            this.frame.step();
        }
        this.frame = old_frame;
    };
    VM.prototype.call_object = function (object, args, kwargs, defaults) {
        var code, result, frame, vm = this;
        while (true) {
            if (object instanceof PythonCode) {
                this.frame = new PythonFrame(object, {
                    vm: vm, back: vm.frame, defaults: defaults,
                    args: args, kwargs: kwargs
                });
                return true;
            } else if (object instanceof NativeCode) {
                if (object.simple) {
                    try {
                        result = object.func(object.parse_args(args, kwargs, defaults));
                        vm.return_value = result || None;
                    } catch (error) {
                        if (error instanceof PyObject) {
                            vm.raise(error.cls, error);
                        } else {
                            throw error;
                        }
                    }
                    return false;
                } else {
                    this.frame = frame = new NativeFrame(object, {
                        vm: vm, back: vm.frame, defaults: defaults,
                        args: args, kwargs: kwargs
                    });
                    try {
                        result = object.func(vm, vm.frame, vm.frame.args);
                        if (result == undefined || result instanceof PyObject) {
                            if (result instanceof PyObject) {
                                vm.return_value = result;
                            }
                            vm.frame = frame.back;
                            return false;
                        } else {
                            frame.position = result;
                            return true;
                        }
                    } catch (error) {
                        if (error instanceof PyObject) {
                            vm.raise(error.cls, error);
                            return false;
                        } else {
                            throw error;
                        }
                    }
                }
            } else if (object.cls === py_function) {
                code = object.dict['__code__'];
                if (code.cls === py_code) {
                    defaults = object.defaults;
                    object = code.value;
                } else {
                    this.raise(TypeError, 'invalid type of function code')
                }
            } else if (object instanceof PyObject) {
                console.log(object);
                return object.call_method(this, '__call__', args, kwargs);
            } else {
                error('invalid callable');
            }
        }
    };


    function new_native(func, signature, options) {
        var code = new NativeCode(func, options, signature);
        func = new PyObject(py_function, {
            '__name__': new_str(options.name || '<unkown>'),
            '__qualname__': new_str(options.qualname || '<unkown>'),
            '__doc__': new_str(options.doc || ''),
            '__module__': options.module ? new_str(options.module) : None,
            '__code__': new_code(code)
        });
        func.defaults = options.defaults;
        return func;
    }



















    {
        py_type.define_method('__new__', function (args) {
            if (!(args['mcs'] instanceof PyType)) {
                raise(TypeError, 'invalid type of "mcs" argument');
            }
            if (!(args['name'] instanceof PyStr)) {
                raise(TypeError, 'invalid type of "name" argument');
            }
            if (!(args['bases'] instanceof PyTuple)) {
                raise(TypeError, 'invalid type of "bases" argument');
            }
            if (!(args['attributes'] instanceof PyDict)) {
                raise(TypeError, 'invalid type of "attributes" argument')
            }
            var name = args['name'].value;
            var bases = args['bases'].value;
            return new PyType(name, bases, args['attributes'], args['mcs']);
        }, ['mcs', 'name', 'bases', 'attributes'], {
            simple: true
        });
    }

    py_type.define_method('__call__', function (vm, frame, args) {
        switch (frame.position) {
            case 0:
                if (args['cls'].call_classmethod(vm, '__new__', args['var_args'], args['var_kwargs'])) {
                    return 1;
                }
            case 1:
                if (!vm.return_value) {
                    return null;
                }
                frame.store['instance'] = vm.return_value;
                if (frame.store['instance'].call_method(vm, '__init__', args['var_args'], args['var_kwargs'])) {
                    return 2;
                }
            case 2:
                return frame.store['instance'];
        }
    }, ['cls', 'var_args', 'var_kwargs'], {
        flags: CODE_FLAGS.VAR_ARGS | CODE_FLAGS.VAR_KWARGS
    });
    py_type.define_method('__str__', function (args) {
        var module = args.cls.dict.get('__module__');
        if (module instanceof PyStr) {
            return new_str('<class \'' + module.value + '.' + args.cls.name + '\'>');
        } else {
            return new_str('<class \'' + args.cls.name + '\'>');
        }
    }, ['cls'], {simple: true});


    py_object.define_method('__new__', function (args) {
        if (!(args.cls instanceof PyType)) {
            raise(TypeError, 'object.__new__(X): X is not a type object');
        }
        if (args.cls.native !== py_object) {
            raise(TypeError, 'object.__new__() is not safe, use ' + args.cls.native.cls + '.__new__()');
        }
        return new PyObject(args.cls);
    }, ['cls', 'var_args', 'var_kwargs'], {
        flags: CODE_FLAGS.VAR_ARGS | CODE_FLAGS.VAR_KWARGS,
        simple: true
    });
    py_object.define_method('__init__', function (vm, frame, args) {

    }, ['self']);
    py_object.define_method('__getattribute__', function (vm, frame, args) {
        switch (frame.position) {
            case 0:
                if (!(args.name instanceof PyStr)) {
                    raise(TypeError, 'invalid type of \'name\' argument');
                }
                var value = args.self.dict.get(args.name);
                if (value) {
                    // TODO: bind if necessary
                    return value;
                } else {
                    raise(AttributeError, '\'' + args.self.cls.name + '\' has no attribute \'' + args.name.value + '\'');
                }
        }
    }, ['self', 'name']);

    py_object.define_method('__str__', function (args) {
        var module = args.self.cls.dict.get('__module__');
        var address = ('0000000000000' + args.self.get_id().toString(16)).substr(-13);
        if (module instanceof PyStr) {
            return new_str('<' + module.value + '.' + args.self.cls.name + ' object at 0x' + address + '>');
        } else {
            return new_str('<' + args.self.cls.name + ' object at 0x' + address +'>');
        }
    }, ['self'], {simple: true});

    None.cls.define_method('__new__', function (args) {
        return None;
    }, ['self'], {simple: true});

    None.cls.define_method('__str__', function () {
        return new_str('None');
    }, ['self'], {simple: true});


    //py_function.define_method('__str__', )


    var getattr = new_native(function (vm, frame, args) {
        var slot;
        while (true) {
            switch (frame.position) {
                case 0:
                    slot = args.object.cls.lookup('__getattribute__');
                    if (vm.c(slot, [args.object, args.name])) {
                        return 1;
                    }
                case 1:
                    if (vm.except(AttributeError)) {
                        slot = args.object.cls.lookup('__getattr__');
                        if (vm.c(slot, [args.object, args.name])) {
                            return 2;
                        }
                    } else {
                        return -1;
                    }
                case 2:
                    if (args.fallback && vm.except(AttributeError)) {
                        vm.return_value = args.fallback;
                    }
                    return -1;
            }
        }
    }, ['object', 'name', 'fallback'], {
        name: 'getattr',
        module: 'builtins',
        defaults: {fallback: null}
    });

    var print = new_native(function (vm, frame, args) {
        var slot, object;
        while (true) {
            switch (frame.position) {
                case 0:
                    frame.store.strings = [];
                    frame.store.index = 0;
                    if (args.objects.length) {
                        object = args.objects[0];
                        if (object.cls == py_str) {
                            vm.return_value = object;
                        } else {
                            if (object.call_method(vm, '__str__')) return 1;
                        }
                        frame.position = 1;
                    } else {
                        frame.position = 2;
                        break;
                    }
                case 1:
                    if (!vm.return_value) return -1;
                    if (!(vm.return_value.cls == py_str)) {
                        raise(TypeError, '__str__ should return a string');
                    }
                    frame.store.strings.push(vm.return_value.value);
                    frame.store.index++;
                    if (frame.store.index < args.objects.length) {
                        object = args.objects[frame.store.index];
                        if (object.cls == py_str) {
                            vm.return_value = object;
                        } else {
                            slot = object.cls.lookup('__str__');
                            if (vm.c(slot, [object])) return 1;
                        }
                        break;
                    }
                case 2:
                    if (args.sep.cls == py_str) {
                        vm.return_value = args.sep;
                    } else {
                        slot = args.sep.cls.lookup('__str__');
                        if (vm.c(slot, [args.sep])) return 3;
                    }
                case 3:
                    if (!vm.return_value) return -1;
                    if (!(vm.return_value.cls == py_str)) {
                        raise(TypeError, '__str__ should return a string');
                    }
                    console.log(frame.store.strings.join(vm.return_value.value));
                    return None;
            }
        }
    }, ['sep', 'end', 'file', 'flush', 'objects'], {
        name: 'print',
        module: 'builtins',
        flags: CODE_FLAGS.VAR_ARGS,
        kwargcount: 4,
        defaults: {sep: new_str(' '), end: new_str('\n'), file: None, flush: False}
    });


    py_int.define_method('__neg__', function (vm, frame, args) {
        if (!args.self.is_instance_of(py_int)) {
            raise(TypeError, 'invalid operand type');
        }
        return new_int(-args.self.value)
    }, ['self']);
    py_int.define_method('__str__', function (vm, frame, args) {
        if (!(args.self instanceof PyInt)) {
            raise(TypeError, 'invalid type');
        }
        return new_str(args.self.value.toString());
    }, ['self']);

    py_int.define_method('__add__', function (args) {
        if (!(args.self instanceof PyInt)) {
            return NotImplemented;
        }
        if (!(args.other instanceof PyInt)) {
            return NotImplemented;
        }
        return new_int(args.self.value + args.other.value);
    }, ['self', 'other'], {simple: true});
    py_int.dict.set('__iadd__', py_int.dict.get('__add__'));

    py_int.define_method('__sub__', function (args) {
        if (!(args.self instanceof PyInt)) {
            return NotImplemented;
        }
        if (!(args.other instanceof PyInt)) {
            return NotImplemented;
        }
        return new_int(args.self.value - args.other.value);
    }, ['self', 'other'], {simple: true});
    py_int.dict.set('__isub__', py_int.dict.get('__sub__'));


    py_str.define_method('__add__', function (args) {
        if (!(args.self instanceof PyStr)) {
            return NotImplemented;
        }
        if (!(args.other instanceof PyStr)) {
            return NotImplemented;
        }
        return new_str(args.self.value + args.other.value);
    }, ['self', 'other'], {simple: true});
    py_str.define_method('__hash__', function (args) {
        return args.self;
    }, ['self'], {simple: true});

    py_dict.define_method('__setitem__', function (vm, frame, args) {
        console.log(args);
        switch (frame.position) {
            case 0:
                if (typeof args.key == 'string') {
                    vm.return_value = args.key;
                } else if (args.key.c(vm, '__hash__')) {
                    return 1;
                }
            case 1:
                // TODO: fixme
                args.self.set(vm.return_value, args.value);
                return None;
        }
    }, ['self', 'key', 'value']);




    var build_class = new_native(function (vm, frame, args) {
        switch (frame.position) {
            case 0:
                frame.store.namespace = new PyDict();
                assert(vm.call_object(args.func));
                vm.frame.namespace = frame.store.namespace;
                return 1;
            case 1:
                console.log(frame.store.namespace);
                // FIXME: implement this the right way
                var cls = new PyType(args.name.value, [py_object], frame.store.namespace, py_type);
                console.log(cls);
                return cls;
                console.log(args);
                return None;
        }
    }, ['func', 'name', 'metaclass', 'bases', 'keywords'], {
        name: '__build_class__',
        flags: CODE_FLAGS.VAR_ARGS | CODE_FLAGS.VAR_KWARGS,
        kwargcount: 1,
        defaults: {'metaclass': None}
    });


    var get_by_id = new_native(function (args) {
        frame.store.temp = document.getElementById(args.name.value);
        return None;
    }, ['name'], {
        name: 'get_by_id',
        simple: true
    });

    var builtins = {
        'print': print,
        'get_by_id': get_by_id,

        'type': py_type,
        'int': py_int,

        'TypeError': TypeError,
        'AttributeError': AttributeError
    };







    return {
        'PyObject': PyObject,
        'PyType': PyType,
        'PyDict': PyDict,
        'PyInt': PyInt,
        'PyFloat': PyFloat,
        'PyStr': PyStr,
        'PyBytes': PyBytes,
        'PyTuple': PyTuple,
        'PyCode': PyCode,

        'py_object': py_object,
        'py_type': py_type,
        'py_dict': py_dict,
        'py_int': py_int,
        'py_bool': py_bool,
        'py_float': py_float,
        'py_str': py_str,
        'py_bytes': py_bytes,
        'py_tuple': py_tuple,
        'py_code': py_code,
        'py_list': py_list,
        'py_set': py_set,
        'py_function': py_function,
        'py_method': py_method,
        'py_generator': py_generator,
        'py_frame': py_frame,
        'py_traceback': py_traceback,
        'py_module': py_module,

        'new_int': new_int,
        'new_float': new_float,
        'new_str': new_str,
        'new_bytes': new_bytes,
        'new_tuple': new_tuple,
        'new_code': new_code,

        'None': None,
        'NotImplemented': NotImplemented,
        'Ellipsis': Ellipsis,
        'False': False,
        'True': True,

        'BaseException': BaseException,
        'Exception': Exception,
        'AttributeError': AttributeError,
        'TypeError': TypeError,





        'print': print,

        'PythonCode': PythonCode,
        'NativeCode': NativeCode,

        'VM': VM
    }
})();
