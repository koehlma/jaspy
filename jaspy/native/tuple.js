function PyTuple(value, cls) {
    PyObject.call(this, cls || py_tuple);
    this.value = value;
}
PyTuple.prototype = new PyObject;