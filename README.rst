Jaspy
=====
Jaspy is a Python virtual machine written entirely from scratch in JavaScript
with some unique features in mind. Jaspy supports multiple threads, comes with
an integrated debugger which offers remote debugging and provides a flexible
preprocessor based architecture.

Speed is explicitly not a main goal of this project. Jaspy aims to illustrate how web
programming on the client side could be done by exploring new ways.

Features
--------
- **suspendable** interpreter with support for **threading** and greenlets
- integrated **debugger** and interactive remote debugging (CLI, PyCharm, …)
- **flexible** preprocessor based architecture to optimize Jaspy for your needs
- easily **extensible** with native JavaScript modules (time_, dom_, …)
- full support for meta-classes, builtin subclassing and operator overloading
- asynchronous imports and arbitrary-length integers based on BigInteger.js_

.. _BigInteger.js: https://github.com/peterolson/BigInteger.js
.. _time: https://github.com/koehlma/jaspy/blob/master/modules/time.js
.. _dom: https://github.com/koehlma/jaspy/blob/master/modules/dom.js

Alternatives
------------
There are already many other Python to JavaScript approaches out there:

- `Brython <http://www.brython.info/>`_
- `PyPy.js <http://pypyjs.org/>`_
- `Skulpt <http://www.skulpt.org/>`_
- `Batavia <https://github.com/pybee/batavia>`_
- `Pyjs <http://pyjs.org/>`_
- …

Most of them are faster than Jaspy but none of them offers the unique features of Jaspy
which are a fully suspendable interpreter with threading support, the integrated debugger
and the flexible, preprocessor based architecture.

State
-----
This project is still in an alpha state. The APIs are unstable, it is untested and not
ready for productive use. Some of the features listed above aren't yet implemented.

Todo
----
If you like the ideas of Jaspy feel free to join, there are many things to do:

- [ ] implement all the batteries included builtin stuff from Python
- [ ] implement native JS modules for the DOM, JS objects and some Web APIs
- [ ] improve the debugger and make it fully compatible to the PyDev protocol
- [ ] implement a parser and bytecode compiler in JavaScript
- [ ] support for Apache Cordova (Jaspy for cross platform mobile applications)
- [ ] implement a neat UI library on top of Jaspy
- [ ] … and, yes of course, your own great ideas
