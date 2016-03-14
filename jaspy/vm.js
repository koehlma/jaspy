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

var vm = {};

vm.frame = null;

vm.return_value = None;
vm.last_exception = null;

vm.simple_depth = 0;

function suspend() {
    if (vm.simple_depth != 0) {
        raise(RuntimeError, 'unable to suspend interpreter within a simple native frame');
    } else {
        vm.frame = null;
    }
}

function resume(object, args, kwargs) {
    if (vm.frame) {
        raise(RuntimeError, 'interpreter is already running');
    }

    if (object instanceof PyObject) {
        call(object, args, kwargs);
    } else if (object instanceof Frame) {
        vm.frame = object;
    } else {
        raise(TypeError, 'invalid type of object to resume to');
    }

    return run();
}

function except(exc_type) {
    if (!vm.return_value && issubclass(vm.last_exception.exc_type, exc_type)) {
        vm.return_value = None;
        return true;
    }
    return false;
}

function raise(exc_type, exc_value, exc_tb) {
    var frame;

    if (!vm.frame) {
        error(exc_value);
    }

    if (typeof exc_value == 'string') {
        exc_value = new_exception(exc_type, exc_value);
    }

    if (vm.return_value === null) {
        exc_value.dict['__context__'] = vm.last_exception.exc_value;
    }
    vm.return_value = null;

    // TODO: create an traceback object
    if (!exc_tb) {
        if (TRACEBACK_ON_EXCEPTION) {
            var message = [];
            frame = vm.frame;
            while (frame) {
                message.push('    File "' + frame.code.filename + '", line ' + frame.get_line_number() + ', in ' + frame.code.name);
                frame = frame.back;
            }
            message.push('Traceback (most recent call last):');
            message = message.reverse();
            if (exc_value.getattr('args') instanceof PyTuple && exc_value.getattr('args').array[0] instanceof PyStr) {
                message.push(exc_type.name + ': ' + exc_value.getattr('args').array[0]);
            } else {
                message.push(exc_type.name);
            }
            console.error(message.join('\n'));
        }
        exc_tb = None;
        exc_value.dict['__traceback__'] = exc_tb;
    }

    vm.last_exception = {exc_type: exc_type, exc_value: exc_value, exc_tb: exc_tb};

    if (vm.frame instanceof NativeFrame || vm.simple_depth > 0) {
        throw exc_value;
    }
}

function run() {
    while (vm.frame) {
        vm.frame.run();
    }
    if (vm.return_value) {
        return vm.return_value;
    } else {
        console.error('An unhandled Exception occoured during execution!');
    }
}

function main(module, argv) {
    if (vm.frame) {
        raise(RuntimeError, 'interpreter is already running');
    }
    if (!(module instanceof PythonModule)) {
        raise(TypeError, 'invalid type of module');
    }
    get_namespace('sys')['argv'] = new PyList((argv || ['']).map(pack_str));
    register_module('__main__', module);
    module.dict['__name__'] = pack_str('__main__');
    vm.frame = new PythonFrame(module.code, {
        builtins: builtins, locals: module.dict,
        globals: module.dict
    });
    return run();
}

function call(object, args, kwargs, defaults, closure, globals, namespace) {
    var code, result, frame;
    while (true) {
        if (object instanceof PythonCode) {
            if ((object.flags & CODE_FLAGS.GENERATOR) != 0) {
                vm.return_value = new PyGenerator(object, new PythonFrame(object, {
                    back: null, defaults: defaults, args: args, kwargs: kwargs,
                    closure: closure, namespace: namespace
                }));
                return null;
            }
            frame = new PythonFrame(object, {
                vm: vm, back: vm.frame, defaults: defaults,
                args: args, kwargs: kwargs, closure: closure,
                globals: globals, namespace: namespace
            });
            vm.frame = frame;
            if (vm.frame.run()) {
                return frame;
            } else {
                return null;
            }
        } else if (object instanceof NativeCode) {
            if (object.simple) {
                args = object.parse_args(args, kwargs, defaults);
                vm.simple_depth++;
                try {
                    result = object.func.apply(null, args);
                    vm.return_value = result || None;
                } catch (error) {
                    if (error instanceof PyObject) {
                        raise(error.cls, error);
                        vm.frame = vm.frame.back;
                    } else {
                        throw error;
                    }
                } finally {
                    vm.simple_depth--;
                }
                return null;
            } else {
                vm.frame = frame = new NativeFrame(object, {
                    back: vm.frame, defaults: defaults,
                    args: args, kwargs: kwargs
                });
                try {
                    result = object.func.apply(null, vm.frame.args.concat([frame.state, frame]));
                    if (result == undefined || result instanceof PyObject) {
                        if (vm.return_value) {
                            vm.return_value = result || None;
                        }
                        vm.frame = frame.back;
                        return null;
                    } else {
                        frame.state = result;
                        return frame;
                    }
                } catch (error) {
                    if (error instanceof PyObject) {
                        vm.frame = vm.frame.back;
                        return null;
                    } else {
                        vm.frame = vm.frame.back;
                        raise(RuntimeError, '[' + error.name + '] ' + error.message);
                        return null;
                    }
                }
            }
        } else if (object instanceof PyFunction) {
            code = object.code;
            closure = object.closure;
            globals = object.globals;
            if (code instanceof Code) {
                defaults = object.defaults;
                object = code;
                if (closure instanceof PyTuple) {
                    closure = closure.value;
                }
            } else {
                raise(TypeError, 'invalid type of function code')
                return null;
            }
        } else if (object instanceof PyMethod) {
            args = [object.self].concat(args);
            object = object.func;
        } else if (object instanceof PyObject) {
            result = object.call('__call__', args, kwargs);
            if (except(MethodNotFoundError)) {
                raise(TypeError, object.cls.name + ' object is not callable');
                return null;
            }
            return result;
        } else if (object instanceof PythonModule) {
            vm.frame = new PythonFrame(object.code, {
                locals: object.dict,
                globals: object.dict, back: vm.frame
            });
            return vm.frame;
        } else {
            error('invalid callable ' + object);
        }
    }
}


$.vm = vm;

$.suspend = suspend;
$.resume = resume;
$.main = main;
$.call = call;
