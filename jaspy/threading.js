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

var THREADING_THRESHOLD = ([(THREADING_THRESHOLD)]);

var thread_identity = 0;

var threading = {};

threading.counter = 0;


function Thread(frame) {
    this.frame = frame;
    this.counter = 0;
    this.finished = false;
    this.identity = thread_identity++;

    this.return_value = None;
    this.last_exception = null;
}

Thread.prototype.toString = function () {
    return '<Thread ' + this.identity.toString() + '>';
};

Thread.prototype.start = function () {
    threading.queue.push(this);
};

Thread.prototype.enqueue = function () {
    threading.queue.push(this);
};

Thread.prototype.save = function () {
    this.frame = vm.frame;

    this.return_value = vm.return_value;
    this.last_exception = vm.last_exception;
};

Thread.prototype.restore = function () {
    vm.frame = this.frame;

    vm.return_value = this.return_value;
    vm.last_exception = this.last_exception;
};

threading.thread = null;
threading.queue = [];
threading.resumeing = false;

// << if THREADING_DEBUG
    function threading_debug_enter() {
        var frame = threading.thread.frame;
        var message = '[threading] entering thread ' + threading.thread.identity + ' with state ' + frame.state;
        if (frame instanceof PythonFrame) {
            console.log(message + ' at position ' + frame.position + '\n', frame, frame.stack.slice());
        } else {
            console.log(message + '\n', frame);
        }
    }

    function threading_debug_leave() {
        var frame = threading.thread.frame;
        var message = '[threading] leaving thread ' + threading.thread.identity + ' with state ' + frame.state;
        if (frame instanceof PythonFrame) {
            console.log(message + ' at position ' + threading.thread.frame.position + '\n', frame, frame.stack.slice());
        } else {
            console.log(message + '\n', frame);
        }
    }
// >>

threading.resume = function () {
    if (!threading.resumeing) {
        threading.resumeing = true;
        window.postMessage('jaspy-resume', '*');
    }
};

threading.internal_step = function () {
    if (threading.counter > THREADING_THRESHOLD) {
        threading.thread.save();
        // << if THREADING_DEBUG
            threading_debug_leave();
        // >>
        threading.counter = 0;
        vm.frame = null;
        threading.resumeing = true;
        window.postMessage('jaspy-resume', '*');
        return true;
    }
    if (threading.thread.counter > THREADING_THRESHOLD / threading.queue.length) {
        threading.thread.counter = 0;
        threading.thread.save();
        threading.thread.enqueue();
        // << if THREADING_DEBUG
            threading_debug_leave();
        // >>
        threading.thread = threading.queue.shift();
        threading.thread.restore();
        // << if THREADING_DEBUG
            threading_debug_enter();
        // >>
        vm.frame = threading.thread.frame;
        return true;
    }
    threading.counter++;
    threading.thread.counter++;
};

threading.finished = function () {
    threading.thread.finished = true;
    if (threading.queue.length) {
        threading.thread = threading.queue.shift();
        threading.thread.restore();
        // << if THREADING_DEBUG
            threading_debug_enter();
        // >>
        vm.frame = threading.thread.frame;
    } else {
        threading.counter = 0;
        threading.thread = null;
        vm.frame = null;
    }
};

threading.yield = function (requeue) {
    if (requeue) {
        threading.thread.enqueue();
    }
    threading.thread.save();
    if (threading.queue.length) {
        // << if THREADING_DEBUG
            threading_debug_leave();
        // >>
        threading.thread = threading.queue.shift();
        threading.thread.restore();
        // << if THREADING_DEBUG
            threading_debug_enter();
        // >>
        vm.frame = threading.thread.frame;
    } else {
        threading.counter = 0;
        threading.thread = null;
        vm.frame = null;
    }
};

window.addEventListener('message', function (event) {
    if (event.source == window && event.data == 'jaspy-resume') {
        threading.resumeing = false;
        event.stopPropagation();
        if (!threading.thread) {
            threading.thread = threading.queue.shift();
        }
        // << if THREADING_DEBUG
            threading_debug_enter();
        // >>
        threading.thread.restore();
        run();
    }
}, true);


$.threading = threading;

$.Thread = Thread;
