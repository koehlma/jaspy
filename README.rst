Jaspy
=====
Jaspy is a Python VM written entirely from scratch in JavaScript with interpreter size,
coroutine support and extensibility in mind. It aims to be fully Python 3 compatible.

State
-----
This project is still in an pre-alpha state. The APIs are unstable, it is untested and not
ready for productive use. Some of the features listed bellow aren't yet implemented.

Features
--------
- easily **extensible** with native JavaScript modules (time_, dom_, …)
- **suspendable** interpreter — support for **threading** and greenlets
- integrated **debugger** — interactive command line remote debugger
- full support for meta-classes and builtin subclassing
- arbitrary-length integers based on BigInteger.js_
- flexible architecture, build your own Jaspy with the modules you really need

.. _BigInteger.js: https://github.com/peterolson/BigInteger.js
.. _time: https://github.com/koehlma/jaspy/blob/master/modules/time.js
.. _dom: https://github.com/koehlma/jaspy/blob/master/modules/dom.js

Build
-----
See `build.py`.
