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

var build_class = $def(function (func, name, bases, metaclass, keywords, state, frame) {
    var possible_meta_classes, index, good, bases;
    if (!(func.cls == py_function)) {
        raise(TypeError, 'invalid type of \'func\' argument');
    }
    if (!(name instanceof Str)) {
        raise(TypeError, 'invalid type of \'name\' argument');
    }
    if (!(bases instanceof Array)) {
        raise(TypeError, 'invalid type of \'bases\' argument');
    }
    switch (state) {
        case 0:
            if (metaclass === None && bases.length == 0) {
                frame.metaclass = py_type;
            } else if (!(metaclass instanceof PyType)) {
                frame.metaclass = metaclass;
            } else {
                possible_meta_classes = [];
                if (metaclass !== None) {
                    possible_meta_classes.push(metaclass);
                }
                for (index = 0; index < bases.length; index++) {
                    if (bases.value[index] instanceof PyType) {
                        possible_meta_classes.push(bases[index].cls)
                    } else {
                        raise(TypeError, 'invalid type of base');
                    }
                }
                for (index = 0; index < possible_meta_classes.length; index++) {
                    good = true;
                    possible_meta_classes.forEach(function (meta_class) {
                        if (!issubclass(possible_meta_classes[index], meta_class)) {
                            good = false;
                        }
                    });
                    if (good) {
                        break;
                    }
                }
                if (good) {
                    frame.metaclass = possible_meta_classes[index];
                } else {
                    raise(TypeError, 'unable to determine most derived metaclass');
                }
            }
            if (frame.metaclass.call_classmethod('__prepare__', [pack_tuple(bases)], keywords)) {
                return 1;
            }
        case 1:
            if (!vm.return_value) {
                return null;
            }
            frame.dict = vm.return_value;
            if (call(func, undefined, undefined, undefined, undefined, undefined, frame.dict)) {
                return 2;
            }
        case 2:
            if (!vm.return_value) {
                return null;
            }
            if (bases.length == 0) {
                bases = [py_object];
            } else {
                bases = bases.value;
            }
            if (frame.metaclass.cls.call('__call__', [name, pack_tuple(bases), frame.dict], keywords)) {
                return 3;
            }
        case 3:
            if (!vm.return_value) {
                return null;
            }
            return vm.return_value;
    }
}, ['func', 'name', '*bases', 'metaclass', '**keywords'], {
    name: '__build_class__',
    defaults: {'metaclass': None}
});

var builtins = {
    object: py_object,
    type: py_type,
    dict: py_dict,
    int: py_int,
    float: py_float,
    str: py_str,
    bytes: py_bytes,
    tuple: py_tuple,

    None: None,
    NotImplemented: NotImplemented,
    Ellipsis: Ellipsis,
    False: False,
    True: True,

    BaseException: py_base_exception,
    Exception: py_exception,
    ValueError: ValueError,
    ArithmeticError: ArithmeticError,
    LookupError: LookupError,
    RuntimeError: RuntimeError,
    BufferError: BufferError,
    AssertionError: AssertionError,
    AttributeError: AttributeError,
    EOFError: EOFError,
    FloatingPointError: FloatingPointError,
    GeneratorExit: GeneratorExit,
    ImportError: ImportError,
    IndexError: IndexError,
    KeyError: KeyError,
    KeyboardInterrupt: KeyboardInterrupt,
    MemoryError: MemoryError,
    NameError: NameError,
    NotImplementedError: NotImplementedError,
    OSError: OSError,
    OverflowError: OverflowError,
    RecursionError: RecursionError,
    ReferenceError: ReferenceError,
    StopIteration: StopIteration,
    SyntaxError: SyntaxError,
    IndentationError: IndentationError,
    TabError: TabError,
    SystemError: SystemError,
    SystemExit: SystemExit,
    TypeError: TypeError,
    UnboundLocalError: UnboundLocalError,
    UnicodeError: UnicodeError,
    UnicodeEncodeError: UnicodeEncodeError,
    UnicodeDecodeError: UnicodeDecodeError,
    UnicodeTranslateError: UnicodeTranslateError,
    ZeroDivisionError: ZeroDivisionError,
    EnvironmentError: EnvironmentError,
    BlockingIOError: BlockingIOError,
    ChildProcessError: ChildProcessError,
    BrokenPipeError: BrokenPipeError,
    ConnectionError: ConnectionError,
    ConnectionAbortedError: ConnectionAbortedError,
    ConnectionRefusedError: ConnectionRefusedError,
    ConnectionResetError: ConnectionResetError,
    FileExistsError: FileExistsError,
    FileNotFoundError: FileNotFoundError,
    InterruptedError: InterruptedError,
    IsADirectoryError: IsADirectoryError,
    NotADirectoryError: NotADirectoryError,
    PermissionError: PermissionError,
    ProcessLookupError: ProcessLookupError,
    TimeoutError: TimeoutError,

    __build_class__: build_class
};


var module_builtins = module('builtins', function ($, module) {
    module.dict = builtins;
});

module('js', function ($, module) {
    module.$set('JSError', JSError);
    module.$set('window', pack(window));
    module.$set('document', pack(document));
});

module_builtins.$def('__import__', function (name, globals, locals, fromlist, level, state, frame) {
    name = unpack_str(name);
    switch (state) {
        case 0:
            if (level.gt(ZERO)) {
                raise(ImportError, 'relative imports are not supported')
            }
            if (!(name in modules)) {
                raise(ImportError, 'unable to import module ' + name);
            }
            if (modules[name] instanceof NativeModule) {
                return new PyModule(modules[name].dict);
            }
            if (modules[name].wrapper) {
                return modules[name].wrapper;
            }
            if (call(modules[name])) {
                return 1;
            }
        case 1:
            var module = new PyModule(modules[name].dict);
            modules[name].wrapper = module;
            return module;
    }
}, ['name', 'globals', 'locals', 'fromlist', 'level'], {defaults: {
    'globals': None, 'locals': None, 'fromlist': EMPTY_TUPLE, 'level': ZERO
}});

module_builtins.$def('print', function (objects, sep, end, file, flush, state, frame) {
    var object;
    while (true) {
        switch (state) {
            case 0:
                frame.strings = [];
                frame.index = 0;
                if (objects.length) {
                    object = objects[0];
                    if (object.cls === py_str) {
                        vm.return_value = object;
                    } else if (object.call('__str__')) {
                        return 1;
                    }
                    state = 1;
                } else {
                    state = 2;
                    break;
                }
            case 1:
                if (!vm.return_value) {
                    return null;
                }
                frame.strings.push(unpack_str(vm.return_value));
                frame.index++;
                if (frame.index < objects.length) {
                    object = objects[frame.index];
                    if (object.cls == py_str) {
                        vm.return_value = object;
                    } else if (object.call('__str__')) {
                        return 1;
                    }
                    break;
                }
            case 2:
                if (sep.cls == py_str) {
                    vm.return_value = sep;
                } else if (sep.call('__str__')) {
                    return 3;
                }
            case 3:
                if (!vm.return_value) {
                    return null;
                }
                console.log(frame.strings.join(unpack_str(vm.return_value)));
                return null;
        }
    }
}, ['*objects', 'sep', 'end', 'file', 'flush'], {
    defaults: {sep: pack_str(' '), end: pack_str('\n'), file: None, flush: False}
});

module_builtins.$def('len', function (object, state, frame) {
    switch (state) {
        case 0:
            if (object.call('__len__')) {
                return 1;
            }
        case 1:
            return vm.return_value;
    }

}, ['object']);

var getattr = module_builtins.$def('getattr', function (object, name, state, frame) {
    switch (state) {
        case 0:
            if (object.call('__getattribute__', [name])) {
                return 1;
            }
        case 1:
            if (vm.return_value) {
                return vm.return_value;
            }
            if (except(AttributeError) || except(MethodNotFoundError)) {
                if (object.call('__getattr__', [name])) {
                    return 2;
                }
            } else {
                return;
            }
        case 2:
            if (except(MethodNotFoundError)) {
                raise(TypeError, 'object does not support attribute access');
            }
            return vm.return_value;
    }
}, ['object', 'name']);



$.builtins = builtins;

$.None = None;
$.NotImplemented = NotImplemented;
$.Ellipsis = Ellipsis;
$.False = False;
$.True = True;
