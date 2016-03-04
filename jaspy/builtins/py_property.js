py_property.define_method('__get__', function (self, instance, owner, state, frame) {
    switch (state) {
        case 0:
            if (call_object(self.getattr('fget'), [instance])) {
                return 1;
            }
        case 1:
            return vm.return_value;
    }
}, ['instance', 'owner']);

py_property.define_method('__set__', function (self, instance, value, state, frame) {
    switch (state) {
        case 0:
            if (call_object(self.getattr('fset'), [instance, value])) {
                return 1;
            }
        case 1:
            break;
    }
}, ['instance', 'value']);