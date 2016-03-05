py_object.$def('__new__', function (cls, args, kwargs) {
    if (!(cls instanceof PyType)) {
        raise(TypeError, 'object.__new__(X): X is not a type object');
    }
    if (cls.native !== py_object) {
        raise(TypeError, 'object.__new__() is not safe, use ' + cls.native.name + '.__new__()');
    }
    return new PyObject(cls);
}, ['*args', '**kwargs']);

py_object.$def('__getattribute__', function (self, name, state, frame) {
    var value;
    switch (state) {
        case 0:
            name = unpack_str(name);
            value = self.namespace ? self.getattr(name) : null;
            if (!value) {
                value = self.cls.lookup(name);
                if (value) {
                    if (value.call_method('__get__', [self, self.cls])) {
                        return 1;
                    }
                } else {
                    raise(AttributeError, '\'' + self.cls.name + '\' object has no attribute \'' + name + '\'');
                }
            } else {
                return value;
            }
        case 1:
            if (except(MethodNotFoundError)) {
                return value;
            } else if (vm.return_value) {
                return vm.return_value
            } else {
                return null;
            }
    }
}, ['name']);

py_object.$def('__setattr__', function (self, name, item, state, frame) {
    var descriptor;
    switch (state) {
        case 0:
            descriptor = self.cls.lookup(name);
            if (descriptor && descriptor.cls.lookup('__set__')) {
                if (descriptor.call_method('__set__', [self, item])) {
                    return 1;
                }
            } else {
                self.setattr(name, item);
                return null;
            }
        case 1:
            return null;
    }
}, ['name', 'item']);

py_object.$def('__str__', function (self) {
    var module = self.cls.getattr('__module__');
    if (module instanceof PyStr) {
        return pack_str('<' + module.value + '.' + self.cls.name + ' object at 0x' + self.get_address() + '>');
    } else {
        return pack_str('<' + self.cls.name + ' object at 0x' + self.get_address() + '>');
    }
});

py_object.$def('__hash__', function (self) {
    return pack_str('object: ' + self.get_address());
});

py_object.$def('__eq__', function (self, other) {
    return self === other ? True : False;
}, ['other']);

py_object.define_property('__class__', function (self) {
    return self.unpack('cls');
}, function (self, value) {
    if (!(value instanceof PyType) || value.native != py_object) {
        raise(TypeError, 'invalid type of \'value\' argument');
    }
    if (self instanceof PyType || self.cls.native != py_object) {
        raise(TypeError, 'object does not support class assignment');
    }
    self.pack('cls', value);
});
