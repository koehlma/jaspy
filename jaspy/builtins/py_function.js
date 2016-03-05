py_function.$def('__get__', function (self, instance, owner) {
    return new PyMethod(instance, self);
}, ['instance', 'owner']);