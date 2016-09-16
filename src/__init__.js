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


/**
 * Welcome to the source code of Jaspy!
 * ====================================
 * Warning: Python interpreter under construction!
 *
 * So you like to learn how Jaspy works under the hood? You have made the first important
 * step — you are reading the source code of Jaspy. In case you only want to use Jaspy you
 * probably should instead read the user documentation [1]_.
 *
 * The in-source documentation is more or less a loose bunch of thoughts, ideas, and other
 * stuff than well-structured and well-conceived. However I will try to explain the rough
 * ideas and concepts behind the implementation.
 *
 * .. [1] https://jaspy.readthedocs.io/en/latest/
 *
 *
 * Motivation
 * ----------
 * Why should one come up with yet another Python-JavaScript-Thingamajig? Just to give you
 * a few examples why this might be a good idea:
 *
 * - First of all programming is fun, so why not?
 * - Learn how to build an interpreter and the corresponding runtime environment.
 * - Get a better and deep understanding of the Python programming language.
 * - Experiment with web technologies and see what is possible.
 * - Learn JavaScript although your really do not want to. ;)
 *
 * However I do not want to reinvent the wheel, therefore Jaspy is also an experiment on
 * how to implement various features others are not offering. This includes threading, a
 * built-in debugger, Greenlets, blocking IO, and other features.
 */


// << for lib in libs
    // #include '../libs/' + lib
// >>


var jaspy = {};


(function () {
    var $ = jaspy;

    // #include 'base.js'
    // #include 'executor.js'
})();


// #include 'runtime/__init__.js'
// #include 'language/__init__.js'

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
