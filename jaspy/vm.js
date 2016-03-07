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

function suspend() {
    vm.frame = null;
}

function resume(frame) {
    if (!(frame instanceof Frame)) {
        raise(TypeError, 'invalid type of object to resume from');
    }
    if (vm.frame) {
        raise(RuntimeError, 'interpreter is already running');
    }
    vm.frame = frame;
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


    if (typeof exc_value == 'string') {
        exc_value = new_exception(exc_type, exc_value);
    }

    if (vm.return_value === null) {
        exc_value.namespace['__context__'] = vm.last_exception.exc_value;
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
            if (exc_value.getattr('args') instanceof PyTuple && exc_value.getattr('args').value[0] instanceof PyStr) {
                message.push(exc_type.name + ': ' + exc_value.getattr('args').value[0].value);
            } else {
                message.push(exc_type.name);
            }
            console.error(message.join('\n'));
        }
        exc_tb = None;
        exc_value.namespace['__traceback__'] = exc_tb;
    }

    vm.last_exception = {exc_type: exc_type, exc_value: exc_value, exc_tb: exc_tb};

    if (vm.frame instanceof NativeFrame) {
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



function main(module) {
    if (vm.frame) {
        raise(RuntimeError, 'interpreter is already running');
    }
    if (!(module instanceof PythonModule)) {
        raise(TypeError, 'unable to run module native module');
    }
    register_module('__main__', module);
    module.namespace['__name__'] = pack_str('__main__');
    vm.frame = new PythonFrame(module.code, {
        builtins: builtins, locals: module.namespace,
        globals: module.namespace
    });
    return run();
}

function callback(object, args, kwargs) {
    call_object(object, args, kwargs);
    run();
}

function call_object(object, args, kwargs, defaults, closure, globals) {
    var code, result, frame;
    while (true) {
        if (object instanceof PythonCode) {
            vm.frame = new PythonFrame(object, {
                vm: vm, back: vm.frame, defaults: defaults,
                args: args, kwargs: kwargs, closure: closure,
                globals: globals, builtins: builtins
            });
            return true;
        } else if (object instanceof NativeCode) {
            if (object.simple) {
                args = object.parse_args(args, kwargs, defaults);
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
                }
                return false;
            } else {
                vm.frame = frame = new NativeFrame(object, {
                    back: vm.frame, defaults: defaults,
                    args: args, kwargs: kwargs
                });
                try {
                    result = object.func.apply(null, vm.frame.args.concat([frame.position, frame]));
                    if (result == undefined || result instanceof PyObject) {
                        if (vm.return_value) {
                            vm.return_value = result || None;
                        }
                        vm.frame = frame.back;
                        return false;
                    } else {
                        frame.position = result;
                        return true;
                    }
                } catch (error) {
                    if (error instanceof PyObject) {
                        vm.frame = vm.frame.back;
                        return false;
                    } else {
                        vm.frame = vm.frame.back;
                        raise(RuntimeError, '[' + error.name + '] ' + error.message);
                    }
                }
            }
        } else if (object.cls === py_function) {
            code = object.namespace['__code__'];
            closure = object.namespace['__closure__'];
            if (object.namespace['__globals__']) {
                globals = object.namespace['__globals__'].table;
            }

            if (code.cls === py_code) {
                defaults = object.defaults;
                object = code.value;
                if (closure instanceof PyTuple) {
                    closure = closure.value;
                }
            } else {
                raise(TypeError, 'invalid type of function code')
            }
        } else if (object instanceof PyMethod) {
            args = [object.self].concat(args);
            object = object.func;
        } else if (object instanceof PyObject) {
            result = object.call_method('__call__', args, kwargs);
            if (except(MethodNotFoundError)) {
                raise(TypeError, 'object is not callable');
            }
            return result;
        } else if (object instanceof PythonModule) {
            vm.frame = new PythonFrame(object.code, {
                builtins: builtins, locals: object.namespace,
                globals: object.namespace, back: vm.frame
            });
            return true;
        } else {
            error('invalid callable');
        }
    }
}


$.vm = vm;

$.suspend = suspend;
$.resume = resume;
$.callback = callback;
$.main = main;
