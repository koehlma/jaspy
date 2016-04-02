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

function error(message) {
    throw new Error('[FATAL ERROR] ' + (message || 'fatal interpreter error'));
}

function raise(exc_type, exc_value, exc_tb) {
    error('exception occurred before jaspy has been fully initialized');
}

function assert(condition, message) {
    if (!condition) {
        error(message || 'assertion failed');
    }
}

function assign(target, source) {
    var name, value;
    for (name in source) {
        if (source.hasOwnProperty(name)) {
            target[name] = source[name];
        }
    }
}


function make_class(attributes, superclass) {
    var constructor = attributes.constructor;
    if (superclass) {
        constructor.prototype = Object.create(superclass.prototype);
    }
    assign(constructor.prototype, attributes);
    constructor.superclass = superclass;
    constructor.extend = function (attributes) {
        return make_class(attributes, constructor);
    };
    return constructor;
}

var Class = make_class({constructor: function () {}});


$.error = error;
$.raise = raise;
$.assert = assert;
$.assign = assign;

$.Class = Class;
