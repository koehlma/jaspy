py_type.define_classmethod('__prepare__', function (mcs, bases) {
    return new PyDict();
}, ['bases']);

py_type.$def('__new__', function (mcs, name, bases, attributes) {
    if (!(mcs instanceof PyType)) {
        raise(TypeError, 'invalid type of \'mcs\' argument');
    }
    if (!(attributes instanceof PyDict)) {
        raise(TypeError, 'invalid type of \'attributes\' argument');
    }
    return new PyType(unpack_str(name), unpack_tuple(bases), attributes, mcs);
}, ['name', 'bases', 'attributes']);

py_type.$def('__call__', function (cls, args, kwargs, state, frame) {
    switch (state) {
        case 0:
            if (cls.call_classmethod('__new__', args, kwargs)) {
                return 1;
            }
        case 1:
            if (!vm.return_value) {
                return null;
            }
            frame.instance = vm.return_value;
            if (vm.return_value.cls.lookup('__init__')) {
                if (vm.return_value.call_method('__init__', args, kwargs)) {
                    return 2;
                }
            }
        case 2:
            if (vm.return_value) {
                return frame.instance;
            }
    }
}, ['*args', '**kwargs']);

py_type.$def('__str__', function (cls) {
    var module = cls.getattr('__module__');
    if (!(cls instanceof PyType)) {
        raise(TypeError, 'invalid type of \'cls\' argument');
    }
    if (module instanceof PyStr) {
        return new_str('<class \'' + unpack_str(module) + '.' + cls.name + '\'>');
    } else {
        return new_str('<class \'' + cls.name + '\'>');
    }
});

py_type.define_property('__name__', function (cls) {
    return new_str(cls.unpack('name'));
}, function (cls, value) {
    cls.pack('name', unpack_str(value));
});

py_type.define_property('__mro__', function (cls) {
    return new_tuple(cls.unpack('mro'));
});