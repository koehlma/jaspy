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

var threading = {};

threading.counter = 0;

function Thread(frame) {
    this.frame = frame;
    this.counter = 0;
    this.finished = false;
}

Thread.prototype.start = function () {
    threading.queue.push(this);
};

threading.thread = new Thread();
threading.queue = [];

threading.internal_step = function () {
    if (threading.counter > THREADING_THRESHOLD) {
        threading.thread.frame = vm.frame;
        threading.counter = 0;
        vm.frame = null;
        window.postMessage('jaspy-resume', '*');
        return true;
    }
    if (threading.thread.counter > THREADING_THRESHOLD / threading.queue.length) {
        threading.thread.counter = 0;
        threading.thread.frame = vm.frame;
        threading.queue.push(threading.thread);
        threading.thread = threading.queue.shift();
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
        vm.frame = threading.thread.frame;
    }
};

window.addEventListener('message', function (event) {
    if (event.source == window && event.data == 'jaspy-resume') {
        event.stopPropagation();
        resume(threading.thread.frame);
    }
}, true);


$.threading = threading;
