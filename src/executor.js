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
 * Jaspy Executor
 * ==============
 * Implements the Jaspy execution model. Goals:
 *
 * - Write code which looks sequentially using ES6 generators.
 * - Execute this code asynchronously which enables Threading, Debugging and Greenlets.
 * - Execute this code synchronously which enables Speedy and ASM.js backends.
 *
 * To make Jaspy ES5 compliant one may use Regenerator [1]_.
 *
 * .. [1] https://facebook.github.io/regenerator/
 *
 *
 * Motivation
 * ----------
 * Prior to the Jaspy executor one has to write explicit state machines to allow the code
 * to be suspendable. This led to unreadable und unmaintainable code. The new execution
 * model allows to write sequentially looking code which is suspendable. This should speed
 * up development and improve maintainability.
 *
 *
 * Execution Modes
 * ---------------
 * There are two different execution modes — asynchronous and synchronous. When executing
 * code in asynchronous mode a callable might request suspension of the whole execution
 * stack. This makes threading, debugging, greenlets and blocking IO possible. However we
 * also need a way to execute Python code as well as JS code in a blocking way. While
 * executing code in synchronous mode callables are blocking and not allowed to suspend
 * execution. If code has been optimized using the Speedy or ASM.js backend, runtime calls
 * are possible because they are blocking due to the executor being in synchronous mode.
 *
 *
 * Coroutines
 * ----------
 *
 *
 * Mikrothreads
 * ------------
 * Mikrothreads are the basis for real Threads and Greenlets.
 *
 *
 * ES5 vs. ES6
 * -----------
 * Nearly all modern desktop browsers support ES6 generators and Jaspy is cutting edge
 * technology anyway. It is to be expected that when Jaspy reaches productivity status
 * all browsers will support ES6 generators.
 */


/**
 * Suspension
 * ----------
 * When a coroutine yields a suspension the execution of the current Microthread is
 * suspended.
 *
 * Futures, Preemption, …
 */
var Suspension = $.Class({
    constructor: function () {

    }
});


/**
 * Coroutine
 * ---------
 * Coroutines are the basic executable entities.
 */
var Coroutine = $.Class({
    constructor: function (generator) {
        this.generator = generator;
    }
});


var executor = {
    mode: 'synchronous'
};


function set_mode() {

}


function coroutine(func) {
    function wrapper() {
        var generator = func.apply(null, arguments);
        var state = generator.next();

        if (executor.mode == 'synchronous') {
            while (!state.done) {
                state = generator.next(state.value);
                if (state.value instanceof Future) {
                    if (state.value.pending) {
                        throw new Error('future returned in synchronous mode');
                    } else {
                        // TODO: extract value/exception from future
                    }
                }
            }
            // TODO: return result
        }
        return new Coroutine(generator);
    }
    return wrapper;
}

