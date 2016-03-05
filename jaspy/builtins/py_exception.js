Exception.$def('__init__', function (self, args) {
    self.setattr('args', pack_tuple(args));
}, ['*args']);