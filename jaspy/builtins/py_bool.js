var TRUE_STR = pack_str('True');
var FALSE_STR = pack_str('False');

py_bool.$def('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (!(cls.is_subclass_of(py_bool))) {
                raise(TypeError, 'class is not an subclass of bool');
            }
            if (initializer.call_method('__bool__')) {
                return 1;
            }
        case 1:
            if (except(MethodNotFoundError)) {
                if (initializer.call_method('__len__')) {
                    return 2;
                }
            } else if (vm.return_value) {
                return vm.return_value;
            } else {
                return null;
            }
        case 2:
            if (except(MethodNotFoundError)) {
                return new PyInt(1, cls);
            } else if (vm.return_value) {
                return vm.return_value.ne(0) ? True : False;
            }
    }
}, ['initializer'], {defaults: {initializer: False}});

py_bool.$def('__str__', function (self) {
    return self.ne(False) ? TRUE_STR : FALSE_STR;
});
