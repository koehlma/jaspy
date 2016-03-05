Exception.$def('__init__', function (self, args) {
    self.setattr('args', new_tuple(args));
}, ['*args']);