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
    return get_module(name).dict;
}

function register_module(name, module) {
    modules[name] = module;
    module.dict['__name__'] = pack_str(name);
}

function unregister_module(name) {
    delete modules[name];
}


function Module(name, depends) {
    this.name = name;
    this.depends = depends || [];
    this.dict = {};
    if (this.name) {
        register_module(this.name, this);
    }
    this.wrapper = null;
}


function PythonModule(name, code, depends) {
    Module.call(this, name, depends);
    this.code = code;
    this.frame = null;
}

extend(PythonModule, Module);


function NativeModule(name, func, depends) {
    Module.call(this, name, depends);
    this.func = func;
    if (func) {
        func.apply(null, [jaspy, this].concat(this.depends.map(get_namespace)));
    }
}

extend(PythonModule, Module);

NativeModule.prototype.$def = function (name, func, signature, options) {
    options = options || {};
    signature = signature || [];
    options.module = this.name;
    options.name = name;
    options.qualname = name;
    options.simple = func.length == signature.length;
    this.dict[name] = $def(func, signature, options);
    return this.dict[name];
};

NativeModule.prototype.$set = function (name, value) {
    this.dict[name] = value;
    return this.dict[name];
};

NativeModule.prototype.$class = function (name, bases, mcs) {
    this.dict[name] = PyType.native(name, bases, null, mcs);
    return this.dict[name];
};

function module(name, initializer, depends) {
    if (initializer instanceof PyCode) {
        initializer = initializer.code;
    }
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
