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
            throw new exc_type.create([new_str(message)]);
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



    /*





    /* constants */
    const DEBUG = true;

    const CODE_FLAGS = {
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
    const BLOCK_TYPES = {
        BASE: 0,
        LOOP: 1,
        EXCEPT: 2,
        FINALLY: 3,
    };

    const OPCODES = {
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
    const OPCODES_EXTRA = (function () {
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
    const OPCODES_ARGUMENT = 90;

    const CONTEXTS = {
        RUN: 0,
        RAISE: 1
    };



    /* virtual machine */
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

        this.extended = options.extended || false;
    }
    NativeCode.prototype = new Code;
    NativeCode.prototype.get_line_number = function (position) {
        return position;
    };
    NativeCode.prototype.execute = function (args, kwargs, defaults, vm) {
        if (this.extended) {
            return this.func(this, vm, null, this.parse_args(args, kwargs, defaults));
        } else {
            return this.func(this.parse_args(args, kwargs, defaults));
        }
    };

    function Frame(code, options) {
        this.code = code;

        options = options || {};

        this.back = options.back || null;

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
        this.globals = options.globals || (this.back ? this.back.globals : {});
        this.builtins = options.builtins || (this.back ? this.back.builtins : {});

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
                        slot = OPCODE_MAP[instruction.opcode];
                        top = this.pop();
                        func = top.lookup('__' + slot + '__');
                        if (!func) {
                            console.log(top);
                            throw new Error('[UNSUPPORTED OPERAND]');
                        }
                        vm.call_object(func, [top]);
                        this.state = 1;
                        this.position--;
                        break;
                    case 1:
                        this.push(vm.return_value);
                        this.state = 0;
                        console.log(vm.return_value);
                        break;
                }
                break;

            case OPCODES.GET_YIELD_FROM_ITER:
                // TODO: implement
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
                        slot = OPCODE_MAP[instruction.opcode];
                        left = this.top1();
                        right = this.top0();
                        func = left.lookup('__' + slot + '__');
                        if (func) {
                            vm.call_object(func, [left, right]);
                            this.state = 1;
                            this.position--;
                            break;
                        }
                        vm.return_value = NotImplemented;
                    case 1:
                        if (vm.return_value != NotImplemented) {
                            this.popn(2);
                            this.push(vm.return_value);
                            this.state = 0;
                            console.log(vm.return_value);
                            break;
                        }
                        slot = OPCODE_MAP[instruction.opcode];
                        left = this.top1();
                        right = this.top0();
                        func = right.lookup('__r' + slot + '__');
                        if (func) {
                            vm.call_object(func, [right, left]);
                            this.state = 2;
                            this.position--;
                            break;
                        } else {
                            throw new Error('[UNSUPPORTED OPERAND]');
                        }
                        break;
                    case 2:
                        if (vm.return_value != NotImplemented) {
                            this.popn(2);
                            this.push(vm.return_value);
                            this.state = 0;
                            break;
                        } else {
                            throw new Error('[UNSUPPORTED OPERAND]');
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
                slot = OPCODE_MAP[instruction.opcode];
                // TODO: implement
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
                    throw new Error('[INVALID NAME]');
                }
                break;
            case OPCODES.LOAD_FAST:
                name = this.code.varnames[instruction.argument];
                if (name in this.locals) {
                    this.push(this.locals[name]);
                } else {
                    throw new Error('[INVALID NAME]');
                }
                break;
            case OPCODES.LOAD_GLOBAL:
                name = this.code.names[instruction.argument];
                if (name in this.globals) {
                    this.push(this.globals[name]);
                } else if (name in this.builtins) {
                    this.push(this.builtins[name]);
                } else {
                    throw new Error('[INVALID NAME]');
                }
                break;

            case OPCODES.STORE_NAME:
                name = this.code.names[instruction.argument];
                this.locals[name] = this.pop();
                break;
            case OPCODES.STORE_FAST:
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
                        vm.call_object(func, args, kwargs);
                        this.state = 1;
                        this.position -= 3;
                        break;
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
                    defaults[code.co_varnames[index]] = this.pop();
                }
                globals = this.globals;
                this.push(new PyObject(py_function, {
                    '__name__': name,
                    '__code__': code
                }));
                /*this.frame.push(new Function(name.value, code, {
                    defaults: defaults,
                    globals: globals
                }));*/
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
                this.action = ACTIONS.RETURN;
                this.unwind(vm);
                break;

            default:
                console.error('[UNKNOWN OPCODE] ', instruction);
                throw new Error('[UNKNOWN OPCODE]');
        }
    };


    function NativeFrame() {

    }
    NativeFrame.prototype = new Frame;
    NativeFrame.prototype.step = function () {

    };

    function VM() {
        this.frame = null;

        this.return_value = null;
        this.last_exception = null;
    }
    VM.prototype.step = function () {
        this.frame.step();
    };
    VM.prototype.run = function () {
        while (this.frame) {
            this.frame.step();
        }
    };
    VM.prototype.call_object = function (object, args, kwargs, defaults) {
        var code, slot;
        if (object instanceof PythonCode) {
            return this.new_frame(object, args, kwargs, defaults);
        } else if (object instanceof NativeCode) {
            this.return_value = object.execute(args, kwargs, defaults, this) || None;
        } else if (object instanceof PyObject) {
            if (object.cls == py_function) {
                code = object.dict['__code__'];
                return this.call_object(code, args, kwargs, object.defaults);
            } else if (object.cls == py_code) {
                return this.call_object(object.value, args, kwargs, defaults);
            } else {
                slot = object.cls.lookup('__call__');
                if (slot) {
                    args = [object].concat(args)
                    return this.call_object(slot, args, kwargs, defaults);
                } else {
                    raise(TypeError, object.cls.name + ' object is not callable');
                }
            }
        } else {
            raise(TypeError, 'object is not callable');
        }
    };
    VM.prototype.new_frame = function (code, args, kwargs, defaults) {
        var options = {
            back: this.frame, args: args, kwargs: kwargs,
            defaults: defaults, vm: this
        };
        if (code instanceof PythonCode) {
            this.frame = new PythonFrame(code, options);
        } else if (code instanceof NativeCode) {
            this.frame = new NativeFrame(code, options);
        } else {
            error('invalid type of code object for new frame');
        }
        return this.frame;
    };

    /**
     * Try to directly call an object. This will not
     */
    VM.prototype.direct_call = function (object, args, kwargs) {
        var callable = unpack_code(object), result;
        if (callable.code instanceof PythonCode) {
            this.frame = this.new_frame(callable.code, args, kwargs, callable.defaults);
            return this.frame;
        } else if (callable.code instanceof NativeCode) {
            result = callable.code.func(this, null,  callable.code.parse_args(callable))
        }
    };
    VM.prototype.call = function (object, name, args, kwargs) {

    };
    VM.prototype.getattr = function (object, name) {

    };


    function unpack_code(object, defaults) {
        while (true) {
            if (object instanceof Code) {
                return {code: object, defaults: defaults};
            } else if (object.cls === py_function) {
                object = object.dict['__code__'];
                defaults = object.defaults;
            } else if (object.cls === py_code) {
                object = object.value;
            } else {
                return null;
            }
        }
    }

    /***********************************************************************************
     * Python Object Model
     ***********************************************************************************/

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
                throw new Error('unable to linearize class hierarchy');
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

    function PyObject(cls, dict, value) {
        this.cls = cls;
        this.dict = dict || {};
        this.id = null;
        this.value = value || null;
    }
    PyObject.prototype.get_id = function () {
        if (this.id == null) {
            this.id = object_id_counter++;
        }
        return this.id;
    };

    function PyType(name, bases, attributes, module, mcs, unsafe) {
        PyObject.call(this, mcs == undefined ? py_type : mcs, attributes);
        this.name = name;
        this.bases = bases || [py_object];
        this.module = module || '__builtin__';
        this.unsafe = unsafe;
        this.mro = compute_mro(this);
    }
    PyType.prototype = new PyObject;
    PyType.prototype.lookup = function (name) {
        var index, cls;
        for (index = 0; index < this.mro.length; index++) {
            cls = this.mro[index];
            if (name in cls.dict) {
                return cls.dict[name];
            }
        }
        return null;
    };
    PyType.prototype.make = function (value, cls) {
        var instance = new PyObject(cls || this);
        if (value) instance.value = value;
        return instance;
    };
    PyType.prototype.define = function (name, func, signature, options) {
        options = options || {};
        options.module = this.module;
        options.name = name;
        options.qualname = this.name + '.' + name;
        this.dict[name] = make_function(func, signature, options);
    };
    PyType.prototype.create = function (args, kwargs) {
        var code_new = this.lookup('__new__').dict['__code__'].value;
        var code_init = this.lookup('__init__').dict['__code__'].value;
        assert(code_new instanceof NativeCode);
        assert(code_init instanceof NativeCode);
        assert(!(code_new.extended));
        assert(!(code_init.extended));
        args = args || [];
        kwargs = kwargs || {};
        var self = code_new.func(code_new.parse_args([this].concat(args), kwargs));
        code_init.func(code_init.parse_args([self].concat(args), kwargs));
        return self;
    };


    var py_object = new PyType('object', [], {}, '__builtin__', null);
    var py_type = new PyType('type', [py_object], {}, '__builtin__', null, true);
    py_object.cls = py_type;
    py_type.cls = py_type;


    function new_type(name, unsafe, bases, attributes, module, mcs) {
        bases = bases || [];
        bases.push(py_object);
        return new PyType(name, bases, attributes, module, mcs, unsafe);
    }


    var None = new PyObject(new_type('NoneType', true));
    var NotImplemented = new PyObject(new_type('NotImplementedType', true));
    var Ellipsis = new PyObject(new_type('Ellipsis', true));

    var py_int = new_type('int', true);
    var py_float = new_type('float', true);

    var py_bool = new_type('bool', true, [py_int]);
    var True = py_int.make(1, py_bool);
    var False = py_int.make(0, py_bool);

    var py_str = new_type('str', true);
    var py_bytes = new_type('bytes', true);

    var py_tuple = new_type('tuple', true);

    var py_code = new_type('code', true);

    var py_function = new_type('function');
    var py_method = new_type('method');
    var py_generator = new_type('generator');

    var py_module = new_type('ModuleType');

    var py_slice = new_type('slice');

    var py_staticmethod = new_type('staticmethod');
    var py_classmethod = new_type('classmethod');

    var py_frame = new_type('frame');
    var py_traceback = new_type('traceback');


    var dict_t = new_type('dict');


    py_object.define('__getattribute__', function (vm, frame, args) {
        if (args.self.dict.has(args.name)) {
            vm.return_value = args.self.dict.get(args.name);
        } else {
            vm.last_exception =
        }
        return false;
    }, ['self', 'name']);




    function Dict() {
        PyObject.call(py_dict);
        this.mapping = {};
    }
    Dict.prototype.primitive_set = function (key, value) {
        if (typeof key == 'string') {
            key = new_str(key);
        }
        assert(key.cls === py_str);
        var current;
        if (key.value in this.mapping) {
            current = this.mapping[key.value];
            while (true) {
                if (current.key.value == key.value) {
                    current.value = value;
                    return;
                } else if (!current.next) {
                    current.next = {key: key, value: value};
                    return;
                } else {
                    current = current.next
                }
            }
        } else {
            this.mapping[key.value] = {key: key, value: value};
        }
    };
    Dict.prototype.primitive_get = function (key) {
        if (key.cls === py_str) {
            key = key.value;
        } else if (typeof key != 'string') {
            raise(TypeError, 'invalid type of primitive key');
        }
        var current = this.mapping[key];
        while (current) {
            if (current.key.value == key) {
                return current.value;
            }
            current = current.next;
        }
    };


    function new_int(value) {
        return new PyObject(py_int, value);
    }
    function new_float(value) {
        return new PyObject(py_float, value);
    }
    function new_str(value) {
        return new PyObject(py_str, {}, value);
    }
    function new_bytes(value) {
        return new PyObject(py_bytes, {}, value);
    }
    function new_tuple(value) {
        return new PyObject(py_tuple, {}, value);
    }
    function new_code(value) {
        return new PyObject(py_code, {}, value);
    }


    function make_function(func, signature, options) {
        var code = new NativeCode(func, options, signature);
        var func = new PyObject(py_function, {
            '__name__': new_str(options.name || '<unkown>'),
            '__qualname__': new_str(options.qualname || '<unkown>'),
            '__doc__': new_str(options.doc || ''),
            '__module__': options.module ? new_str(options.module) : None,
            '__code__': new_code(code)
        });
        func.defaults = options.defaults;
        return func;
    }


    var special_lookup = make_function(function (vm, frame, args) {
       switch (frame.state) {

       }
    });



    var eq = make_function(function (vm, frame, args) {
        switch (frame.state) {
            case 0:
                if (vm.native_call(getattr, [args.left, '__eq__'])) return 1;
            case 1:

        }
    }, ['left', 'right']);


    py_object.define('__new__', function (args) {
        if (!(args.cls instanceof PyType)) {
            raise(TypeError, 'object.__new__(X): X is not a type object');
        }
        if (args.cls.unsafe) {
            var msg = 'object.__new__() is not safe, use ' + args.cls.name + '.__new__()';
            raise(TypeError, msg);
        }
        return new PyObject(args.cls);
    }, ['cls', 'var_args', 'var_kwargs'], {
       flags: CODE_FLAGS.VAR_ARGS | CODE_FLAGS.VAR_KWARGS
    });
    py_object.define('__init__', function (self) {

    }, ['self']);
    py_object.define('__str__', function (args) {
        var id = '0000000000000' + args.self.get_id().toString(16);
        return new_str('<object at 0x' + id.substr(-13) + '>');
    }, ['self']);
    py_object.dict['__repr__'] = py_object.dict['__str__'];


    py_object.define('__getattribute__', function (vm, frame, args) {
        var value;
        switch (frame ? frame.state : 0) {
            case 0:
                if (args.name in args.self.dict) {
                    value = args.self.dict['<string>' + args.name];
                }

        }

    });


    py_type.define('__call__', function (code, vm, frame, args) {
        var instance, kwargs;
        if (!frame) {
            var func_new = args.cls.lookup('__new__');
            frame = vm.native_call(code, func_new, [args.cls].concat(args.var_args), args.var_kwargs);
            if (frame) {
                return;
            }
            var func_init = args.cls.lookup('__init__');
            instance = vm.return_value;
            frame = vm.native_call(code, func_init, [instance].concat(args.var_args), args.var_kwargs);
            if (frame) {
                frame.locals.instance = instance;
            }
            return instance;
        } else {
            if (frame.locals.instance) {
                return frame.locals.instance;
            } else {
                frame.locals.instance = vm.return_value;
                func_init = args.cls.lookup('__init__');
                vm.native_call(code, func_init, [frame.locals.instance].concat(args.var_args), args.var_kwargs);
            }
        }
    }, ['cls', 'var_args', 'var_kwargs'], {
        flags: CODE_FLAGS.VAR_ARGS | CODE_FLAGS.VAR_KWARGS,
        extended: true
    });


    var py_js_array = new_type('JSArray');
    var py_js_object = new_type('JSObject');

    var IndexError = null;


    var print = make_function(function (code, vm, frame, args) {
        var index, object, strings;
        if (!frame) {
            strings = [];
            for (index = 0; index < args.objects.length; index++) {
                object = args.objects[index];
                if (object.cls == py_str) {
                    strings.push(object.value);
                } else {
                    vm.new_frame()
                }
            }
            console.log(strings.join(' '));
        }

    }, ['sep', 'end', 'file', 'flush', 'objects'], {
        flags: CODE_FLAGS.VAR_ARGS,
        kwargcount: 4,
        extended: true,
        defaults: {'sep': new_str(' '), 'end': new_str(''), 'file': None, 'flush': False}
    });


    var builtins = {
        'None': None,
        'True': True,
        'False': False,
        'NotImplemented': NotImplemented,
        'Ellipsis': Ellipsis,
        '__debug__': DEBUG ? True : False,
        'int': py_int,
        'float': py_float,
        'str': py_str,
        'bytes': py_bytes,
        'tuple': py_tuple,
        'print': print
    };






    var py_list = new_type('list');
    var py_dict = new_type('dict');




    var TypeError = null;

    return {
        'PythonCode': PythonCode,
        'NativeCode': NativeCode,

        'None': None,
        'NotImplemented': NotImplemented,
        'True': True,
        'False': False,

        'py_object': py_object,
        'py_type': py_type,

        'py_int': py_int,
        'py_float': py_float,
        'py_str': py_str,
        'py_bytes': py_bytes,
        'py_tuple': py_tuple,

        'new_int': new_int,
        'new_float': new_float,
        'new_str': new_str,
        'new_bytes': new_bytes,
        'new_tuple': new_tuple,

        'new_code': new_code,

        'Dict': Dict,

        'builtins': builtins,

        'VM': VM
    }
})();