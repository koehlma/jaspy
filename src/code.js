function Signature(argnames, poscount, star_args, star_kwargs) {
    this.argnames = argnames || [];
    this.poscount = poscount == undefined ? this.argnames.length : poscount;
    this.star_args = star_args || false;
    this.star_kwargs = star_kwargs || false;
}
Signature.prototype.parse = function (args, kwargs, defaults, namespace) {
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
    if (this.star_args) {
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
    if (this.star_kwargs) {
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
    if (this.star_kwargs) {
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
};

function native_signature(signature) {
    var index, name, star_args, star_kwargs;
    var poscount = 0;
    var argnames = [];

    for (index = 0; index < signature.length; index++) {
        name = signature[index];
        if (name.indexOf('**') == 0) {
            if (index != signature.length - 1) {
                raise(TypeError, 'invalid native signature');
            }
            name = name.substring(2);
            star_kwargs = true;
        } else if (name.indexOf('*') == 0) {
            if (star_args) {
                raise(TypeError, 'invalid native signature');
            }
            name = name.substring(1);
            star_args = true;
        } else if (!star_args) {
            poscount++;
        }
        argnames.push(name);
    }

    return new Signature(argnames, poscount, star_args, star_kwargs);
}

function python_signature(varnames, argcount, kwargcount, flags) {
    var index;
    var argnames = [];
    var star_args = (flags & CODE_FLAGS.STAR_ARGS) != 0;
    var star_kwargs = (flags & CODE_FLAGS.STAR_KWARGS) != 0;

    for (index = 0; index < argcount; index++) {
        argnames.push(varnames[index]);
    }
    if (star_args) {
        argnames.push(varnames[argcount + kwargcount + 1]);
    }
    for (; index < argcount + kwargcount; index++) {
        argnames.push(varnames[index]);
    }
    if (star_kwargs) {
        argnames.push(varnames[argcount + kwargcount + 1]);
    }
    return new Signature(argnames, argcount, star_args, star_kwargs);
}


function Code(signature, options) {
    this.signature = signature;

    options = options || {};

    this.name = options.name || '<unknown>';
    this.filename = options.filename || '<unknown>';

    this.flags = options.flags || 0;
}
Code.prototype.parse_args = function (args, kwargs, defaults, namespace) {
    return this.signature.parse(args, kwargs, defaults, namespace);
};

function PythonCode(bytecode, options) {
    var signature;

    this.bytecode = bytecode;

    options = options || {};
    options.flags = (options.flags || 0) | CODE_FLAGS.PYTHON;
    options.name = options.name || '<module>';

    this.names = options.names || [];
    this.varnames = options.varnames || [];
    this.freevars = options.freevars || [];
    this.cellvars = options.cellvars || [];

    this.argcount = options.argcount || 0;
    this.kwargcount = options.kwargcount || 0;

    signature = python_signature(this.varnames, this.argcount, this.kwargcount, options.flags);

    Code.call(this, signature, options);

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

    Code.call(this, native_signature(signature), options);

    this.simple = func.length == this.signature.argnames.length;
}
NativeCode.prototype = new Code;
NativeCode.prototype.get_line_number = function (position) {
    return position;
};