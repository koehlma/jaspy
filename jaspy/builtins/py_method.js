function PyMethod(self, func) {
    PyObject.call(this, py_method);
    this.self = self;
    this.func = func;
}
PyMethod.prototype = new PyObject;

function new_method(func, instance) {
    return None;
}

py_method.$def('__str__', function (self) {
    return pack_str('<bound-method');
});

py_classmethod.$def('__init__', function (self, func) {
    self.setattr('__func__', func);
}, ['func']);

py_classmethod.$def('__get__', function (self, instance, owner) {
    return new_method(self.getattr('__func__'), owner);
}, ['instance', 'owner']);