function PyModule(namespace) {
    PyObject.call(this, py_module, new PyDict(namespace));
}
PyModule.prototype = new PyObject;

py_module.$def('__getattribute__', function (self, name) {
    var value = self.dict.get(name);
    if (!value) {
        raise(AttributeError, 'module has no attribute \'' + name + '\'');
    }
    return value;
}, ['name']);