function PyCode(value, cls) {
    PyObject.call(this, cls || py_code);
    this.value = value;
}
PyCode.prototype = new PyObject;