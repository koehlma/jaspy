var object_id_counter = 0;

function PyObject(cls, namespace) {
    this.cls = cls;
    this.identity = null;
    this.namespace = namespace || {};
}
PyObject.prototype.bool = function () {
    return true;
};
PyObject.prototype.get_id = function () {
    if (this.identity === null) {
        this.identity = object_id_counter++;
    }
    return this.identity;
};
PyObject.prototype.get_address = function () {
    return ('0000000000000' + this.get_id().toString(16)).substr(-13);
};
PyObject.prototype.is_instance_of = function (cls) {
    return this.cls.is_subclass_of(cls);
};
PyObject.prototype.is_native = function () {
    return this.cls.native === this.cls;
};
PyObject.prototype.call_method = function (name, args, kwargs) {
    var method = this.cls.lookup(name);
    if (method) {
        return call_object(method, [this].concat(args || []), kwargs);
    } else {
        vm.return_value = null;
        vm.last_exception = METHOD_NOT_FOUND;
        return false;
    }
};
PyObject.prototype.setattr = function (name, value) {
    if (!this.namespace) {
        raise(TypeError, 'object does not support attribute access');
    }
    if (name instanceof PyStr) {
        name = name.value;
    }
    this.namespace[name] = value;
};
PyObject.prototype.getattr = function (name) {
    if (!this.namespace) {
        raise(TypeError, 'object does not support attribute access');
    }
    if (name instanceof PyStr) {
        name = name.value;
    }
    return this.namespace[name]
};
PyObject.prototype.unpack = function (name) {
    var item = this[name];
    if (!item) {
        raise(TypeError, 'unable to unpack ' + name + ' from object');
    }
    return item;
};
PyObject.prototype.pack = function (name, value) {
    this[name] = value;
};

PyObject.prototype.is = function (other) {
    return this === other;
};