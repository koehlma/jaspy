var TRUE_STR = new_str('True');
var FALSE_STR = new_str('False');

py_bool.define_method('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (!(cls.is_subclass_of(py_bool))) {
                raise(TypeError, 'class is not an subclass of bool');
            }
            if (initializer.call_method('__bool__')) {
                return 1;
            }
        case 1:
            if (vm.except(MethodNotFoundError)) {
                if (initializer.call_method('__len__')) {
                    return 2;
                }
            } else if (vm.return_value) {
                return vm.return_value;
            } else {
                return null;
            }
        case 2:
            if (vm.except(MethodNotFoundError)) {
                return new PyInt(1, cls);
            } else if (vm.return_value) {
                if (unpack_int(vm.return_value) == 0) {
                    return new PyInt(0, cls);
                } else {
                    return new PyInt(1, cls);
                }
            }
    }
}, ['initializer'], {defaults: {initializer: False}});

py_bool.define_method('__str__', function (self) {
    return unpack_int(self) != 0 ? TRUE_STR : FALSE_STR;
});