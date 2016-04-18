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

var modules = {};
var pending = {};

function get_module(name) {
    if (name in modules) {
        return modules[name];
    } else {
        raise(ImportError, 'no module named \'' + name + '\'');
    }
}

function get_namespace(name) {
    return get_module(name).__dict__;
}

function register_module(name, module) {
    modules[name] = module;
    module.__dict__['__name__'] = Str.pack(name);
}

function unregister_module(name) {
    delete modules[name];
}


var Module = Class.extend({
    constructor: function (name, depends) {
        this.name = name;
        this.depends = depends || [];
        this.__dict__ = {};
        if (this.name) {
            register_module(this.name, this);
        }
        this.wrapper = null;
    }
});


var PythonModule = Module.extend({
    constructor: function (name, code, depends) {
        Module.call(this, name, depends);
        this.code = code;
        this.frame = null;
    }
});


var NativeModule = Module.extend({
    constructor: function (name, func, depends) {
        Module.call(this, name, depends);
        this.func = func;
        if (func) {
            func.apply(null, [jaspy, this].concat(this.depends.map(get_namespace)));
        }
    },

    $def: function (name, func, signature, options) {
        options = options || {};
        signature = signature || [];
        options.module = this.name;
        options.name = name;
        options.qualname = name;
        options.simple = func.length == signature.length;
        this.__dict__[name] = $def(func, signature, options);
        return this.__dict__[name];
    },

    $set: function (name, value) {
        this.__dict__[name] = value;
        return this.__dict__[name];
    },

    $class: function (name, bases, mcs) {
        this.__dict__[name] = PyType.native(name, bases, null, mcs);
        return this.__dict__[name];
    }
});

function module(name, initializer, depends) {
    if (typeof initializer == 'function') {
        return new NativeModule(name, initializer, depends);
    } else if (initializer instanceof PythonCode) {
        return new PythonModule(name, initializer, depends);
    } else {
        throw new Error('invalid type of code or function');
    }
}


$.get_module = get_module;
$.get_namespace = get_namespace;

$.module = module;

$.modules = modules;
