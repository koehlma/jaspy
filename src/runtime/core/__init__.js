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

py_object.__class__ = py_type;
py_type.__class__ = py_type;


// #include 'iterator.js'

// #include 'dict.js'

// #include 'int.js'

// #include 'float.js'

// #include 'str.js'
// #include 'bytes.js'

// #include 'tuple.js'
// #include 'list.js'

// #include 'cell.js'

// #include 'wrapper.js'

// #include 'func.js'
// #include 'generator.js'
// #include 'method.js'

// #include 'property.js'

// #include 'slice.js'

// #include 'exception.js'
// #include 'traceback.js'
