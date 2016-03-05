var build_class = new_native(function (func, name, bases, metaclass, keywords, state, frame) {
    var possible_meta_classes, index, good, bases;
    if (!(func.cls == py_function)) {
        raise(TypeError, 'invalid type of \'func\' argument');
    }
    if (!(name instanceof PyStr)) {
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
                        if (!possible_meta_classes[index].is_subclass_of(meta_class)) {
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
            if (frame.metaclass.call_classmethod('__prepare__', [new_tuple(bases)], keywords)) {
                return 1;
            }
        case 1:
            if (!vm.return_value) {
                return null;
            }
            frame.namespace = vm.return_value;
            assert(call_object(func));
            vm.frame.namespace = frame.namespace;
            return 2;
        case 2:
            if (!vm.return_value) {
                return null;
            }
            if (bases.length == 0) {
                bases = [py_object];
            } else {
                bases = bases.array;
            }
            if (frame.metaclass.cls.call_method('__call__', [name, new_tuple(bases), frame.namespace], keywords)) {
                return 3;
            }
        case 3:
            if (!vm.return_value) {
                return null;
            }
            return frame.cls;
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

    BaseException: BaseException,
    Exception: Exception,
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


var module_builtins = define_module('builtins', function ($, module) {
    module.namespace = builtins;
});

define_module('js', function ($, module) {
    return {
        'JSError': JSError
    }
});

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
                    } else if (str(object)) {
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
                    } else if (object.call_method('__str__')) {
                        return 1;
                    }
                    break;
                }
            case 2:
                if (sep.cls == py_str) {
                    vm.return_value = sep;
                } else if (sep.call_method('__str__')) {
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
    defaults: {sep: new_str(' '), end: new_str('\n'), file: None, flush: False}
});