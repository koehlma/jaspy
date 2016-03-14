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

var py_object = PyType.native('object', []);
var py_type = PyType.native('type', [py_object]);

py_object.cls = py_type;
py_type.cls = py_type;

var py_dict = PyType.native('dict');

var py_int = PyType.native('int');
var py_bool = PyType.native('bool', [py_int]);

var py_float = PyType.native('float');

var py_str = PyType.native('str');
var py_bytes = PyType.native('bytes');

var py_tuple = PyType.native('tuple');

var py_code = PyType.native('code');

var py_list = PyType.native('list');

var py_cell = PyType.native('cell');
var py_frame = PyType.native('frame');

var py_js_object = PyType.native('JSObject');
var py_js_array = PyType.native('JSArray');
var py_js_function = PyType.native('JSFunction');

var py_traceback = PyType.native('traceback');

var py_function = PyType.native('function');
var py_method = PyType.native('method');
var py_generator = PyType.native('generator');

var py_set = PyType.native('set');
var py_frozenset = PyType.native('frozenset');

var py_classmethod = PyType.native('classmethod');
var py_staticmethod = PyType.native('staticmethod');

var py_module = PyType.native('ModuleType');

var py_property = PyType.native('property');

var py_slice = PyType.native('slice');

var None = new PyObject(PyType.native('NoneType'));
var NotImplemented = new PyObject(PyType.native('NotImplemented'));
var Ellipsis = new PyObject(PyType.native('Ellipsis'));

var False = new PyInt(0, py_bool);
var True = new PyInt(1, py_bool);

var BaseException = PyType.native('BaseException');
var Exception = new PyType('Exception', [BaseException]);
var ValueError = new PyType('ValueError', [Exception]);
var ArithmeticError = new PyType('ArithmeticError', [Exception]);
var LookupError = new PyType('LookupError', [Exception]);
var RuntimeError = new PyType('RuntimeError', [Exception]);
var BufferError = new PyType('BufferError', [Exception]);
var AssertionError = new PyType('AssertionError', [Exception]);
var AttributeError = new PyType('AttributeError', [Exception]);
var EOFError = new PyType('EOFError', [Exception]);
var FloatingPointError = new PyType('FloatingPointError', [ArithmeticError]);
var GeneratorExit = new PyType('GeneratorExit', [BaseException]);
var ImportError = new PyType('ImportError', [Exception]);
var IndexError = new PyType('IndexError', [LookupError]);
var KeyError = new PyType('KeyError', [Exception]);
var KeyboardInterrupt = new PyType('KeyboardInterrupt', [BaseException]);
var MemoryError = new PyType('MemoryError', [Exception]);
var NameError = new PyType('NameError', [Exception]);
var NotImplementedError = new PyType('NotImplementedError', [RuntimeError]);
var OSError = new PyType('OSError', [Exception]);
var OverflowError = new PyType('OverflowError', [Exception]);
var RecursionError = new PyType('RecursionError', [RuntimeError]);
var ReferenceError = new PyType('ReferenceError', [Exception]);
var StopIteration = new PyType('StopIteration', [Exception]);
var SyntaxError = new PyType('SyntaxError', [Exception]);
var IndentationError = new PyType('IndentationError', [SyntaxError]);
var TabError = new PyType('TabError', [IndentationError]);
var SystemError = new PyType('SystemError', [Exception]);
var SystemExit = new PyType('SystemExit', [BaseException]);
var TypeError = new PyType('TypeError', [Exception]);
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
    exc_value: new_exception(MethodNotFoundError, 'method not found'),
    exc_tb: None
};

var UnpackError = new PyType('UnpackError', [TypeError]);
var PackError = new PyType('PackError', [TypeError]);

var JSError = new PyType('JSError', [Exception]);

var ZERO = new PyInt(0);
var ONE = new PyInt(1);

var EMPTY_TUPLE = new PyTuple([]);
