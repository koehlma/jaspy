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
        map[OPCODES.UNARY_POSITIVE] = 'pos';
        map[OPCODES.UNARY_NEGATIVE] = 'neg';
        map[OPCODES.UNARY_NOT] = 'not';
        map[OPCODES.UNARY_INVERT] = 'invert';
        map[OPCODES.GET_ITER] = 'iter';

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

        map[OPCODES.INPLACE_POWER] = 'ipow';
        map[OPCODES.INPLACE_MULTIPLY] = 'imul';
        map[OPCODES.INPLACE_MATRIX_MULTIPLY] = 'imatmul';
        map[OPCODES.INPLACE_FLOOR_DIVIDE] = 'ifloordiv';
        map[OPCODES.INPLACE_TRUE_DIVIDE] = 'itruediv';
        map[OPCODES.INPLACE_MODULO] = 'imod';
        map[OPCODES.INPLACE_ADD] = 'iadd';
        map[OPCODES.INPLACE_SUBTRACT] = 'isub';
        map[OPCODES.INPLACE_LSHIFT] = 'ilshift';
        map[OPCODES.INPLACE_RSHIFT] = 'irshift';
        map[OPCODES.INPLACE_AND] = 'iand';
        map[OPCODES.INPLACE_XOR] = 'ixor';
        map[OPCODES.INPLACE_OR] = 'ior';
        map[OPCODES.STORE_SUBSCR] = 'setitem';
        map[OPCODES.DELETE_SUBSCR] = 'delitem';

        map[OPCODES.SETUP_LOOP] = BLOCK_TYPES.LOOP;
        map[OPCODES.SETUP_EXCEPT] = BLOCK_TYPES.EXCEPT;
        map[OPCODES.SETUP_FINALLY] = BLOCK_TYPES.FINALLY;

        return map;
    })();
    var OPCODES_ARGUMENT = 90;


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


    function ArrayList() {
        this.array = new Array(4);
        this.size = 0;
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

    function PyObject(cls, dict) {
        this.cls = cls;
        this.dict = dict || null;
    }
    PyObject.prototype.is_instance_of = function (cls) {
        return this.cls.is_subclass_of(cls);
    };
    PyObject.prototype.c = function (vm, name, args, kwargs) {
        return vm.c(this.cls.lookup(name), [this].concat(args || []), kwargs)
    };
    PyObject.prototype.call_method = function (vm, name, args, kwargs) {
        return vm.call_object(this.cls.lookup(name), [this].concat(args || []), kwargs);
    };

    function PyType(name, bases, attributes, mcs) {
        var index, builtin;
        PyObject.call(this, mcs || py_type, attributes || new PyDict());
        this.name = name;
        this.bases = bases || [py_object];
        this.mro = compute_mro(this);
        this.builtin = null;
        for (index = 0; index < this.mro.length; index++) {
            builtin = this.mro[index].builtin;
            if (builtin === py_object) {
                continue;
            }
            if (this.builtin && this.builtin !== builtin && builtin) {
                raise(TypeError, 'invalid builtin type hierarchy');
            }
            this.builtin = builtin;
        }
    }
    PyType.prototype = new PyObject;
    PyType.prototype.lookup = function (name) {
        var index, value;
        for (index = 0; index < this.mro.length; index++) {
            value = this.mro[index].dict.get(name);
            if (value) {
                return value;
            }
        }
    };
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
        return vm.call_object(this.lookup(name), [this].concat(args || []), kwargs);
    };
    PyType.prototype.call_staticmethod = function (vm, name, args, kwargs) {
        return vm.call_object(this.lookup(name), args, kwargs);
    };

    function PyDict(cls) {
        PyObject.call(this, cls || py_dict);
        this.table = {};
    }
    PyDict.prototype = new PyObject;
    PyDict.prototype.get = function (key) {
        var current;
        if (key instanceof PyStr) {
            key = key.value;
        } else if (typeof key != 'string') {
            raise(TypeError, 'invalid primitive key type');
        }
        current = this.table[key];
        while (current) {
            if (current.key.value == key) {
                return current.value;
            }
            current = current.next;
        }
    };
    PyDict.prototype.set = function (key, value) {
        var current;
        if (typeof key == 'string') {
            key = new_str(key);
        } else if (!(key instanceof PyStr)) {
            raise(TypeError, 'invalid primitive key type');
        }
        if (key in this.table) {
            current = this.table[key];
            while (current) {
                if (current.key.value == key.value) {
                    current.value = value;
                    return;
                }
            }
        }
        this.table[key.value] = {key: key, value: value, next: this.table[key]}
    };

    function new_builtin_type(name, bases, attributes, mcs) {
        var type = new PyType(name, bases, attributes, mcs);
        type.builtin = type;
        return type;
    }

    var py_object = new_builtin_type('object', []);
    var py_type = new_builtin_type('type', [py_object]);
    var py_dict = new_builtin_type('dict', [py_object]);

    py_object.cls = py_type.cls = py_dict.cls = py_type;
    py_object.dict.cls = py_type.dict.cls = py_dict.dict.cls = py_dict;

    var py_int = new_builtin_type('int');
    var py_bool = new_builtin_type('bool', [py_int]);

    var py_float = new_builtin_type('float');

    var py_str = new_builtin_type('str');
    var py_bytes = new_builtin_type('bytes');

    var py_tuple = new_builtin_type('tuple');

    var py_code = new_builtin_type('code');

    var py_list = new_builtin_type('list');
    var py_set = new_builtin_type('set');

    var py_function = new_builtin_type('function');
    var py_method = new_builtin_type('method');
    var py_generator = new_builtin_type('generator');

    var py_frame = new_builtin_type('frame');
    var py_traceback = new_builtin_type('traceback');

    var py_module = new_builtin_type('ModuleType');


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


    var None = new PyObject(new_builtin_type('NoneType'));
    var NotImplemented = new PyObject(new_builtin_type('NotImplemented'));
    var Ellipsis = new PyObject(new_builtin_type('Ellipsis'));

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

    var AttributeError = new PyType('AttributeError', [Exception]);
    var TypeError = new PyType('TypeError', [Exception]);


    function new_exception(cls, message) {
        var exc_value = new PyObject(cls, new PyDict());
        exc_value.dict.set('args', new_tuple([new_str(message)]));
        return exc_value;
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
                raise(TypeError, 'missing required positional argument');
            }
            if (name in kwargs) {
                raise(TypeError, 'got multiple values for argument');
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
                raise(TypeError, 'missing required keyword argument ' + name);
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
    PythonFrame.prototype.unwind = function () {
        while (this.blocks.length > 0) {
            var block = this.block();
            if (block.running) {
                this.blocks.pop();
                continue;
            }
            switch (this.action) {
                case ACTIONS.RAISE:
                    if (block.kind == BLOCK_KINDS.EXCEPT || block.kind == BLOCK_KINDS.FINALLY) {
                        this.position = block.position;
                        block.running = true;
                        return;
                    } else {
                        this.blocks.pop()
                    }
                    break;
                case ACTIONS.RETURN:
                    if (block.kind == BLOCK_KINDS.FINALLY) {
                        this.position = block.position;
                        block.running = true;
                        return;
                    } else if (block.kind == BLOCK_KINDS.BASE) {
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
        var head, right, left, kwargs, args, kind, block;
        var exc_type, exc_traceback, exc_value;
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
                this.popn(this.top0());
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
                        slot = OPCODES_EXTRA[instruction.opcode];
                        top = this.pop();
                        if (func) {
                            if (top.call_method(this.vm, slot)) {
                                this.state++;
                                this.position--;
                                break;
                            }
                        } else {
                            this.vm.raise(TypeError, 'unsupported operand type');
                            break;
                        }
                    case 1:
                        this.state = 0;
                        if (vm.return_value) {
                            this.push(vm.return_value);
                        } else {
                            error('exception raised');
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
                    this.namespace.c(this.vm, '__setitem__', [name, this.pop()]);
                    console.log(this.namespace);
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
                        if (vm.c(func, args, kwargs)) {
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
                kind = OPCODE_MAP[instruction.opcode];
                this.blocks.push(new Block(kind, instruction.argument + this.position));
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


            case OPCODES.POP_BLOCK:
                this.blocks.pop();
                break;
            case OPCODES.POP_EXCEPT:
                block = this.blocks.pop();
                assert(block.kind == BLOCK_KINDS.EXCEPT);
                this.action = ACTIONS.RUN;
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
        var result = this.code.func(this.vm, this, this.args);
        if (result < 0 || result instanceof PyObject) {
            if (result instanceof PyObject) {
                vm.return_value = result;
            }
            vm.frame = this.back;
        } else {
            this.position = result;
            return true;
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

    py_type.define_method('__call__', function (vm, frame, args) {
        switch (frame.position) {
            case 0:
                if (vm.c(args['cls'].lookup('__new__'), args['var_args'], args['var_kwargs'])) {
                    return 1;
                }
            case 1:
                if (!vm.return_value) {
                    return -1
                }
                frame.store['instance'] = vm.return_value;
                if (frame.store['instance'].c(vm, '__init__', args['var_args'], args['var_kwargs'])) {
                    return 2;
                }
            case 2:
                return frame.store['instance'];
        }
    }, ['cls', 'var_args', 'var_kwargs'], {
        flags: CODE_FLAGS.VAR_ARGS | CODE_FLAGS.VAR_KWARGS
    });


    py_object.define_method('__new__', function (args) {
        if (!(args.cls instanceof PyType)) {
            raise(TypeError, 'object.__new__(X): X is not a type object');
        }
        if (args.cls.builtin !== py_object) {
            raise(TypeError, 'object.__new__() is not safe, use ' + args.cls.builtin.cls + '.__new__()');
        }
        return new PyObject(args.cls);
    }, ['cls', 'var_args', 'var_kwargs'], {
        flags: CODE_FLAGS.VAR_ARGS | CODE_FLAGS.VAR_KWARGS,
        simple: true
    });
    py_object.define_method('__init__', function (vm, frame, self) {

    }, ['self']);

    None.cls.define_method('__new__', function (args) {
        return None;
    }, ['self'], {simple: true});

    None.cls.define_method('__str__', function () {
        return new_str('None');
    }, ['self'], {simple: true});



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
                            slot = object.cls.lookup('__str__');
                            if (vm.c(slot, [object])) return 1;
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


    function VM() {
        this.frame = null;

        this.return_value = None;
        this.last_exception = null;
    }
    VM.prototype.step = function () {
        this.frame.step();
    };
    VM.prototype.except = function (exc_type) {
        var is_subclass = this.last_exception.exc_type.is_subclass_of(exc_type);
        if (!this.return_value && is_subclass) {
            this.return_value = None;
            return true;
        }
        return false;
    };
    VM.prototype.raise = function (exc_type, exc_value, exc_tb) {
        this.return_value = null;
        if (typeof exc_value == 'string') {
            exc_value = new_exception(exc_type, new_str(exc_value));
        }
        if (!exc_tb) {
            // TODO: create traceback
            exc_tb = None;
        }
        this.last_exception = {exc_type: exc_type, exc_value: exc_value, exc_tb: exc_tb};
    };
    VM.prototype.run = function () {
        while (this.frame) {
            this.frame.step();
        }
    };
    VM.prototype.run_code = function (code) {
        this.frame = new PythonFrame(code.value, {
            vm: this, builtins: builtins,
            globals: {'__name__': new_str('__main__')}
        });
    };
    VM.prototype.call_object = VM.prototype.c = function (object, args, kwargs, defaults) {
        var code, result, frame;
        try {
            while (true) {
                if (object instanceof PythonCode) {
                    this.frame = new PythonFrame(object, {
                        vm: this, back: this.frame, defaults: defaults,
                        args: args, kwargs: kwargs
                    });
                    return true;
                } else if (object instanceof NativeCode) {
                    if (object.simple) {
                        result = object.func(object.parse_args(args, kwargs, defaults));
                        vm.return_value = result || None;
                        return false;
                    } else {
                        this.frame = frame = new NativeFrame(object, {
                            vm: this, back: this.frame, defaults: defaults,
                            args: args, kwargs: kwargs
                        });
                        result = object.func(this, this.frame, this.frame.args);
                        if (result < 0 || result instanceof PyObject) {
                            if (result instanceof PyObject) {
                                this.return_value = result;
                            }
                            this.frame = frame.back;
                            return false;
                        } else {
                            frame.position = result;
                            return true;
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
                } else {
                    error('invalid callable');
                }
            }
        } catch (error) {
            if (error instanceof PyObject) {
                this.raise(error.cls, error);
                return false;
            }
            throw error;
        }
    };

    var build_class = new_native(function (vm, frame, args) {
        switch (frame.position) {
            case 0:
                frame.store.namespace = new PyDict();
                assert(vm.c(args.func));
                vm.frame.namespace = frame.store.namespace;
                return 1;
            case 1:
                console.log(frame.store.namespace);
                error('jo');
                console.log(args);
                return None;
        }
    }, ['func', 'name', 'metaclass', 'bases', 'keywords'], {
        name: '__build_class__',
        flags: CODE_FLAGS.VAR_ARGS | CODE_FLAGS.VAR_KWARGS,
        kwargcount: 1,
        defaults: {metaclass: None}
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
        'get_by_id': get_by_id
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
