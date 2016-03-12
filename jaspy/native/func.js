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

function PyFunction(name, code, options, cls) {
    PyObject.call(this, cls || py_function);

    this.name = name;
    this.code = code;

    this.qualname = options.qualname || this.name;
    this.doc = options.doc || '';
    this.module = options.module || 'builtins';
    this.defaults = options.defaults || null;
    this.closure = options.closure || null;
    this.globals = options.globals || null;
}

extend(PyFunction, PyObject);


function $def(func, signature, options) {
    options = options || {};
    var name = options.name || '<unknown>';
    var code = new NativeCode(func, options, signature);
    return new PyFunction(name, code, options);
}


$.PyFunction = PyFunction;

$.$def = $def;
