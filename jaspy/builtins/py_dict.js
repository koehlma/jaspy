py_dict.define_method('__setitem__', function (self, key, value, state, frame) {
    if (!(self instanceof PyDict)) {
        raise(TypeError, 'invalid type of \'self\' argument');
    }
    switch (state) {
        case 0:
            if (key.cls === py_str) {
                vm.return_value = key;
            } else if (key.call_method('__hash__')) {
                return 1;
            }
        case 1:
            if (!vm.return_value) {
                return null;
            }
            if (vm.return_value instanceof PyStr) {
                self.set(vm.return_value, value);
            } else if (vm.return_value instanceof PyInt) {
                self.set(new_str(vm.return_value.value.toString()), value);
            } else {
                raise(TypeError, 'invalid result type of key hash');
            }
            return None;
    }
}, ['key', 'value']);