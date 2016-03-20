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

// << if INCLUDE_BIGINT
    // #include '../libs/biginteger/BigInteger.js'
// >>

// << if INCLUDE_ENCODING
    // #include '../libs/text-encoding/lib/encoding.js'
// >>

window['jaspy'] = (function () {
    'use strict';

    var $ = {};
    var jaspy = $;

    // << if DEBUG
        console.info('Jaspy Python Interpreter\nDebugging Mode!');
    // >>

    // #include 'constants.js'
    // #include 'base.js'

    // #include 'code.js'

    // #include 'module.js'

    // #include 'object.js'
    // #include 'type.js'

    // #include 'native/__init__.js'

    // #include 'boot.js'

    // #include 'bridge.js'

    // #include 'builtins/__init__.js'

    // #include 'dis.js'

    // #include 'frame.js'
    // #include 'execute.js'
    // #include 'vm.js'

    // << if THREADING_SUPPORT
        // #include 'threading.js'
    // >>

    return jaspy;
})();

// #include 'sys.js'

// << if THREADING_SUPPORT
    // #include '../modules/_thread.js'
// >>

// << for module in modules
    // #include '../modules/' + module + '.js'
// >>
