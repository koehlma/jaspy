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


var Future = Class.extend({
    constructor: function () {
        this.result = null;

        this.success = false;
        this.error = false;

        this.callbacks = [];
    },

    done: function (callback) {
        if (this.error || this.success) {
            callback(this);
        } else {
            this.callbacks.push(callback);
        }
    },

    run_callbacks: function () {
        for (var index = 0; index < this.callbacks.length; index++) {
            this.callbacks[index](this)
        }
    },

    set_result: function (result) {
        this.result = result;
        this.success = true;
        this.run_callbacks();
    },

    set_exception: function (exception) {
        this.result = exception;
        this.error = true;
        this.run_callbacks();
    }
});


$.Future = Future;
