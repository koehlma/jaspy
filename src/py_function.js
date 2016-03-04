py_function.define_method('__get__', function (self, instance, owner) {
    return new PyMethod(instance, self);
}, ['instance', 'owner']);