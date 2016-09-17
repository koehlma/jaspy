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
 * Prior to the Jaspy Executor one has to write explicit state machines to allow the code
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



var GeneratorFunction = Object.getPrototypeOf(function* () {}).constructor;


/**
 * Suspension
 * ----------
 * When a executable yields a suspension the execution of the current Microthread is
 * suspended.
 *
 * Futures, Preemption, …
 */
$.Suspension = $.Class({
    constructor: function () {
        this.pending = true;
        this.result = null;
        this.exception = null;
    },

    set_result: function (result) {
        this.pending = false;
        this.result = result;
    },

    set_exception: function (exception) {
        this.pending = false;
        this.exception = exception;
    }
});


/**
 * Executable
 * ---------
 * Coroutines are basic executable entities which are suspendable.
 */
$.Executable = $.Class({
    constructor: function (generator) {
        this.generator = generator;
    }
});





/**
 * Executor
 * --------
 * Singleton class which controls the execution of executables.
 */
var Executor = $.Class({
    constructor: function () {
        this.mode_stack = [];
        this.mode = Executor.MODES.SYNCHRONOUS;
    },

    enter_asynchronous_mode: function () {
        this.mode_stack.push(this.mode);
        this.mode = Executor.MODES.ASYNCHRONOUS;
    },

    leave_asynchronous_mode: function () {
        // << if ENABLE_ASSERTIONS
            $.assert(this.mode == Executor.MODES.ASYNCHRONOUS, 'Leave asynchronous mode while being in synchronous mode!');
            $.assert(this.mode_stack.length > 0, 'Empty mode stack in leave asynchronous!');
        // >>
        this.mode = this.mode_stack.pop();
    },

    enter_synchronous_mode: function () {
        this.mode_stack.push(this.mode);
        this.mode = Executor.MODES.SYNCHRONOUS;
    },

    leave_synchronous_mode: function () {
        // << if ENABLE_ASSERTIONS
            $.assert(this.mode == Executor.MODES.SYNCHRONOUS, 'Leave synchronous mode while being in asynchronous mode!');
            $.assert(this.mode_stack.length > 0, 'Empty mode stack in leave synchronous!');
        // >>
        this.mode = this.mode_stack.pop();
    }
});

Executor.MODES = Object.freeze({
    SYNCHRONOUS: 'synchronous',
    ASYNCHRONOUS: 'asynchronous'
});


$.executor = new Executor();


/**
 * Microthread
 * ===========
 *
 */
$.Microthread = $.Class({
    constructor: function (func) {
        $.executor.enter_asynchronous_mode();
        try {
            this.stack = [func.apply(null, Array.prototype.slice.call(arguments, 1))];
        } finally {
            $.executor.leave_asynchronous_mode();
        }
    },

    run: function (suspension) {
        var executable, result, exception;

        var state = {};

        if (suspension) {
            result = suspension.result;
            exception = suspension.exception;
        }

        $.executor.enter_asynchronous_mode();
        try {
            while (this.stack.length > 0) {
                executable = this.stack[this.stack.length - 1];

                try {
                    if (exception) {
                        state = executable.generator.throw(exception);
                        exception = null;
                    } else {
                        state = executable.generator.next(result);
                    }
                } catch (error) {
                    exception = error;
                }

                if (exception || state.done) {
                    this.stack.pop();
                }

                result = state.value;

                if (result instanceof $.Executable) {
                    this.stack.push(result);
                } else if (result instanceof $.Suspension) {
                    return result;
                }
            }

            if (exception) {
                throw exception;
            } else {
                return result;
            }
        } finally {
            $.executor.leave_asynchronous_mode();
        }
    }
});


$._ = $.executable = function (func) {
    $.assert(func instanceof GeneratorFunction, 'Function is not a generator function!');
    return (function () {
        var exception, state;

        var generator = func.apply(null, arguments);

        switch ($.executor.mode) {
            case Executor.MODES.SYNCHRONOUS:
                state = {};

                while (!state.done) {
                    if (exception) {
                        state = generator.throw(exception);
                        exception = null;
                    } else {
                        state = generator.next(state.value);
                    }

                    if (state.value instanceof $.Suspension) {
                        if (state.value.pending) {
                            $.raise($.ExecutorError, 'Unable to suspend executor in synchronous mode!');
                        }
                        exception = state.value.exception;
                        state.value = state.value.result;
                    } else if (state.value instanceof $.Executable) {
                        $.raise($.ExecutorError, 'Executable yielded another executable in synchronous mode!');
                    }
                }

                return state.value;
            case Executor.MODES.ASYNCHRONOUS:
                return new $.Executable(generator);
        }
    });
};
