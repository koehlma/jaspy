var NONE_STR = pack_str('None');

None.cls.$def('__new__', function (cls) {
    return None;
});

None.cls.$def('__str__', function (self) {
    return NONE_STR;
});

None.cls.$def('__bool__', function (self) {
    return False;
});
