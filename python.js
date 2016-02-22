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

require(['structures'], function (structures) {
    'use strict';

    /* c3 method resolution order */
    function linearize(cls) {
        var pending = cls.bases.map(linearize), mro = structures.list([cls]);
        var iterator, item, head, good;
        while (pending.length != 0) {
            iterator = pending.iter();
            while (item = iterator.next()) {
                head = item.get(0);
                good = true;
                pending.map(function (base_mro) {
                    good &= !base_mro.slice(-1, 0, -1).contains(head);
                });
                if (good) {
                    mro.append(head);
                    pending = pending.filter(function (base_mro) {
                        if (base_mro.contains(head)) {
                            base_mro.remove(head);
                        }
                        return base_mro.length > 0;
                    });
                    break;
                }
            }
            if (!good) {
                throw new structures.ValueError('unable to linearize hierarchy');
            }
        }
        return mro;
    }

    function PyObject(cls, instance) {
        this.cls = cls;
        this.instance = instance || {};
    }
    PyObject.prototype = {
        lookup: function (name) {
            if (this.instance.hasOwnProperty(name)) {
                return this.instance[name];
            }
            var index, value, cls;
            for (index = 0; index < this.cls.mro.length; index++) {
                cls = this.cls.mro.get(index);
                if (cls != this) {
                    value = cls.lookup(name);
                    if (value != null) {
                        return value;
                    }
                }
            }
            return null;
        }
    };

    function PyType(mcs, name, bases, attributes) {
        PyObject.call(this, mcs, attributes);
        this.name = name;
        this.bases = structures.list(bases);
        this.mro = linearize(this);
    }
    PyType.prototype = Object.create(PyObject.prototype);


    function unpack_args(args, names) {
        if (args.length != names.length) {
            throw new Error('argument error');
        }
        var index, result = {};
        for (index = 0; index < args.length; index++) {
            result[names[index]] = args[index];
        }
        return result;
    }


    var py_type, py_object;
    py_type = new PyType(null, 'type', [], {
        __new__: function (frame, args) {
            args = unpack_args(args, ['mcs', 'name', 'bases', 'attributes']);
            return new PyType(args.mcs, args.name, args.bases, args.attributes);
        }
    });
    py_type.cls = py_type;
    py_object = new PyType(py_type, 'object', [], {
        __new__: function (frame, args) {
            return new PyObject(args[0]);
        }
    });



    var X = new PyType(py_type, 'X', [py_object], {'a': 3});
    var Y = new PyType(py_type, 'Y', [py_object], {});
    var A = new PyType(py_type, 'A', [X, Y], {});
    var B = new PyType(py_type, 'B', [Y, X], {});

    try {
        console.log(linearize(new PyType(py_type, 'C', [A, B], {})));
    } catch (error) {
        console.log(error);
    }


    var Module = new PyType(py_type, 'ModuleType', [py_object], {});
    var Code = new PyType(py_type, 'code', [py_object], {});


    var FrameType = new PyType(py_type, 'frame', [py_object], {});

    function PyFrame() {
        PyObject.call(this, FrameType);
        this.stack = [];
        this.blocks = [];
    }
    PyFrame.prototype = Object.create(PyObject.prototype);
    PyFrame.prototype.block_setup = function (type, handler, level) {
        this.blocks.push({'type': type, 'handler': handler, 'level': level});
    };
    PyFrame.prototype.block_pop = function () {
        this.blocks.pop();
    }



    function VM(module) {
        this.frames = []
        this.current = null;

        this.return_value = null;
        this.last_exception = null;
    }
    VM.prototype.make_frame = function () {

    };


    console.log(A.mro);
    console.log(B.mro);
    console.log(X.lookup('a'));
    console.log((new PyObject(A)).lookup('a'));
    try {
        console.log(linearize(new PyType(py_type, 'C', [A, B], {})));
    } catch (error) {
        console.log(error);
    }
    console.log(Module);
    console.log(py_type.lookup('__new__')(null, [py_type, 'Test', [X], {x: 'test'}]));

    /*

    function get_attribute(object, name) {
        var value;
        if (object.__dict__[name] != undefined) {
            value = object.__dict__[name];
        } else {

        }
    }




    var Object = {
        __new__: function (arguments, keywords) {
            return {
                __class__: arguments[0]
            }
        },
        __js_new__: function (cls) {
            return {
                __class__: cls
            }
        },
        __init__: function (arguments, keywords) {

        }
    };

    var Type = {
        __new__: function (arguments, keywords) {
            var cls = Object.__js_new__(arguments[0]);
            cls.__name__ = arguments[1];
            cls.__bases__ = arguments[2];
            for (var attribute in arguments[3]) {
                if (arguments[3].hasOwnProperty(attribute)) {
                    cls[attribute] = arguments[3][attribute]
                }
            }
            return cls;
        },
        __js_new__: function (mcs, name, bases, attributes) {
            var cls = Object.__js_new__(mcs);
            cls.__name__ = String.__js_new__(name);
            cls.__bases__ = Tuple.__js_new__(bases);
            for (var attribute in attributes) {
                if (attributes.hasOwnProperty(attribute)) {
                    cls[attribute] = attributes[attribute];
                }
            }
        }
    };

    var String = {
        __js_new__: function (value) {
            var self = Object.__js_new__(String);
            self.__js_value__ = value || '';
            self.__js_bool__ = self.__js_value__ != '';
        }
    };

    var List = {
        __js_new__: function (value) {
            var self = Object.__js_new__(List);
            self.__js_value__ = value || [];
        }
    };

    var Tuple = {
        __js_new__: function (value) {
            var self = Object.__js_new__(Tuple);
            self.__js_value__ = value || [];
        }
    };

    var Dict = {
        __js_new__: function (value) {
            var self = Object.__js_new__(Dict);
            self.__js_value__ = value || {};
        }
    };

    Object.__class__ = Type;
    Object.__name__ = String.__js_new__('object');
    Object.__bases__ = Tuple.__js_new__();

    Type.__class__ = Type;
    Type.__name__ = String.__js_new__('type');
    Type.__bases__ = Tuple.__js_new__([Object]);

    var Code = Type.__js_new__(Type, 'code', [Object], {
       __init__: function (arguments, keywords) {
           var self = arguments[0];
           self.co_argcount = keywords.__js_value__.co_argcount || 0;
       }
    });

    function lookup(object, name) {
        if (object[name] != undefined) {
            return object[name]
        }
    }

    var Frame = {

    };

    var RETURN_CODES = {
        'RETURN': 0,
        'YIELD': 1,
        'IMPORT': 2,
        'SWITCH': 3
    };

    function Cell(value) {
        this.value = value || null;
    }
    Cell.prototype.get = function () {
        return this.value;
    };
    Cell.prototype.set = function (value) {
        this.value = value;
    };

    function Code(execute, keywords) {
        this.execute = execute;
        keywords = keywords || {};
        this.co_argcount = keywords.co_argcount || 0;
        this.co_cellvars = keywords.co_cellvars || [];
        this.co_consts = keywords.co_consts || [];
        this.co_filename = keywords.co_filename || '<string>';
        this.co_firstlineno = keywords.co_firstlineno || 1;
        this.co_flags = keywords.co_flags || 0;
        this.co_freevars = keywords.co_freevars || [];
        this.co_kwonlyargs = keywords.co_kwonlyargs || 0;
        this.co_name = keywords.co_name || '<module>';
        this.co_names = keywords.co_names || [];
        this.co_nlocals = keywords.co_nlocals || 0;
        this.co_stacksize = keywords.co_stacksize || 0;
        this.co_varnames = keywords.co_varnames || [];
    }

    function Frame(code, keywords) {
        this.f_code = code;
        keywords = keywords || {};
        this.f_back = keywords.f_back || null;
        this.f_builtins = keywords.f_builtins || null;
        this.f_globals = keywords.f_globals || null;
        this.f_locals = keywords.f_locals || null;
        this.f_restricted = keywords.f_restricted || null;
    }

    function Function(name, code, globals, defaults, closure) {

    }

    var ExampleCode = new Code(function (frame) {
        while (true) {
            switch (frame.state) {
                case 0:
                    return RETURN_CODES.RETURN;
            }
        }
    }, {
        co_filename: 'example.py'
    });



    console.log(ExampleCode);

    /*

    function Frame(code, keywords) {

        this.code = code;
        this.back = keywords.back || null;
        this.globals = keywords.globals || null;
        this.locals = keywords.locals || null;
        this.builtins = keywords.builtins || null;
        this.cells = {};
        for (var index in code.cellvariables) {
            this.cells[code.cellvariables[index]] = new Cell()
        }

        this.stack = [];
        this.back = back || null;
    }



    function Code(executor, keywords) {
        this.executor = executor;
        this.cellvariables = keywords.cellvariables || [];
        this.constants = keywords.constants || [];
    }
    Code.prototype.execute = function (frame) {
        if (frame.code === this) {
            if (frame.state == -1) {
                throw new Error('execute called on frame finished executing');
            } else {
                var return_code = this.executor(frame);
                if (return_code == RETURN_CODES.FINISHED) frame.state = -1;
                return return_code
            }
        } else {
            throw new Error('execute called on frame with not matching code');
        }
    };

    var test = new Code(function (frame) {
        switch (frame.state) {
            case 0:
                frame.state++;
                return RETURN_CODES.IMPORT;
            case 1:
                alert('Test');
                return RETURN_CODES.FINISHED;
        }
    }, {
        constants: [
            3,
            'Test'
        ]
    });



    function Frame(code, keywords) {
        this.code = code;
        this.globals = globals;
        this.locals = locals;
        this.back = back || 0;
        this.state = state || 0;

        this.stack = []
    }
    Frame.prototype = {
        execute: function () {
            return this.code.execute(this)
        }
    };


    function VM(main) {
        this.main = main;
        this.bottom = new Frame(code)
        this.frames = [this.bottom];
    }

    window.VM = VM;
    window.Frame = Frame;
    window.test_code = test;

    return {
        'VM': VM
    }*/

});


