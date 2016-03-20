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

threading.last_frame = null;
threading.step_counter = 0;

function Thread(frame) {
    this.frame = frame;
}

threading.internal_step = function () {
    if (threading.step_counter > THREADING_THRESHOLD) {
        threading.last_frame = vm.frame;
        threading.step_counter = 0;
        vm.frame = null;
        window.postMessage('jaspy-resume', '*');
        return true;
    }
    threading.step_counter++;
};

window.addEventListener('message', function (event) {
    if (event.source == window && event.data == 'jaspy-resume') {
        event.stopPropagation();
        resume(threading.last_frame);
    }
}, true);


$.threading = threading;
