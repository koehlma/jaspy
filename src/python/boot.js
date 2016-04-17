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


var py_bool = PyType.native('bool', [Int.cls]);

var py_js_object = PyType.native('JSObject');
var py_js_array = PyType.native('JSArray', [py_js_object]);
var py_js_function = PyType.native('JSFunction', [py_js_object]);

var py_traceback = PyType.native('traceback');

var py_set = PyType.native('set');
var py_frozenset = PyType.native('frozenset');

var py_classmethod = PyType.native('classmethod');
var py_staticmethod = PyType.native('staticmethod');

var py_module = PyType.native('ModuleType');

var None = new PyObject(PyType.native('NoneType'));
var NotImplemented = new PyObject(PyType.native('NotImplemented'));
var Ellipsis = new PyObject(PyType.native('Ellipsis'));

var False = new Int(0, py_bool);
var True = new Int(1, py_bool);

var py_base_exception = PyType.native('BaseException');
var py_exception = new PyType('Exception', [py_base_exception]);
var ValueError = new PyType('ValueError', [py_exception]);
var ArithmeticError = new PyType('ArithmeticError', [py_exception]);
var LookupError = new PyType('LookupError', [py_exception]);
var RuntimeError = new PyType('RuntimeError', [py_exception]);
var BufferError = new PyType('BufferError', [py_exception]);
var AssertionError = new PyType('AssertionError', [py_exception]);
var AttributeError = new PyType('AttributeError', [py_exception]);
var EOFError = new PyType('EOFError', [py_exception]);
var FloatingPointError = new PyType('FloatingPointError', [ArithmeticError]);
var GeneratorExit = new PyType('GeneratorExit', [py_base_exception]);
var ImportError = new PyType('ImportError', [py_exception]);
var IndexError = new PyType('IndexError', [LookupError]);
var KeyError = new PyType('KeyError', [py_exception]);
var KeyboardInterrupt = new PyType('KeyboardInterrupt', [py_base_exception]);
var MemoryError = new PyType('MemoryError', [py_exception]);
var NameError = new PyType('NameError', [py_exception]);
var NotImplementedError = new PyType('NotImplementedError', [RuntimeError]);
var OSError = new PyType('OSError', [py_exception]);
var OverflowError = new PyType('OverflowError', [py_exception]);
var RecursionError = new PyType('RecursionError', [RuntimeError]);
var ReferenceError = new PyType('ReferenceError', [py_exception]);
var StopIteration = new PyType('StopIteration', [py_exception]);
var SyntaxError = new PyType('SyntaxError', [py_exception]);
var IndentationError = new PyType('IndentationError', [SyntaxError]);
var TabError = new PyType('TabError', [IndentationError]);
var SystemError = new PyType('SystemError', [py_exception]);
var SystemExit = new PyType('SystemExit', [py_base_exception]);
var TypeError = new PyType('TypeError', [py_exception]);
var UnboundLocalError = new PyType('UnboundLocalError', [NameError]);
var UnicodeError = new PyType('UnicodeError', [ValueError]);
var UnicodeEncodeError = new PyType('UnicodeEncodeError', [UnicodeError]);
var UnicodeDecodeError = new PyType('UnicodeDecodeError', [UnicodeError]);
var UnicodeTranslateError = new PyType('UnicodeTranslateError', [UnicodeError]);
var ZeroDivisionError = new PyType('ZeroDivisionError', [ArithmeticError]);
var EnvironmentError = OSError;
var IOError = OSError;

var BlockingIOError = new PyType('BlockingIOError', [OSError]);
var ChildProcessError = new PyType('ChildProcessError', [OSError]);
var BrokenPipeError = new PyType('BrokenPipeError', [OSError]);
var ConnectionError = new PyType('ConnectionError', [OSError]);
var ConnectionAbortedError = new PyType('ConnectionAbortedError', [ConnectionError]);
var ConnectionRefusedError = new PyType('ConnectionRefusedError', [ConnectionError]);
var ConnectionResetError = new PyType('ConnectionResetError', [ConnectionError]);
var FileExistsError = new PyType('FileExistsError', [OSError]);
var FileNotFoundError = new PyType('FileNotFoundError', [OSError]);
var InterruptedError = new PyType('InterruptedError', [OSError]);
var IsADirectoryError = new PyType('IsADirectoryError', [OSError]);
var NotADirectoryError = new PyType('NotADirectoryError', [OSError]);
var PermissionError = new PyType('PermissionError', [OSError]);
var ProcessLookupError = new PyType('ProcessLookupError', [OSError]);
var TimeoutError = new PyType('TimeoutError', [OSError]);

var MethodNotFoundError = new PyType('MethodNotFoundError', [TypeError]);
var METHOD_NOT_FOUND = {
    exc_type: MethodNotFoundError,
    exc_value: make_exception(MethodNotFoundError, 'method not found'),
    exc_tb: None
};

var UnpackError = new PyType('UnpackError', [TypeError]);
var PackError = new PyType('PackError', [TypeError]);

var JSError = new PyType('JSError', [py_exception]);

var ZERO = new Int(0);
var ONE = new Int(1);

var EMPTY_TUPLE = new Tuple([]);
