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
    return get_module(name).namespace;
}

function register_module(name, module) {
    modules[name] = module;
}

function unregister_module(name) {
    delete modules[name];
}


function Module(name, depends) {
    this.name = name;
    this.depends = depends || [];
    this.namespace = {};
    if (this.name) {
        register_module(this.name, this);
    }
}


function PythonModule(name, code, depends) {
    Module.call(this, name, depends);
    this.code = code;
}

PythonModule.prototype = new Module();

function NativeModule(name, func, depends) {
    Module.call(this, name, depends);
    this.func = func;
    if (func) {
        func.apply(null, [jaspy, this].concat(this.depends.map(get_namespace)));
    }
}

NativeModule.prototype = new Module();

NativeModule.prototype.$def = function (name, func, signature, options) {
    options = options || {};
    signature = signature || [];
    options.module = this.name;
    options.name = name;
    options.qualname = name;
    options.simple = func.length == signature.length;
    this.namespace[name] = new_native(func, signature, options);
    return this.namespace[name];
};

NativeModule.prototype.$set = function (name, value) {
    this.namespace[name] = value;
    return this.namespace[name];
};

NativeModule.prototype.$class = function (name, bases, mcs) {
    this.namespace[name] = new PyType(name, bases, null, mcs);
    return this.namespace[name];
};

function define_module(name, code_or_func, depends) {
    if (code_or_func instanceof PyCode) {
        code_or_func = code_or_func.value
    }
    if (typeof code_or_func == 'function') {
        return new NativeModule(name, code_or_func, depends);
    } else if (code_or_func instanceof PythonCode) {
        return new PythonModule(name, code_or_func, depends);
    } else {
        throw new Error('invalid type of code or function');
    }
}


$.get_module = get_module;
$.get_namespace = get_namespace;

$.module = define_module;
