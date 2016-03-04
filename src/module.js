var modules = {};
var pending = {};

function get_module(name) {
    return modules[name];
}
function get_namespace(name) {
    if (name in modules) {
        return modules[name].namespace;
    }
}

function Module(name, depends) {
    this.name = name;
    this.depends = depends || [];
    modules[this.name] = this;
}

function PythonModule(name, code, depends) {
    Module.call(this, name, depends);
    this.code = code;
}

function NativeModule(name, func, depends) {
    Module.call(this, name, depends);
    this.namespace = {};
    func.apply(null, [this].concat(this.depends.map(get_namespace)));
}
NativeModule.prototype.define_function = function (name, func, signature, options) {
    options = options || {};
    signature = signature || [];
    options.module = this.name;
    options.name = name;
    options.qualname = name;
    options.simple = func.length == signature.length;
    this.namespace[name] = new_native(func, signature, options);
    return this.namespace[name];
};
NativeModule.prototype.define_type = function (name, bases, mcs) {
    this.namespace[name] = new PyType(name, bases, new PyDict(), mcs);
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