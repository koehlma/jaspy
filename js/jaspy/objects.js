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

goog.provide('jaspy.objects');

(function () {
    var NATIV_CODES = {
        RETURN: 0,
        NEXT: 1
    };

    var object_id_counter = 0 | 0;

    function compute_mro(cls) {
        var pending = cls.bases.map(compute_mro), mro = [cls];
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
                    mro.push(head);
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
        return mro;
    }

    function PyObject(cls, self) {
        this.cls = cls;
        this.self = self || {};
        this.id = object_id_counter++;
    }
    PyObject.prototype.lookup = function (name) {
        if (this.self.hasOwnProperty(name)) {
            return this.self[name];
        }
        var index, value, cls;
        for (index = 0; index < this.cls.mro.length; index++) {
            cls = this.cls.mro[index];
            if (this != py_object && this != py_type) {
                value = cls.lookup(name);
                if (value != null) {
                    return value;
                }
            }
        }
        return null;
    };

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
        this.mro = compute_mro(this);
    }
    PyType.prototype = new PyObject;


    var py_object = new PyType(null, 'object', [], {});
    var py_type = new PyType(null, 'type', [py_object], {});

    py_object.cls = py_type;
    py_type.cls = py_type;


    var py_none = new PyType(py_type, 'NoneType', [py_object], {});
    function PyNone(cls) {
        PyObject.call(this, cls || py_none);
    }
    PyNone.prototype = new PyObject;

    var None = new PyNone();


    var py_not_implemented = new PyType(py_type, 'NotImplementedType', [py_object], {});
    function PyNotImplemented(cls) {
        PyObject.call(this, cls || py_not_implemented);
    }
    PyNotImplemented.prototype = new PyObject;

    var NotImplemented = new PyNotImplemented();


    var py_int = new PyType(py_type, '__js_int__', [py_object], {});
    function PyInt(value, cls) {
        PyObject.call(this, cls || py_int);
        this.value = value | 0;
    }
    PyInt.prototype = new PyObject;

    var Ints = [];
    for (var int = 0; int < 255 + 256; int++) {
        Ints[int] = new PyInt(int - 255);
    }


    var py_bool = new PyType(py_type, 'bool', [py_int], {});
    function PyBool(value, cls) {
        PyInt.call(this, value ? 1 : 0, cls || py_bool);
    }
    PyBool.prototype = new PyInt;

    var True = new PyBool(true);
    var False = new PyBool(false);


    var py_string = new PyType(py_type, '__js_str__', [py_object], {});
    function PyString(value, cls) {
        PyObject.call(this, cls || py_string);
        this.value = value;
    }
    PyString.prototype = new PyObject;


    var py_tuple = new PyType(py_type, 'tuple', [py_object], {});
    function PyTuple(value, cls) {
        PyObject.call(this, cls || py_tuple);
        this.value = value;
    }
    PyTuple.prototype = new PyObject;


    var py_function = new PyType(py_type, 'function', [py_object], {});
    function PyFunction(name, code, defaults, globals, closure, cls) {
        PyObject.call(this, cls || py_function);
        this.name = name ? name.value : code.co_name;
        this.code = code;
        this.defaults = defaults;
        this.globals = globals || {};
        this.closure = closure || null;
    }
    PyFunction.prototype = new PyObject;


    var py_dict = new PyType(py_type, 'dict', [py_object], {});
    function PyDict(cls) {
        PyObject.call(this, cls || py_dict);
        this.value = {}
    }


    var py_native = new PyType(py_type, 'native', [py_object], {});
    function PyNative(func, argcount, optargcount) {
        PyObject.call(this, py_native);
        this.func = func;
        this.argcount = argcount || 0;
        this.optargcount = optargcount || 0;
    }
    PyNative.prototype = new PyObject;
    PyNative.prototype.call = function (interpreter, args) {
        if (args.length < this.argcount) {
            throw new Error('too few arguments');
        }
        if (args.length > this.argcount + this.optargcount) {
            throw new Error('too much arguments');
        }
        return this.func.apply(this, [interpreter].concat(args));
    };

    py_object.self = {
        '__str__': new PyNative(function (self) {
            return new PyString('<' + self.cls.name + ' object at 0x' + self.id.toString(16) + '>')
        }, 1),
        '__hash__': new PyNative(function (self) {
            return self.id;
        }, 1),
        '__eq__': new PyNative(function (self, other) {
            return self.id == other.id ? True : False;
        }, 2)
    };
    py_object.self['__repr__'] = py_object.self['__str__'];

    py_type.self = {
        '__call__': new PyNative(function (interpreter, cls) {
            switch (interpreter.frame.f_native_)
        }, 1)
    }

    py_int.self = {
        '__add__': new PyNative(function (interpreter, left, right) {
            if (left instanceof PyInt && right instanceof PyInt) {
                return [NATIV_CODES.RETURN, js2py(left.value + right.value)];
            }
            return [NATIV_CODES.RETURN, NotImplemented];
        }, 2),
        '__and__': new PyNative(function (left, right) {
            if (left instanceof PyInt && right instanceof PyInt) {
                return js2py(left.value & right.value);
            }
            return [NATIV_CODES.RETURN, NotImplemented];
        }, 2),
        '__lshift__': new PyNative(function (left, right) {
            console.log(left, right);
            if (left instanceof PyInt && right instanceof PyInt) {
                return js2py(left.value << right.value);
            }
            return [NATIV_CODES.RETURN, NotImplemented];
        }, 2)
    };

    var build_class = new PyNative(function (mcs, name, bases, attributes) {
        return new PyType(mcs, name.value, bases, attributes);
    }, 4);

    var py_code = new PyType(py_type, 'code', [py_object], {});
    function PyCode(code, cls) {
        PyObject.call(this, cls || py_code);
        this.co_argcount = code['co_argcount'] || 0;
        this.co_kwonlyargcount = code['co_kwonlyargcount'] || 0;
        this.co_code = code['co_code'] || [];
        this.co_consts = (code['co_consts'] || []).map(jaspy.objects.js2py);
        this.co_filename = code['co_filename'] || '<string>';
        this.co_firstlineno = code['co_firstlineno'] || 1;
        this.co_flags = code['co_flags'] || 0;
        this.co_lnotab = code['co_lnotab'] || [];
        this.co_name = code['co_name'] || '<module>';
        this.co_nlocals = code['co_nlocals'] || 0;
        this.co_stacksize = code['co_stacksize'] || 0;
        this.co_names = code['co_names'] || [];
        this.co_varnames = code['co_varnames'] || [];
        this.co_freevars = code['co_freevars'] || [];
        this.co_cellvars = code['co_cellvars'] || [];
    }
    PyCode.prototype = new PyObject;


    function js2py(value) {
        if (value instanceof Array) {
            return new PyTuple(value.map(js2py));
        } else if (typeof value == 'string') {
            return new PyString(value);
        } else if (typeof value == 'number') {
            value |= 0;
            if (value > -256 && value < 256) {
                return Ints[value + 255];
            } else {
                return new PyInt(value);
            }
        } else if (typeof value == 'boolean') {
            return value ? True : False;
        } else if (value == undefined) {
            return None;
        } else if (value['co_code'] != undefined) {
            return new PyCode(value);
        }
    }

    jaspy.objects.PyObject = PyObject;
    jaspy.objects.PyType = PyType;
    jaspy.objects.PyNone = PyNone;
    jaspy.objects.PyInt = PyInt;
    jaspy.objects.PyBool = PyBool;
    jaspy.objects.PyTuple = PyTuple;
    jaspy.objects.PyCode = PyCode;
    jaspy.objects.PyFunction = PyFunction;
    jaspy.objects.PyNative = PyNative;

    jaspy.objects.build_class = build_class;

    jaspy.objects.py_type = py_type;
    jaspy.objects.py_object = py_object;
    jaspy.objects.py_none = py_none;
    jaspy.objects.py_int = py_int;
    jaspy.objects.py_bool = py_bool;
    jaspy.objects.py_string = py_string;
    jaspy.objects.py_code = py_code;
    jaspy.objects.py_function = py_function;
    jaspy.objects.py_native = py_native;

    jaspy.objects.None = None;
    jaspy.objects.Ints = Ints;
    jaspy.objects.True = True;
    jaspy.objects.False = False;
    jaspy.objects.NotImplemented = NotImplemented;

    jaspy.objects.NATIVE_CODES = NATIV_CODES;

    jaspy.objects.js2py = js2py;
})();

