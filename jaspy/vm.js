function VM() {
    this.frame = null;

    this.return_value = None;
    this.last_exception = null;
}
VM.prototype.pause = function () {
    this.frame = null;
};
VM.prototype.step = function () {
    this.frame.step();
};
VM.prototype.except = function (exc_type) {
    if (!this.return_value && this.last_exception.exc_type.is_subclass_of(exc_type)) {
        this.return_value = None;
        return true;
    }
    return false;
};
VM.prototype.raise = function (exc_type, exc_value, exc_tb) {
    if (typeof exc_value == 'string') {
        exc_value = new_exception(exc_type, exc_value);
    }
    if (this.return_value === null) {
        exc_value.dict.set('__context__', this.last_exception.exc_value);
    } else {
        this.return_value = null;
    }

    if (!exc_tb) {
        // TODO: create traceback
        exc_tb = None;
        //console.log(exc_value);
        exc_value.dict.set('__traceback__', exc_tb);
    }
    this.last_exception = {exc_type: exc_type, exc_value: exc_value, exc_tb: exc_tb};
};
VM.prototype.run = function (object, args, kwargs) {
    var old_frame = this.frame;
    var old_vm = vm;
    vm = this;
    jaspy.vm = this;
    if (object instanceof PythonCode) {
        object = new_code(object);
    }
    if (object instanceof Frame) {
        this.frame = object;
    } else if (object instanceof PyCode) {
        this.frame = new PythonFrame(object.value, {
            vm: this, builtins: builtins,
            globals: {
                '__name__': new_str('__main__')
            }
        })
    } else {
        error('object is not runnable');
    }
    while (this.frame) {
        this.frame.step();
    }
    this.frame = old_frame;
    vm = old_vm;
    if (!this.return_value) {
        console.log(this.last_exception.exc_value.dict.get('args').value[0].value)
    }
};
VM.prototype.call_object = function (object, args, kwargs, defaults, closure) {
    var code, result, frame, vm = this;
    while (true) {
        if (object instanceof PythonCode) {
            this.frame = new PythonFrame(object, {
                vm: vm, back: vm.frame, defaults: defaults,
                args: args, kwargs: kwargs, closure: closure
            });
            return true;
        } else if (object instanceof NativeCode) {
            if (object.simple) {
                try {
                    args = object.parse_args(args, kwargs, defaults);
                    result = object.func.apply(null, args);
                    vm.return_value = result || None;
                } catch (error) {
                    if (error instanceof PyObject) {
                        vm.raise(error.cls, error);
                        this.frame = this.frame.back;
                    } else {
                        throw error;
                    }
                }
                return false;
            } else {
                this.frame = frame = new NativeFrame(object, {
                    vm: vm, back: vm.frame, defaults: defaults,
                    args: args, kwargs: kwargs
                });
                try {
                    result = object.func.apply(null, vm.frame.args.concat([frame.position, frame]));
                    if (result == undefined || result instanceof PyObject) {
                        if (vm.return_value) {
                            vm.return_value = result || None;
                        }
                        vm.frame = frame.back;
                        return false;
                    } else {
                        frame.position = result;
                        return true;
                    }
                } catch (error) {
                    if (error instanceof PyObject) {
                        vm.raise(error.cls, error);
                        this.frame = this.frame.back;
                        return false;
                    } else {
                        throw error;
                    }
                }
            }
        } else if (object.cls === py_function) {
            code = object.dict.get('__code__');
            closure = object.dict.get('__closure__');
            if (code.cls === py_code) {
                defaults = object.defaults;
                object = code.value;
                if (closure instanceof PyTuple) {
                    closure = closure.value;
                }
            } else {
                this.raise(TypeError, 'invalid type of function code')
            }
        } else if (object instanceof PyMethod) {
            args = [object.self].concat(args);
            object = object.func;
        } else if (object instanceof PyObject) {
            result = object.call_method('__call__', args, kwargs);
            if (vm.except(MethodNotFoundError)) {
                vm.raise(TypeError, 'object is not callable');
            }
            return result;
        } else {
            error('invalid callable');
        }
    }
};
var vm