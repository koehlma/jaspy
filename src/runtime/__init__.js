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


jaspy.runtime = (function () {
    var $ = jaspy;

    // << if ENABLE_DEBUGGER
        console.info('Jaspy Python Interpreter\nDebugging Mode!');
    // >>

    // #include 'constants.js'
    // #include 'base.js'

    // #include 'future.js'

    // #include 'object.js'
    // #include 'type.js'

    // #include 'core/__init__.js'

    // #include 'code.js'
    // #include 'module.js'

    // #include 'bridge.js'

    // #include 'python/__init__.js'

    // #include 'dis.js'

    // #include 'frame.js'
    // #include 'execute.js'
    // #include 'vm.js'

    // << if ENABLE_THREADING
        // #include 'threading.js'
    // >>

    // << if ENABLE_DEBUGGER
        // #include 'debugger.js'
    // >>
})();
