py_int.define_method('__new__', function (cls, initializer, base, state, frame) {
    switch (state) {
        case 0:
            if (!(cls.is_subclass_of(py_int))) {
                raise(TypeError, 'class is not an subclass of int');
            }
            if (initializer instanceof PyFloat) {
                return new_int(Math.floor(initializer.value), cls);
            }
            if (initializer instanceof PyInt) {
                if (initializer.cls == cls) {
                    return initializer;
                } else {
                    return new_int(initializer.value, cls);
                }
            }
            if (initializer instanceof PyStr) {
                return new_int(parseInt(initializer.value, unpack_int(base)));
            }
            if (initializer.call_method('__int__')) {
                return 1;
            }
        case 1:
            if (vm.except(MethodNotFoundError)) {
                raise(TypeError, 'invalid type of int initializer');
            } else if (vm.return_value) {
                return vm.return_value;
            }
            break;
    }
}, ['initializer', 'base'], {defaults: {initializer: new_int(0), base: new_int(10)}});

py_int.define_method('__str__', function (self) {
    return new_str(unpack_int(self).toString());
});

py_int.define_method('__bool__', function (self) {
    return unpack_int(self) == 0 ? False : True;
});

py_int.define_method('__neg__', function (self) {
    return new_int(-unpack_int(self));
});

py_int.define_method('__pos__', function (self) {
    return self;
});

py_int.define_method('__lt__', function (self, other) {
    return unpack_int(self) < unpack_float(other) ? True : False;
}, ['other']);

py_int.define_method('__le__', function (self, other) {
    return unpack_int(self) <= unpack_float(other) ? True : False;
}, ['other']);

py_int.define_method('__eq__', function (self, other) {
    return unpack_int(self) == unpack_float(other) ? True : False;
}, ['other']);

py_int.define_method('__ne__', function (self, other) {
    return unpack_int(self) != unpack_float(other) ? True : False;
}, ['other']);

py_int.define_method('__gt__', function (self, other) {
    return unpack_int(self) > unpack_float(other) ? True : False;
}, ['other']);

py_int.define_method('__ge__', function (self, other) {
    return unpack_int(self) <= unpack_float(other) ? True : False;
}, ['other']);

py_int.define_method('__pow__', function (self, other) {
    if (other instanceof PyFloat) {
        return new_float(Math.pow(unpack_int(self), unpack_float(other)));
    } else {
        return new_int(Math.pow(unpack_int(self), unpack_int(other)));
    }
}, ['other']);
py_int.define_alias('__pow__', '__ipow__');
py_int.define_alias('__pow__', '__rpow__');

py_int.define_method('__mul__', function (self, other) {
    if (other instanceof PyFloat) {
        return new_float(unpack_int(self) * unpack_float(other));
    } else {
        return new_int(unpack_int(self) * unpack_int(other));
    }
}, ['other']);
py_int.define_alias('__mul__', '__imul__');
py_int.define_alias('__mul__', '__rmul__');

py_int.define_method('__floordiv__', function (self, other) {
    return new_int(Math.floor(unpack_int(self) / unpack_float(other)));
}, ['other']);
py_int.define_alias('__floordiv__', '__ifloordiv__');
py_int.define_alias('__floordiv__', '__rfloordiv__');

py_int.define_method('__truediv__', function (self, other) {
    return new_float(unpack_int(self) / unpack_float(other));
}, ['other']);
py_int.define_alias('__truediv__', '__itruediv__');
py_int.define_alias('__truediv__', '__rtruediv__');

py_int.define_method('__mod__', function (self, other) {
    if (other instanceof PyFloat) {
        return new_float(unpack_int(self) % unpack_float(other));
    } else {
        return new_int(unpack_int(self) % unpack_int(other));
    }
}, ['other']);
py_int.define_alias('__mod__', '__imod__');
py_int.define_alias('__mod__', '__rmod__');

py_int.define_method('__add__', function (self, other) {
    if (other instanceof PyFloat) {
        return new_float(unpack_int(self) + unpack_float(other));
    } else {
        return new_int(unpack_int(self) + unpack_int(other));
    }
}, ['other']);
py_int.define_alias('__add__', '__iadd__');
py_int.define_alias('__add__', '__radd__');

py_int.define_method('__sub__', function (self, other) {
    if (other instanceof PyFloat) {
        return new_float(unpack_int(self) - unpack_float(other));
    } else {
        return new_int(unpack_int(self) - unpack_int(other));
    }
}, ['other']);
py_int.define_alias('__sub__', '__isub__');
py_int.define_alias('__sub__', '__rsub__');

py_int.define_method('__lshift__', function (self, other) {
    return new_int(unpack_int(self) >> unpack_int(other));
}, ['other']);
py_int.define_alias('__lshift__', '__ilshift__');
py_int.define_alias('__lshift__', '__rlshift__');

py_int.define_method('__rshift__', function (self, other) {
    return new_int(unpack_int(self) << unpack_int(other));
}, ['other']);
py_int.define_alias('__rshift__', '__irshift__');
py_int.define_alias('__rshift__', '__rrshift__');

py_int.define_method('__and__', function (self, other) {
    return new_int(unpack_int(self) & unpack_int(other));
}, ['other']);
py_int.define_alias('__and__', '__iand__');
py_int.define_alias('__and__', '__rand__');

py_int.define_method('__xor__', function (self, other) {
    return new_int(unpack_int(self) ^ unpack_int(other));
}, ['other']);
py_int.define_alias('__xor__', '__ixor__');
py_int.define_alias('__xor__', '__rxor__');

py_int.define_method('__or__', function (self, other) {
    return new_int(unpack_int(self) | unpack_int(other));
}, ['other']);
py_int.define_alias('__or__', '__ior__');
py_int.define_alias('__or__', '__ror__');