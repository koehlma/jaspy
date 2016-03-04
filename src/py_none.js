var NONE_STR = new_str('None');

None.cls.define_method('__new__', function (cls) {
    return None;
});

None.cls.define_method('__str__', function (self) {
    return NONE_STR;
});

None.cls.define_method('__bool__', function (self) {
    return False;
});
