function PyModule(namespace) {
    PyObject.call(this, py_module, namespace);
}
PyModule.prototype = new PyObject;
