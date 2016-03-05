function PyFloat(value, cls) {
    PyObject.call(this, cls || py_float);
    this.value = value;
}

PyFloat.prototype = new PyObject;