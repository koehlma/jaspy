function PyDict(namespace, cls) {
    PyObject.call(this, cls || py_dict);
    this.table = namespace || {};
}

PyDict.prototype = new PyObject;

PyDict.prototype.get = function (str_key) {
    if (str_key instanceof PyStr) {
        str_key = str_key.value;
    } else if (typeof str_key != 'string') {
        raise(TypeError, 'invalid native dict key type');
    }
    return this.table[str_key];
};

PyDict.prototype.set = function (str_key, value) {
    if (typeof str_key == 'string') {
        str_key = pack_str(str_key);
    } else if (!(str_key instanceof PyStr)) {
        raise(TypeError, 'invalid native dict key type');
    }
    this.table[str_key] = value;
};
PyDict.prototype.pop = function (str_key) {
    var value;
    if (str_key instanceof PyStr) {
        str_key = str_key.value;
    } else if (typeof str_key != 'string') {
        raise(TypeError, 'invalid native dict key type');
    }
    value = this.table[str_key];
    delete this.table[value];
    return value;
};

$.PyDict = PyDict;
