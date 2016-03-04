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

window['jaspy'] = (function () {
    'use strict';

    // #include "constants.js"
    // #include "base.js"

    // #include "code.js"

    // #include "module.js"

    // #include "objects.js"

    // #include "py_object.js"
    // #include "py_type.js"
    // #include "py_dict.js"
    // #include "py_int.js"
    // #include "py_bool.js"
    // #include "py_float.js"
    // #include "py_str.js"
    // #include "py_function.js"
    // #include "py_method.js"
    // #include "py_property.js"
    // #include "py_module.js"
    // #include "py_none.js"

    // #include "py_builtins.js"

    // #include "frame.js"
    // #include "vm.js"

    // #include "loader.js"

    return {
        vm: vm,

        main: main,

        loader: loader,

        define_module: define_module,

        unpack_int: unpack_int,
        unpack_float: unpack_float,
        unpack_str: unpack_str,
        unpack_bytes: unpack_bytes,
        unpack_tuple: unpack_tuple,
        unpack_code: unpack_code,

        raise: raise,
        error: error,
        assert: assert,

        'builtins': builtins,

        'PyObject': PyObject,
        'PyType': PyType,
        'PyDict': PyDict,
        'PyInt': PyInt,
        'PyFloat': PyFloat,
        'PyStr': PyStr,
        'PyBytes': PyBytes,
        'PyTuple': PyTuple,
        'PyCode': PyCode,

        'new_int': new_int,
        'new_float': new_float,
        'new_str': new_str,
        'new_bytes': new_bytes,
        'new_tuple': new_tuple,
        'new_code': new_code,

        'None': None,
        'NotImplemented': NotImplemented,
        'Ellipsis': Ellipsis,
        'False': False,
        'True': True,

        'PythonCode': PythonCode,
        'NativeCode': NativeCode
    }
})();