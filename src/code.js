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

var Signature = Class.extend({
    constructor: function (argnames, poscount, var_args, var_kwargs) {
        this.argnames = argnames || [];
        this.poscount = poscount || 0;
        this.var_args = var_args || false;
        this.var_kwargs = var_kwargs || false;
    },

    parse_args: function (args, kwargs, defaults, namespace) {
        args = args || [];
        kwargs = kwargs || {};

        var result, index, name, length;
        if (!namespace) {
            result = [];
        }

        for (index = 0; index < this.poscount; index++) {
            name = this.argnames[index];
            if (args[index]) {
                if (name in kwargs) {
                    raise(TypeError, 'multiple values for positional argument \'' + name + '\'');
                }
                if (namespace) {
                    namespace[name] = args[index];
                } else {
                    result.push(args[index]);
                }
            } else if (name in kwargs) {
                if (namespace) {
                    namespace[name] = kwargs[name];
                } else {
                    result.push(kwargs[name]);
                }
                delete kwargs[name];
            } else if (defaults && name in defaults) {
                if (namespace) {
                    namespace[name] = defaults[name];
                } else {
                    result.push(defaults[name]);
                }
            } else {
                raise(TypeError, 'missing positional argument \'' + name + '\'');
            }
        }
        if (this.var_args) {
            if (namespace) {
                namespace[this.argnames[index]] = args.slice(this.poscount);
            } else {
                result.push(args.slice(this.poscount));
            }
            index++;
        } else if (index < args.length) {
            raise(TypeError, 'too many positional arguments');
        }

        length = this.argnames.length;
        if (this.var_kwargs) {
            length--;
        }
        for (; index < length; index++) {
            name = this.argnames[index];
            if (name in kwargs) {
                if (namespace) {
                    namespace[name] = kwargs[name];
                } else {
                    result.push(kwargs[name]);
                }
                delete kwargs[name];
            } else if (defaults && name in defaults) {
                if (namespace) {
                    namespace[name] = defaults[name];
                } else {
                    result.push(defaults[name]);
                }
            } else {
                raise(TypeError, 'missing keyword argument \'' + name + '\'');
            }
        }
        if (this.var_kwargs) {
            if (namespace) {
                namespace[this.argnames[index]] = kwargs;
            } else {
                result.push(kwargs);
            }
        } else {
            for (name in kwargs) {
                if (kwargs.hasOwnProperty(name)) {
                    raise(TypeError, 'unknown keyword argument \'' + name + '\'');
                }
            }
        }

        return result;
    },

    toString: function () {
        var argnames;

        if (!this.var_args && !this.var_kwargs) {
            return this.argnames.join(',');
        }
        argnames = new Array(this.argnames);
        if (this.var_args) {
            argnames[this.poscount] = '*' + argnames[this.poscount];
        }
        if (this.var_kwargs) {
            argnames[argnames.length - 1] = '**' + argnames[argnames.length - 1];
        }

        return argnames.join(',');
    }
});

Signature.from_spec = function (spec) {
    var index, name, star_args, star_kwargs;
    var poscount = 0;
    var argnames = [];

    for (index = 0; index < spec.length; index++) {
        name = spec[index];
        if (name.indexOf('**') == 0) {
            if (index != spec.length - 1) {
                raise(TypeError, 'invalid native signature specification');
            }
            name = name.substring(2);
            star_kwargs = true;
        } else if (name.indexOf('*') == 0) {
            if (star_args) {
                raise(TypeError, 'invalid native signature specification');
            }
            name = name.substring(1);
            star_args = true;
        } else if (!star_args) {
            poscount++;
        }
        argnames.push(name);
    }

    return new Signature(argnames, poscount, star_args, star_kwargs);
};

Signature.from_python = function (varnames, argcount, kwargcount, flags) {
    var index;
    var argnames = [];
    var var_args = (flags & CODE_FLAGS.STAR_ARGS) != 0;
    var var_kwargs = (flags & CODE_FLAGS.STAR_KWARGS) != 0;

    for (index = 0; index < argcount; index++) {
        argnames.push(varnames[index]);
    }
    if (var_args) {
        argnames.push(varnames[argcount + kwargcount]);
    }
    for (; index < argcount + kwargcount; index++) {
        argnames.push(varnames[index]);
    }
    if (var_kwargs) {
        argnames.push(varnames[argcount + kwargcount + 1]);
    }

    return new Signature(argnames, argcount, var_args, var_kwargs);
};


var Code = PyObject.extend({
    constructor: function (signature, options) {
        PyObject.call(this, py_code);

        this.signature = signature;

        options = options || {};

        this.name = options.name || '<unknown>';
        this.filename = options.filename || '<unknown>';

        this.flags = options.flags || 0;
    },

    parse_args: function (args, kwargs, defaults, namespace) {
        return this.signature.parse_args(args, kwargs, defaults, namespace);
    }
});


var PythonCode = Code.extend({
    constructor: function (bytecode, options) {
        this.bytecode = bytecode;

        options = options || {};
        options.flags = (options.flags || 0) | CODE_FLAGS.PYTHON;
        options.name = options.name || '<module>';
        options.filename = options.filename || '<string>';

        this.names = options.names || [];
        this.varnames = options.varnames || [];
        this.freevars = options.freevars || [];
        this.cellvars = options.cellvars || [];

        this.argcount = options.argcount || 0;
        this.kwargcount = options.kwargcount || 0;

        Code.call(this, Signature.from_python(this.varnames, this.argcount, this.kwargcount, options.flags), options);

        this.constants = options.constants || [];

        this.firstline = options.firstline || 1;
        this.lnotab = options.lnotab || '';

        this.instructions = disassemble(this);
    },

    get_line_number: function (position) {
        if (position < 0) {
            return 0;
        }

        var index, offset_increment, line_increment;
        var address = this.instructions[position].start;
        var line_number = this.firstline;
        var offset = 0;

        for (index = 0; index < this.lnotab.length; index++) {
            offset_increment = this.lnotab.charCodeAt(index++);
            line_increment = this.lnotab.charCodeAt(index);
            offset += offset_increment;
            if (offset > address) {
                break;
            }
            line_number += line_increment;
        }

        return line_number;
    }
});

var NativeCode = Code.extend({
    constructor: function (func, options, spec) {
        this.func = func;

        options = options || {};
        options.flags = (options.flags || 0) | CODE_FLAGS.NATIVE;
        options.name = options.name || func.name;
        options.filename = options.filename || '<native>';

        Code.call(this, Signature.from_spec(spec), options);

        this.simple = func.length == this.signature.argnames.length;
    }
});


$.Signature = Signature;

$.Code = Code;
$.PythonCode = PythonCode;
$.NativeCode = NativeCode;
