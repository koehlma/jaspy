py_float.$def('__new__', function (cls, initializer, state, frame) {
    switch (state) {
        case 0:
            if (!(cls.is_subclass_of(py_float))) {
                raise(TypeError, 'class is not an subclass of float');
            }
            if (initializer instanceof PyInt || initializer instanceof PyFloat) {
                if (initializer.cls == cls) {
                    return initializer;
                } else {
                    return new_int(initializer.value, cls);
                }
            }
            if (initializer instanceof PyStr) {
                return new_float(parseFloat(initializer.value));
            }
            if (initializer.call_method('__float__')) {
                return 1;
            }
        case 1:
            if (except(MethodNotFoundError)) {
                raise(TypeError, 'invalid type of int initializer');
            } else if (vm.return_value) {
                return vm.return_value;
            }
            break;
    }
}, ['initializer'], {defaults: {initializer: new_float(0)}});

py_float.$def('__str__', function (self) {
    return new_str(unpack_float(self).toString());
});

py_float.$def('__neg__', function (self) {
    return new_float(-unpack_float(self));
});

py_float.$def('__pos__', function (self) {
    return self;
});

py_float.$def('__lt__', function (self, other) {
    return unpack_float(self) < unpack_float(other) ? True : False;
}, ['other']);

py_float.$def('__le__', function (self, other) {
    return unpack_float(self) <= unpack_float(other) ? True : False;
}, ['other']);

py_float.$def('__eq__', function (self, other) {
    return unpack_float(self) == unpack_float(other) ? True : False;
}, ['other']);

py_float.$def('__ne__', function (self, other) {
    return unpack_float(self) != unpack_float(other) ? True : False;
}, ['other']);

py_float.$def('__gt__', function (self, other) {
    return unpack_float(self) > unpack_float(other) ? True : False;
}, ['other']);

py_float.$def('__ge__', function (self, other) {
    return unpack_float(self) <= unpack_float(other) ? True : False;
}, ['other']);

py_float.$def('__pow__', function (self, other) {
    return new_float(Math.pow(unpack_float(self), unpack_float(other)));
}, ['other']);
py_float.define_alias('__pow__', '__ipow__');
py_float.define_alias('__pow__', '__rpow__');

py_float.$def('__mul__', function (self, other) {
    return new_float(unpack_float(self) * unpack_float(other));
}, ['other']);
py_float.define_alias('__mul__', '__imul__');
py_float.define_alias('__mul__', '__rmul__');

py_float.$def('__floordiv__', function (self, other) {
    return new_int(Math.floor(unpack_float(self) / unpack_float(other)));
}, ['other']);
py_float.define_alias('__floordiv__', '__ifloordiv__');
py_float.define_alias('__floordiv__', '__rfloordiv__');

py_float.$def('__truediv__', function (self, other) {
    return new_float(unpack_float(self) / unpack_float(other));
}, ['other']);
py_float.define_alias('__truediv__', '__itruediv__');
py_float.define_alias('__truediv__', '__rtruediv__');

py_float.$def('__mod__', function (self, other) {
    return new_float(unpack_float(self) % unpack_float(other));
}, ['other']);
py_float.define_alias('__mod__', '__imod__');
py_float.define_alias('__mod__', '__rmod__');

py_float.$def('__add__', function (self, other) {
    return new_float(unpack_float(self) + unpack_float(other));
}, ['other']);
py_float.define_alias('__add__', '__iadd__');
py_float.define_alias('__add__', '__radd__');

py_float.$def('__sub__', function (self, other) {
    return new_float(unpack_float(self) - unpack_float(other));
}, ['other']);
py_float.define_alias('__sub__', '__isub__');
py_float.define_alias('__sub__', '__rsub__');