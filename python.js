require(['structures'], function (structures) {

    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'assertion failed')
        }
    }

    function is_object(item) {
        if (typeof item == 'object') {
            return item.__class__ != undefined;
        } else {
            return false;
        }
    }
    function is_class(item) {
        if (typeof item == 'object') {
            return item.__bases__ != undefined;
        } else {
            return false;
        }
    }

    function merge(linearizations) {
        var result, iter1, item1, iter2, item2, head, good;
        result = structures.list();
        while (true) {
            if (linearizations.length == 0) {
                return result;
            }

            iter1 = linearizations.iter();
            while (item1 = iter1.next()) {
                head = item1.get(0);
                good = true;
                iter2 = linearizations.iter();
                while (item2 = iter2.next()) {
                    if (item2.slice(-1, 0, -1).contains(head)) {
                        good = false;
                        break;
                    }
                }
                if (good) {
                    result.append(head);
                    iter2 = linearizations.iter();
                    while (item2 = iter2.next()) {
                        if (item2.contains(head)) {
                            item2.remove(head);
                            if (item2.length == 0) {
                                linearizations.remove(item2);
                                iter2.position -= 1;
                            }
                        }
                    }
                    break;
                }
            }
            if (!good) {
                throw new structures.ValueError('invalid linearization');
            }
        }

    }
    function linearize(cls) {
        assert(is_class(cls));
        var linearizations = structures.list();
        for (var i = 0; i < cls.__bases__.length; i++) {
            linearizations.append(linearize(cls.__bases__[i]));
        }
        return structures.list([cls]).concat(merge(linearizations));
    }

    var PyType = {
        __new__: function (mcs, name, bases, attributes) {
            return {
                __class__: mcs,
                __name__: name,
                __bases__: bases,
                __dict__: attributes
            }
        }
    };

    var PyObject = PyType.__new__(PyType, 'object', [], {});
    PyType.__class__ = PyType;
    PyType.__name__ = 'type';
    PyType.__bases__ = [PyObject];
    PyType.__dict__ = {};

    var X = PyType.__new__(PyType, 'X', [PyObject], {});
    var Y = PyType.__new__(PyType, 'Y', [PyObject], {});
    var A = PyType.__new__(PyType, 'A', [X, Y], {});
    var B = PyType.__new__(PyType, 'B', [Y, X], {});


    console.log(linearize(A));
    console.log(linearize(B));
    try {
        console.log(linearize(PyType.__new__(PyType, 'C', [A, B], {})));
    } catch (error) {
        console.log(error);
    }

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

    function getattr(object, name) {
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


