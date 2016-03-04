function PyMethod(self, func) {
    PyObject.call(this, py_method);
    this.self = self;
    this.func = func;
}
PyMethod.prototype = new PyObject;

function new_method(func, instance) {
    return None;
}

py_method.define_method('__str__', function (self) {
    return new_str('<bound-method');
});

py_classmethod.define_method('__init__', function (self, func) {
    self.setattr('__func__', func);
}, ['func']);

py_classmethod.define_method('__get__', function (self, instance, owner) {
    return new_method(self.getattr('__func__'), owner);
}, ['instance', 'owner']);