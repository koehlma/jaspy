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

goog.provide('jaspy.interpreter');

goog.require('jaspy.opcodes');
goog.require('jaspy.objects');

(function () {
    var BINARY_SLOTS = {};
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_ADD] = 'add';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_AND] = 'and';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_FLOOR_DIVIDE] = 'floordiv';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_LSHIFT] = 'lshift';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_MATRIX_MULTIPLY] = 'matmul';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_MODULO] = 'mod';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_MULTIPLY] = 'mul';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_OR] = 'or';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_POWER] = 'pow';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_RSHIFT] = 'rshift';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_SUBSCR] = 'getitem';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_SUBTRACT] = 'sub';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_TRUE_DIVIDE] = 'truediv';
    BINARY_SLOTS[jaspy.opcodes.OPCODES.BINARY_XOR] = 'xor';

    var FLAGS = {
        STAR_ARGS: 0x04,
        STAR_KWARGS: 0x08
    };



    var py_frame = new jaspy.objects.PyType(jaspy.objects.py_type, 'frame', [jaspy.objects.py_object], {});

    var Code = jaspy.objects.PyCode;


    function Frame(code, frame, cls) {
        jaspy.objects.PyObject.call(cls || py_frame);
        frame = frame || {};
        this.f_code = code;
        this.f_locals = frame.f_locals || {};
        this.f_back = frame.f_back || null;
        this.f_lasti = frame.f_lasti || 0;
        this.f_namespace = frame.f_namespace || null;

        /* stack for native code */
        this.f_native = null;
        this.f_native_arg = null;
        this.f_native_state = 0;

        if (frame.f_builtins) {
            this.f_builtins = frame.f_builtins;
        } else if (this.f_back) {
            this.f_builtins = this.f_back.f_builtins;
        } else {
            this.f_builtins = {}
        }
        if (frame.f_globals) {
            this.f_globals = frame.f_globals;
        } else if (this.f_back) {
            this.f_globals = this.f_back.f_globals;
        } else {
            this.f_globals = {};
        }


        this.stack = [];
        this.blocks = [];

        this.state = 0;
        this.position = 0;
    }
    Frame.prototype = new jaspy.objects.PyObject;

    function Interpreter() {
        this.frame = null;
    }
    Interpreter.prototype.main = function (code) {
        this.run(code);
    };
    Interpreter.prototype._push = function (object) {
        this.frame.stack.push(object);
    }
    Interpreter.prototype._pop = function () {
        return this.frame.stack.pop();
    };
    Interpreter.prototype._popn = function (number) {
        if (number) {
            return this.frame.stack.splice(this.frame.stack.length - number, number);
        } else {
            return [];
        }
    };
    Interpreter.prototype._load = function (name) {
        if (name in this.frame.f_locals) {
            return this.frame.f_locals[name];
        } else if (name in this.frame.f_globals) {
            return this.frame.f_globals[name];
        } else if (name in this.frame.f_builtins) {
            return this.frame.f_builtins[name];
        } else {
            throw new Error('error');
        }
    };
    Interpreter.prototype._call = function (func, args, kwargs, options) {
        var name, index, f_locals = {};

        for (index = 0; index < func.code.co_argcount; index++) {
            name = func.code.co_varnames[index];
            if (args[index]) {
                f_locals[name] = args[index];
            } else if (name in kwargs) {
                f_locals[name] = kwargs[name];
                delete kwargs[name];
            } else if (name in func.defaults) {
                f_locals[name] = func.defaults[name]
            } else {
                throw new Error('ArgumentError');
            }
            if (name in kwargs) {
                throw new Error('MultipleArguments');
            }
        }
        for (; index < func.code.co_argcount + func.code.co_kwonlyargcount; index++) {
            name = func.code.co_varnames[index];
            if (name in kwargs) {
                f_locals[name] = kwargs[name];
                delete kwargs[name];
            } else if (name in func.defaults) {
                f_locals[name] = func.defaults[name]
            } else {
                throw new Error('ArgumentError');
            }
        }
        if ((func.code.co_flags & FLAGS.STAR_ARGS) != 0) {
            name = func.code.co_varnames[index++];
            f_locals[name] = new jaspy.objects.PyTuple(args.slice(func.code.co_argcount, args.length));
        } else if (args.length > func.code.co_argcount) {
            throw new Error('ArgumentError');
        }
        if ((func.code.co_flags & FLAGS.STAR_KWARGS) != 0) {
            name = func.code.co_varnames[index];
            f_locals[name] = kwargs;  // FIXME: make dict
        } else {
            // FIXME: test too much kwargs
        }
        options = options || {};
        options.f_back = this.frame;
        options.f_locals = f_locals;
        this.frame = new Frame(func.code, options);
    };

    Interpreter.prototype._top = function () {
        return this.frame.stack[this.frame.stack.length - 1];
    };
    Interpreter.prototype._topn = function (number) {
        return this.frame.stack.slice(this.frame.length - number, this.frame.length);
    };
    Interpreter.prototype._run_native = function () {
        var packed, result;
        packed = this.frame.f_native.call(this, this.frame.f_native_args);
        result = packed[1];
        switch (packed[0]) {
            case jaspy.objects.NATIVE_CODES.RETURN:
                this.frame.f_native = null;
                this.frame.f_native_state = 0;
                this._push(result);
                break;
            case jaspy.objects.NATIVE_CODES.NEXT:
                break;
        }
    };
    Interpreter.prototype.run = function (code) {
            var instruction;
            this.frame = new Frame(code, {
                'f_globals': {
                    '__name__': '__main__'
                },
                'f_builtins': {
                    'object': jaspy.objects.py_object,
                    '__js_str__': jaspy.objects.py_string,
                    '__js_int__': jaspy.objects.py_int,
                    '__js_type__': jaspy.objects.py_type,
                    'alert': new jaspy.objects.PyNative(function (interpreter, string) {
                        alert(string.value);
                        return [jaspy.objects.NATIVE_CODES.RETURN, jaspy.objects.None];
                    }, 1),
                    '__js_log__': new jaspy.objects.PyNative(function (interpreter, object) {
                        console.log('python: ', object);
                        return [jaspy.objects.NATIVE_CODES.RETURN, jaspy.objects.None];
                    }, 1),
                    '__js_namespace__': new jaspy.objects.PyNative(function (interpreter, namespace, func, args, kwargs) {
                        switch (interpreter.frame.f_native_state) {
                            case 0:
                                interpreter.frame.f_native_state = 1;
                                if (args instanceof jaspy.objects.PyTuple) {
                                    args = args.value;
                                } else {
                                    args = []
                                }
                                interpreter._call(func, args, {}, {f_namespace: namespace});
                                return [jaspy.objects.NATIVE_CODES.NEXT, null];
                            case 1:
                                return [jaspy.objects.NATIVE_CODES.RETURN, null];
                        }
                    }, 2, 2)
                }
            });
            while (this.frame.position < this.frame.f_code.co_code.length) {
                if (this.frame.f_native) {
                    this._run_native();
                    continue;
                }


                instruction = this.frame.f_code.co_code[this.frame.position++];
                console.log(this.frame, instruction);
                var opcode = instruction[0];
                var argument = instruction[1];
                var name, high, mid, low, index, args, kwargs, func, value;
                var defaults, globals, left, right, result, top, slot;

                switch (opcode) {
                    case jaspy.opcodes.OPCODES.POP_TOP:
                        this._pop();
                        break;
                    case jaspy.opcodes.OPCODES.ROT_TWO:
                        top = this._popn(2);
                        this._push(top[1]);
                        this._push(top[0]);
                        break;
                    case jaspy.opcodes.OPCODES.ROT_THREE:
                        top = this._popn(3);
                        this._push(top[2]);
                        this._push(top[1]);
                        this._push(top[0]);
                        break;
                    case jaspy.opcodes.OPCODES.DUP_TOP:
                        this._popn(this._top());
                        break;
                    case jaspy.opcodes.OPCODES.DUP_TOP_TWO:
                        top = this._topn(2);
                        this._push(top[0]);
                        this._push(top[1]);
                        break;

                    case jaspy.opcodes.OPCODES.NOP:
                        break;

                    case jaspy.opcodes.OPCODES.LOAD_FAST:
                        name = this.frame.f_code.co_varnames[argument];
                        if (name in this.frame.f_locals) {
                            value = this.frame.f_locals[name];
                        } else {
                            throw new Error('NameError');
                        }
                        this._push(value);
                        break;
                    case jaspy.opcodes.OPCODES.LOAD_NAME:
                        name = this.frame.f_code.co_names[argument];
                        if (name in this.frame.f_locals) {
                            value = this.frame.f_locals[name];
                        } else if (name in this.frame.f_globals) {
                            value = this.frame.f_globals[name];
                        } else if (name in this.frame.f_builtins) {
                            value = this.frame.f_builtins[name];
                        } else {
                            throw new Error('NameError');
                        }
                        this._push(value);
                        break;
                    case jaspy.opcodes.OPCODES.LOAD_GLOBAL:
                        name = this.frame.f_code.co_names[argument];
                        if (name in this.frame.f_globals) {
                            value = this.frame.f_globals[name];
                        } else if (name in this.frame.f_builtins) {
                            value = this.frame.f_builtins[name];
                        } else {
                            throw new Error('NameError');
                        }
                        this._push(value);
                        break;

                    case jaspy.opcodes.OPCODES.STORE_FAST:
                        name = this.frame.f_code.co_varnames[argument];
                        this.frame.f_locals[name] = this._pop();
                        break;
                    case jaspy.opcodes.OPCODES.STORE_NAME:
                        name = this.frame.f_code.co_names[argument];
                        this.frame.f_locals[name] = this._pop();
                        break;
                    case jaspy.opcodes.OPCODES.STORE_GLOBAL:
                        name = this.frame.f_code.co_names[argument];
                        this.frame.f_globals[name] = this._pop();
                        break;

                    case jaspy.opcodes.OPCODES.LOAD_CONST:
                        value = this.frame.f_code.co_consts[argument];
                        this._push(value);
                        break;

                    case jaspy.opcodes.OPCODES.BINARY_ADD:
                    case jaspy.opcodes.OPCODES.BINARY_AND:
                    case jaspy.opcodes.OPCODES.BINARY_FLOOR_DIVIDE:
                    case jaspy.opcodes.OPCODES.BINARY_LSHIFT:
                    case jaspy.opcodes.OPCODES.BINARY_MATRIX_MULTIPLY:
                    case jaspy.opcodes.OPCODES.BINARY_MODULO:
                    case jaspy.opcodes.OPCODES.BINARY_MULTIPLY:
                    case jaspy.opcodes.OPCODES.BINARY_OR:
                    case jaspy.opcodes.OPCODES.BINARY_POWER:
                    case jaspy.opcodes.OPCODES.BINARY_RSHIFT:
                    case jaspy.opcodes.OPCODES.BINARY_SUBSCR:
                    case jaspy.opcodes.OPCODES.BINARY_SUBTRACT:
                    case jaspy.opcodes.OPCODES.BINARY_TRUE_DIVIDE:
                    case jaspy.opcodes.OPCODES.BINARY_XOR:
                        switch (this.frame.state) {
                            case 0:
                                right = this._pop();
                                left = this._pop();
                                slot = right.cls.lookup('__' + BINARY_SLOTS[opcode] + '__');
                                this.frame.state = 1;
                                this.frame.position--;
                                if (slot instanceof jaspy.objects.PyNative) {
                                    this.frame.f_native = slot;
                                    this.frame.f_native_args = [left, right];
                                } else if (slot instanceof jaspy.objects.PyFunction) {
                                    this._call(slot, [left, right]);
                                } else {
                                    throw new Error('NotImplementedError');
                                }
                                break;
                            case 1:
                                if (this._top() == jaspy.objects.NotImplemented) {
                                    throw new Error('NotImplementedError');
                                }
                                this.frame.state = 0;
                                break;
                        }
                        break;


                    case jaspy.opcodes.OPCODES.BUILD_TUPLE:
                        this._push(new jaspy.objects.PyTuple(this._popn(argument)));
                        break;


                    case jaspy.opcodes.OPCODES.RETURN_VALUE:
                        result = this._pop();
                        if (this.frame.f_back) {
                            this.frame = this.frame.f_back;
                            this._push(result);
                        } else {
                            //this.frame = null;
                            return result;
                        }
                        break;
                    case jaspy.opcodes.OPCODES.MAKE_FUNCTION:
                        low = argument & 0xFF;
                        mid = (argument >> 8) & 0xFF;
                        high = (argument >> 16) & 0x7FFF;
                        name = this._pop();
                        code = this._pop();
                        if (high) {
                            throw new Error('annotations not supported');
                        }
                        defaults = {};
                        for (index = 0; index < mid; index++) {
                            value = this._pop();
                            defaults[this._pop().value] = value;
                        }
                        for (index = 0; index < low; index++) {
                            defaults[code.co_varnames[index]] = this._pop();
                        }
                        globals = this.frame.f_globals;
                        this._push(new jaspy.objects.PyFunction(name, code, defaults, globals));
                        break;
                    case jaspy.opcodes.OPCODES.LOAD_ATTR:
                        var obj = this._pop();
                        console.log(obj, this.frame.f_code.co_names[instruction[1]]);
                        this._push('jo');
                        break;
                    case jaspy.opcodes.OPCODES.LOAD_BUILD_CLASS:
                        this._push(this._load('__build_class__'));
                        break;
                    case jaspy.opcodes.OPCODES.CALL_FUNCTION:
                        low = argument & 0xFF;
                        high = argument >> 8;
                        kwargs = {};
                        for (index = 0; index < high; index++) {
                            value = this._pop();
                            kwargs[this._pop().value] = value;
                        }
                        args = this._popn(low);
                        func = this._pop();
                        slot = func.cls.lookup('__call__');
                        if (slot) {
                            func = slot;
                            args = [args].concat(func);
                        }
                        console.log(func, args, kwargs);
                        if (func instanceof jaspy.objects.PyNative) {
                            this.frame.f_native = func;
                            this.frame.f_native_args = args;
                        } else if (func instanceof jaspy.objects.PyFunction) {
                            this._call(func, args, kwargs);
                        } else {
                            throw new Error('invalid callable in call function');
                        }
                        break;

                    default:
                        console.log('unknown instruction ' + instruction);
                }
            }
    };


    var example = new Code({"co_nlocals": 0, "co_consts": ["metaclass", null, {"co_nlocals": 6, "co_consts": [null], "co_flags": 79, "co_filename": "example.py", "co_cellvars": [], "co_freevars": [], "co_argcount": 2, "co_code": [[100, 0], [125, 5], [116, 0], [124, 5], [124, 0], [131, 2], [1, null], [100, 0], [83, null]], "co_firstlineno": 4, "co_names": ["__js_namespace__"], "co_varnames": ["function", "name", "metaclass", "bases", "keywords", "namespace"], "co_stacksize": 3, "co_kwonlyargcount": 1, "co_lnotab": [0, 1, 6, 1], "co_name": "__build_class__"}, "__build_class__", {"co_nlocals": 0, "co_consts": ["Test", null], "co_flags": 64, "co_filename": "example.py", "co_cellvars": [], "co_freevars": [], "co_argcount": 0, "co_code": [[101, 0], [90, 1], [100, 0], [90, 2], [100, 1], [83, null]], "co_firstlineno": 9, "co_names": ["__name__", "__module__", "__qualname__"], "co_varnames": [], "co_stacksize": 1, "co_kwonlyargcount": 0, "co_lnotab": [12, 1], "co_name": "Test"}, "Test"], "co_flags": 64, "co_filename": "example.py", "co_cellvars": [], "co_freevars": [], "co_argcount": 0, "co_code": [[101, 0], [131, 0], [90, 1], [100, 0], [100, 1], [100, 2], [100, 3], [132, 256], [90, 2], [71, null], [100, 4], [100, 5], [132, 0], [100, 5], [131, 2], [90, 3], [100, 1], [83, null]], "co_firstlineno": 2, "co_names": ["object", "a", "__build_class__", "Test"], "co_varnames": [], "co_stacksize": 4, "co_kwonlyargcount": 0, "co_lnotab": [9, 2, 18, 5], "co_name": "<module>"});

    var vm = new Interpreter();
    vm.run(example);

    console.log(vm);

    jaspy.interpreter.Interpreter = Interpreter;
    jaspy.interpreter.Code = Code;
    jaspy.interpreter.Frame = Frame;
})();



/*
define(function () {
    'use strict';

     Object Model
    function PyObject(cls, self) {
        this.cls = cls;
        this.self = self || {};
        this.mro = [this.cls];  // FIXME: use C3 mro
    }

    function PyType(mcs, name, bases, attributes) {
        var attr_name, attr_value, self = {};
        for (attr_name in attributes) {
            if (attributes.hasOwnProperty(attr_name)) {
                attr_value = attributes[attr_name];
                if (attr_value instanceof PyObject) {
                    self[attr_name] = attr_value;
                } else {
                    console.log(attr_name + ' : ' + attr_value);
                }
            }
        }
        PyObject.call(this, mcs, attributes);
        this.name = name;
        this.bases = bases;
    }
    PyType.prototype = Object.create(PyObject.prototype);


    var py_object = new PyType(null, 'object', [], {});
    var py_type = new PyType(null, 'type', [py_object], {});
    py_object.cls = py_type;
    py_type.cls = py_type;


    var py_int = new PyType(py_type, 'int', [py_object], {});
    var py_float = new PyType(py_type, 'float', [py_object], {});
    var py_string = new PyType(py_type, 'string', [py_object], {});
    var py_bool = new PyType(py_type, 'bool', [py_int], {});
    var py_tuple = new PyType(py_type, 'tuple', [py_object], {});
    var py_code = new PyType(py_type, 'code', [py_object], {});
    var py_function = new PyType(py_type, 'function', [py_object], {});
    var py_native = new PyType(py_type, 'native', [py_function], {});

    function PyInt(value, cls) {
        PyObject.call(this, cls || py_int);
        this.value = value || 0;
    }
    PyInt.prototype = Object.create(PyType.prototype);

    function PyCode(code, cls) {
        PyObject.call(this, cls || py_code);
        this.co_argcount = code.co_argcount || 0;
        this.co_kwonlyargcount = code.co_kwonlyargcount || 0;
        this.co_code = code.co_code || [];
        this.co_consts = code.co_consts || [];
        this.co_filename = code.co_filename || '<string>';
        this.co_firstlineno = code.co_firstlineno || 1;
        this.co_flags = code.co_flags || 0;
        this.co_lnotab = code.co_lnotab || [];
        this.co_name = code.co_name || '<module>';
        this.co_nlocals = code.co_nlocals || 0;
        this.co_stacksize = code.co_stacksize || 0;
        this.co_names = code.co_names || [];
        this.co_varnames = code.co_varnames || [];
        this.co_freevars = code.co_freevars || [];
        this.co_cellvars = code.co_cellvars || [];
    }


    var NATIVE_TYPES = {
        METHOD: 'method',
        CLASS_METHOD: 'classmethod',
        PROPERTY: 'property',
        READONLY_PROPERTY: 'property'
    };

    function PyNative(func, args, type) {
        PyObject.call(this, py_native);
        this.func = func;
        this.args = args;
        this.self.__call__ = this;
    }
    PyNative.prototype = Object.create(PyObject.prototype);


    py_object.self = {
        __new__: new PyNative(function (py_object, cls) {
            return new PyObject(cls);
        }, ['cls']),
        __init__: new PyNative(function (py_object, self) {

        }, ['self'], NATIVE_TYPES.METHOD)
    };

    py_int.self = {
        __new__: new PyNative(function (object, cls, value) {
            return new PyInt(value, cls);
        }, ['cls', 'value'])
    };

    py_float.self = {

    };

    var js_object = new PyType(py_type, 'JsObject', [py_object], {
        __new__: function (object, cls) {
            return new JsObject({}, cls);
        },
        __getattr__: new PyNative(function (object, name) {
            if (object.object.hasOwnProperty(name)) {
                // TODO: wrap js objects
                return object.object[name];
            }
        }, ['name'])
    });

    function JsObject(object, cls) {
        PyObject.call(this, cls || js_object);
        this.object = object;
    }
    JsObject.prototype = Object.create(PyObject.prototype);


    var py_frame = new PyType(py_type, 'frame', [py_object], {});
    function Frame(code, frame, cls) {
        PyObject.call(cls || py_frame);
        frame = frame || {};
        this.f_code = code;
        this.f_globals = frame.f_globals || {};
        this.f_locals = frame.f_locals || {};
        this.f_back = frame.f_back || null;
        this.f_lasti = frame.f_lasti || 0;

        if (frame.f_builtins) {
            this.f_builtins = frame.f_builtins;
        } else if (this.f_back) {
            this.f_builtins = this.f_back.f_builtins;
        } else {
            this.f_builtins = {}
        }

        this.stack = [];
        this.blocks = [];

        this.state = 0;
        this.position = 0;
    }

    var OPCODES = {
        POP_TOP: 1,
        ROT_TWO: 2,
        ROT_THREE: 3,
        DUP_TOP: 4,
        DUP_TOP_TWO: 5,

        NOP: 9,

        LOAD_CONST: 100,
        STORE_NAME: 90,
        RETURN_VALUE: 83
    };

    function VM() {
        this.frame = null;
    }
    VM.prototype = {
        run: function (code) {
            var instruction;
            this.frame = new Frame(code, {});
            while (this.frame.position < this.frame.f_code.co_code.length) {
                instruction = this.frame.f_code.co_code[this.frame.position];
                this.frame.position++;
                switch (instruction[0]) {
                    case OPCODES.LOAD_CONST:
                        this.frame.stack.push(this.frame.f_code.co_consts[instruction[1]]);
                        continue;
                    case OPCODES.STORE_NAME:
                        this.frame.f_locals[this.frame.f_code.co_names[instruction[1]]] = this.frame.stack.pop();
                        continue;
                    case OPCODES.RETURN_VALUE:
                        if (this.frame.f_back) {
                            return;
                        } else {
                            return;
                        }
                    default:
                        console.log('unknown instruction ' + instruction);
                }
            }
        }
    };


    var example = new PyCode();

    var vm = new VM();
    vm.run(example);

    return {
        'PyObject': PyObject,
        'PyType': PyType,
        'PyInt': PyInt
    }

});

   */