function PyBytes(value, cls) {
    PyObject.call(this, cls || py_bytes);
    this.value = value;
}
PyBytes.prototype = new PyObject;