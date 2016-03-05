py_str.$def('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (!(cls.is_subclass_of(py_str))) {
                raise(TypeError, 'class is not an subclass of str');
            }
            if (initializer instanceof PyStr) {
                if (initializer.cls == cls) {
                    return initializer;
                } else {
                    return new_str(initializer.value, cls);
                }
            }
            if (initializer.call_method('__str__')) {
                return 1;
            }
        case 1:
            if (except(MethodNotFoundError)) {
                raise(TypeError, 'invalid type of str initializer');
            } else if (vm.return_value) {
                return vm.return_value;
            }
            break;
    }
}, ['initializer']);

py_str.$def('__str__', function (self) {
    return self;
});

py_str.$def('__add__', function (self, other) {
    return new_str(unpack_str(self) + unpack_str(other));
}, ['other']);
py_str.define_alias('__add__', '__iadd__');
py_str.define_alias('__add__', '__radd__');

py_str.$def('__hash__', function (self) {
    return self;
});

py_str.$def('startswith', function (self, prefix) {
    return unpack_str(self).indexOf(unpack_str(prefix)) == 0 ? True : False;
}, ['prefix']);

function str(object) {
    return py_str.call_classmethod('__new__', [object]);
}
