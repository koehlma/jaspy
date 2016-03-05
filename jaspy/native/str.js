function PyStr(value, cls) {
    PyObject.call(this, cls || py_str);
    this.value = value;
}

PyStr.prototype = new PyObject;