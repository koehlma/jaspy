Jaspy
=====
Jaspy is a Python VM written entirely from scratch in JavaScript with interpreter size
and coroutine support in mind. It interprets CPython 3.5 bytecode within the browser and
aims to replace JavaScript as main web scripting language.

Features
--------
- easily **extensible** with native JavaScript modules (time_, dom_, …)
- **suspendable** interpreter (coroutine and greenlet support)
- full support for meta-classes and builtin subclassing

.. _BigInteger.js: https://github.com/peterolson/BigInteger.js
.. _time: https://github.com/koehlma/jaspy/blob/master/modules/time.js
.. _dom: https://github.com/koehlma/jaspy/blob/master/modules/dom.js


State
-----
This project is still in an pre-alpha planning state. The APIs are unstable, it is
untested and not ready for productive use.
