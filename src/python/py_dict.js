/*
 * Copyright (C) 2016, Maximilian Koehl <mail@koehlma.de>
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */


Dict.$def('__new__', function (cls) {
    return new Dict({}, cls);
});

Dict.$def('__getitem__', function (self, key, state, frame) {
    var value;
    while (true) {
        switch (state) {
                case 0:
                    Dict.check(self);

                    if (key instanceof Str) {
                        value = self.get(key);
                        if (value) {
                            return value;
                        } else {
                            raise(KeyError, new Exception([key], KeyError));
                        }
                    }

                    if (key.call('__hash__')) {
                        return 1;
                    }
                case 1:
                    if (!vm.return_value) {
                        return;
                    }
                    frame.locals.entry = self.table[vm.return_value.string()];
                case 2:
                    if (!frame.locals.entry) {
                        state = 4;
                        break;
                    }
                    if (key.call('__eq__', [frame.locals.entry.key])) {
                        return 3;
                    }
                case 3:
                    if (!vm.return_value) {
                        return;
                    }
                    if (vm.return_value.bool()) {
                        return frame.locals.entry.value;
                    } else {
                        state = 2;
                        frame.locals.entry = frame.locals.entry.next;
                        break;
                    }
                case 4:
                    raise(KeyError, new Exception([key], KeyError));
            }
    }
}, ['key']);

Dict.$def('__setitem__', function (self, key, value, state, frame) {
    while (true) {
        switch (state) {
                case 0:
                    Dict.check(self);

                    if (key instanceof Str) {
                        self.set(key, value);
                        return;
                    }

                    if (key.call('__hash__')) {
                        return 1;
                    }
                case 1:
                    if (!vm.return_value) {
                        return;
                    }
                    frame.locals.hash = vm.return_value.string();
                    frame.locals.entry = self.table[frame.locals.hash];
                case 2:
                    if (!frame.locals.entry) {
                        state = 4;
                        break;
                    }
                    if (key.call('__eq__', [frame.locals.entry.key])) {
                        return 3;
                    }
                case 3:
                    if (!vm.return_value) {
                        return;
                    }
                    if (vm.return_value.bool()) {
                        frame.locals.entry.value = value;
                        return;
                    } else {
                        state = 2;
                        frame.locals.entry = frame.locals.entry.next;
                        break;
                    }
                case 4:
                    self.table[frame.locals.hash] = new Dict.Entry(key, value, self.table[frame.locals.hash]);
                    self.size++;
                    return;
            }
    }
}, ['key', 'value']);


Dict.$def('pop', function (self, key, state, frame) {
    while (true) {
        switch (state) {
                case 0:
                    Dict.check(self);

                    if (key instanceof Str) {
                        if (!self.pop(key)) {
                            raise(KeyError, new Exception([key], KeyError));
                        }
                        return;
                    }

                    if (key.call('__hash__')) {
                        return 1;
                    }
                case 1:
                    if (!vm.return_value) {
                        return;
                    }
                    frame.locals.hash = vm.return_value.string();
                    frame.locals.entry = self.table[frame.locals.hash];
                    frame.locals.previous = null;
                case 2:
                    if (!frame.locals.entry) {
                        state = 4;
                        break;
                    }
                    if (key.call('__eq__', [frame.locals.entry.key])) {
                        return 3;
                    }
                case 3:
                    if (!vm.return_value) {
                        return;
                    }
                    if (vm.return_value.bool()) {
                        if (frame.locals.previous) {
                            frame.locals.previous.next = frame.locals.entry.next;
                        } else if (frame.locals.entry.next) {
                            self.table[frame.locals.hash] = frame.locals.entry.next;
                        } else {
                            delete self.table[frame.locals.hash];
                        }
                        self.size--;
                        return frame.locals.entry.value;
                    } else {
                        state = 2;
                        frame.locals.previous = frame.locals.entry;
                        frame.locals.entry = frame.locals.entry.next;
                        break;
                    }
                case 4:
                    raise(KeyError, new Exception([key], KeyError));
            }
    }
}, ['key']);

Dict.$def('__delitem__', function (self, key) {
    return self.call('pop', [key]);
}, ['key']);

Dict.$def('__contains__', function (self, key, state, frame) {
    switch (state) {
        case 0:
            self.call('__getitem__', [key]);
            return 1;
        case 1:
            return except(KeyError) ? False : True;
    }
}, ['key']);


Dict.$map('__len__');

Dict.$map('copy');
Dict.$map('clear');
Dict.$map('keys');
Dict.$map('items');
Dict.$map('values');


Dict.Values.$map('__len__');
Dict.Keys.$map('__len__');

Dict.Items.$map('__len__');
Dict.Items.$map('__iter__');
Dict.Items.Iterator.$map('__iter__');
Dict.Items.Iterator.$def('__next__', function (self) {
    Dict.Items.Iterator.check(self);
    var next = self.next();
    if (!next) {
        raise(StopIteration, 'iteration has been stopped');
    }
    return next;
});
