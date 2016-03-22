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


// << if DEBUG_THREADING
    function threading_debug_enter() {
        console.log('[threading] entering thread ' + threading.thread.identifier);
    }

    function threading_debug_leave() {
        console.log('[threading] leaving thread ' + threading.thread.identifier);
    }
// >>


var threading = {
    counter: 0,
    limit: '$$THREADING_LIMIT$$',
    identifier: 1,
    thread: null,
    queue: [],
    resuming: false,
    main: null,
    registry: {},

    resume: function () {
        if (!threading.resumeing) {
            threading.resumeing = true;
            window.postMessage('jaspy-resume', '*');
        }
    },

    finished: function () {
        // << if DEBUG_THREADING
            threading_debug_leave();
            if (vm.return_value) {
                console.log('[threading] thread finished execution without exception');
            } else {
                console.log('[threading] thread finished execution with exception');
            }
        // >>
        threading.thread.save();
        threading.thread.finished = true;
        threading.thread.frame = null;
        delete threading.registry[threading.thread.identifier];
        if (threading.queue.length) {
            threading.thread = threading.queue.shift();
            threading.thread.restore();
            // << if DEBUG_THREADING
                threading_debug_enter();
            // >>
            vm.frame = threading.thread.frame;
        } else {
            // << if DEBUG_THREADING
                console.log('[threading] passing control back to browser, no more queued threads');
            // >>
            threading.counter = 0;
            threading.thread = null;
            vm.frame = null;
        }
    },

    step: function () {
        if (threading.counter > threading.limit) {
            threading.counter = 0;
            threading.resumeing = true;
            threading.thread.save();
            // << if DEBUG_THREADING
                threading_debug_leave();
                console.log('[threading] passing control back to browser, limit reached');
            // >>
            window.postMessage('jaspy-resume', '*');
            vm.frame = null;
            return true;
        }

        if (threading.thread.counter > threading.limit / threading.queue.length) {
            threading.thread.counter = 0;
            threading.thread.save();
            threading.thread.enqueue();
            // << if DEBUG_THREADING
                threading_debug_leave();
            // >>
            threading.thread = threading.queue.shift();
            threading.thread.restore();
            // << if DEBUG_THREADING
                threading_debug_enter();
            // >>
            vm.frame = threading.thread.frame;
            return true;
        }

        threading.counter++;
        threading.thread.counter++;

        // << if ENABLE_DEBUGGER
            return debugging.step();
        // >>
    },

    drop: function (requeue) {
        if (requeue) {
            threading.thread.enqueue();
        }
        threading.thread.save();
        if (threading.queue.length) {
            // << if DEBUG_THREADING
                threading_debug_leave();
            // >>
            threading.thread = threading.queue.shift();
            threading.thread.restore();
            // << if DEBUG_THREADING
                threading_debug_enter();
            // >>
            vm.frame = threading.thread.frame;
        } else {
            threading.counter = 0;
            threading.thread = null;
            vm.frame = null;
        }
    },

    wakeup: function (event) {
        if (event.source == window && event.data == 'jaspy-resume') {
            threading.resumeing = false;
            event.stopPropagation();
            if (!threading.thread) {
                threading.thread = threading.queue.shift();
            }
            // << if DEBUG_THREADING
                threading_debug_enter();
            // >>
            threading.thread.restore();
            run();
        }
    }
};


function Thread(frame) {
    this.frame = frame;
    this.counter = 0;
    this.finished = false;
    this.identifier = threading.identifier++;

    this.return_value = None;
    this.last_exception = null;

    // << if ENABLE_DEBUGGER
        this.debug_break = false;
        this.debug_line = -1;
    // >>

    threading.registry[this.identifier] = this;
}

Thread.prototype.toString = function () {
    return '<Thread ' + this.identifier.toString() + '>';
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


function Lock(reentrant) {
    this.reentrant = reentrant;
    this.waiting = [];
    this.thread = null;
}

Lock.prototype.acquire = function (thread) {
    thread = thread || threading.thread;
    if (!this.thread || (this.reentrant && this.thread === thread)) {
        this.thread = thread;
        return true;
    }
    this.waiting.push(thread);
    return false;
};

Lock.prototype.release = function (thread) {
    thread = thread || threading.thread;
    if (this.thread === thread) {
        if (this.waiting.length) {
            this.thread = this.waiting.shift();
            this.thread.enqueue();
        } else {
            this.thread = null;
        }
        return true;
    }
    raise(ValueError, 'unable to release lock, lock is not acquired by given thread');
};

Lock.prototype.remove = function (thread) {
    thread = thread || threading.thread;
    var index = this.waiting.indexOf(thread);
    if (index > -1) {
        this.waiting.splice(index, 1);
    } else {
        raise(ValueError, 'unable to remove thread from waiting threads, thread not found');
    }
};

Lock.prototype.locked = function () {
    return this.thread != null;
};


window.addEventListener('message', threading.wakeup, true);


threading.main = new Thread();


$.threading = threading;

$.Thread = Thread;
$.Lock = Lock;
