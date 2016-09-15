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

// << if INCLUDE_SIPHASH
    // #include '../libs/siphash/lib/siphash.js'
// >>

window['jaspy'] = (function () {
    'use strict';

    var $ = {};
    var jaspy = $;

    // #include 'runtime/__init__.js'

    // #include 'language/__init__.js'

    return jaspy;
})();

// #include 'runtime/sys.js'

/* {{ _builtins }} */

jaspy.main(jaspy.get_module('_builtins'), [], true);
jaspy.update(jaspy.builtins, jaspy.get_module('_builtins').__dict__);
jaspy.builtins['__name__'] = 'builtins';

// << if ENABLE_THREADING
    // #include '../modules/_thread.js'
// >>

// << for module in modules
    // #include '../modules/' + module + '.js'
// >>
