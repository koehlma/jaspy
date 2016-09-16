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


$.update = function (target, source) {
    var name, value;
    for (name in source) {
        if (source.hasOwnProperty(name)) {
            target[name] = source[name];
        }
    }
};


$.error = function (message, type) {
    throw new Error((type || '[Fatal Error]') + ' ' + (message || 'Fatal interpreter error, unable to recover!'));
};


$.assert = function (condition, message) {
    if (!condition) {
        $.error(message, '[Assertion Failed]');
    }
};


$.raise = function (exc_type, exc_value, exc_traceback) {
    if (exc_value) {
        console.error('Exception: ' + exc_value);
    }
    $.error('Exception raised before interpreter has been fully initialized!');
};


$.Class = function (attributes, superclass) {
    var constructor = attributes.constructor;
    if (superclass) {
        constructor.prototype = Object.create(superclass.prototype);
    }
    $.update(constructor.prototype, attributes);
    constructor.superclass = superclass;
    constructor.extend = function (attributes) {
        return $.Class(attributes, constructor);
    };
    return constructor;
};

$.Class.extend = function (attributes) {
    return $.Class(attributes);
};
