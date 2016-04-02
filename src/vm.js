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


var vm = {
    frame: null,

    return_value: None,
    last_exception: null,

    simple_depth: 0
};


function suspend() {
    if (vm.simple_depth != 0) {
        raise(RuntimeError, 'unable to suspend interpreter within simple native frame');
    } else {
        // << if ENABLE_THREADING
            threading.drop();
        // -- else
            vm.frame = null;
        // >>
    }
}


function resume(object, args, kwargs) {
    if (vm.frame) {
        raise(RuntimeError, 'interpreter is already running');
    }

    if (object instanceof PyObject) {
        call(object, args, kwargs);
        // << if ENABLE_THREADING
            vm.frame.thread = new Thread(vm.frame);
            vm.frame.thread.enqueue();
            vm.frame = null;
        // >>
    } else if (object instanceof Frame) {
        // << if ENABLE_THREADING
            object.thread.enqueue();
        // -- else
            vm.frame = object;
        // >>
    } else {
        raise(TypeError, 'invalid type of object to resume to');
    }

    // << if ENABLE_THREADING
        threading.resume();
    // -- else
        return run();
    // >>
}


function run() {
    var frame, state;

    while (vm.frame) {
        frame = vm.frame;
        state = frame.execute();
        if (state != undefined) {
            frame.set_state(state);
        }
    }

    // << if not ENABLE_THREADING
        if (vm.return_value) {
            return vm.return_value;
        } else {
            console.error('An unhandled Exception occurred during execution!');
        }
    // >>
}


function main(module, argv) {
    if (vm.frame) {
        raise(RuntimeError, 'interpreter is already running');
    }
    if (!(module instanceof PythonModule)) {
        raise(TypeError, 'invalid type of main module');
    }

    // << if ENABLE_THREADING
        if (threading.main.frame) {
            raise(RuntimeError, 'main thread is already running');
        }
    // >>

    get_namespace('sys')['argv'] = new PyList((['<python>'].concat(argv || []).map(pack_str)));
    register_module('__main__', module);

    module.dict['__name__'] = pack_str('__main__');

    vm.frame = new PythonFrame(module.code, {
        builtins: builtins,
        locals: module.dict,
        globals: module.dict
    });

    // << if ENABLE_THREADING
        vm.frame.thread = threading.main;
        vm.frame.thread.frame = vm.frame;

        vm.frame.thread.return_value = None;
        vm.frame.thread.last_exception = null;

        vm.frame.thread.enqueue();

        threading.resume();
    // -- else
        return run();
    // >>
}


function call(object, args, kwargs, defaults, closure, globals, namespace) {
    var code, result;

    while (true) {
        if (object instanceof Frame) {
            vm.frame = object;
            // << if ENABLE_DEBUGGER
                debugging.trace_call(vm.frame);
            // >>
            return vm.frame;
        } else if (object instanceof PythonCode) {
            if ((object.flags & CODE_FLAGS.GENERATOR) != 0) {
                vm.return_value = new PyGenerator(object, new PythonFrame(object, {
                    back: null, defaults: defaults, args: args, kwargs: kwargs,
                    globals: globals, closure: closure, namespace: namespace
                }));
                return null;
            } else {
                vm.frame = new PythonFrame(object, {
                    back: vm.frame, defaults: defaults, args: args, kwargs: kwargs,
                    globals: globals, closure: closure, namespace: namespace
                });
                // << if ENABLE_DEBUGGER
                    debugging.trace_call(vm.frame);
                // >>
                return vm.frame;
            }
        } else if (object instanceof NativeCode) {
            if (object.simple) {
                vm.simple_depth++;
                try {
                    result = object.func.apply(null, object.parse_args(args, kwargs, defaults));
                    vm.return_value = result || None;
                } catch (error) {
                    if (error instanceof PyObject) {
                        raise(error.cls, error, null, true);
                    } else {
                        raise(JSError, pack_error(error), null, true);
                    }
                } finally {
                    vm.simple_depth--;
                }
                return null;
            } else {
                vm.frame = new NativeFrame(object, {
                    back: vm.frame, defaults: defaults, args: args, kwargs: kwargs,
                    globals: globals, closure: closure, namespace: namespace
                });
                // << if ENABLE_DEBUGGER
                    debugging.trace_call(vm.frame);
                // >>
                return vm.frame;
            }
        } else if (object instanceof PyFunction) {
            closure = object.closure;
            globals = object.globals;
            defaults = object.defaults;
            object = object.code;
        } else if (object instanceof PyMethod) {
            args = [object.self].concat(args);
            object = object.func;
        } else if (object instanceof PyObject) {
            result = object.call('__call__', args, kwargs);
            if (except(MethodNotFoundError)) {
                raise(TypeError, object.cls.name + ' object is not callable', null, true);
                return null;
            } else {
                return result;
            }
        } else if (object instanceof PythonModule) {
            vm.frame = new PythonFrame(object.code, {
                back: vm.frame, locals: object.dict, globals: object.dict
            });
            return vm.frame;
        } else {
            raise(TypeError, 'invalid low level callable \'' + object + '\'', null, true);
        }
    }
}


function raise(exc_type, exc_value, exc_tb, suppress) {
    var frame, next_tb;

    if (!vm.frame) {
        error(exc_value);
    }

    if (typeof exc_value == 'string') {
        exc_value = make_exception(exc_type, exc_value);
    }

    exc_value.context = vm.return_value === null ? vm.last_exception.exc_value : None;

    vm.return_value = null;

    if (!exc_tb) {
        frame = vm.frame;
        while (frame) {
            exc_tb = new PyTraceback(frame, frame.position - 1, frame.get_line_number(), exc_tb);
            frame = frame.back;
        }
    }

    exc_value.traceback = exc_tb;

    // << if DEBUG_EXCEPTIONS
        print_exception(exc_value);
    // >>

    vm.last_exception = {exc_type: exc_type, exc_value: exc_value, exc_tb: exc_tb};

    // << if ENABLE_DEBUGGER
        debugging.trace_raise(exc_type, exc_value, exc_tb);
    // >>

    if ((vm.frame instanceof NativeFrame || vm.simple_depth > 0) && !suppress) {
        throw exc_value;
    } else {
        return exc_value;
    }
}


function except(exc_type) {
    if (!vm.return_value && issubclass(vm.last_exception.exc_type, exc_type)) {
        vm.return_value = None;
        return true;
    }
    return false;
}


$.vm = vm;

$.suspend = suspend;
$.resume = resume;
$.main = main;
$.call = call;
$.raise = raise;
$.except = except;
