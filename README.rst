Jaspy
=====

.. image:: https://badges.gitter.im/koehlma/jaspy.svg
   :alt: Join the chat at https://gitter.im/koehlma/jaspy
   :target: https://gitter.im/koehlma/jaspy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

|pypi| |build| |coverage| |docs|

Jaspy is a Python VM written entirely from scratch in JavaScript with some unique
features. Jaspy supports multiple threads, comes with an integrated debugger which
offers remote debugging and provides a flexible preprocessor based architecture.
Speed is explicitly not a main goal of this project. Jaspy aims to illustrate how
web programming on the client side could be done by exploring new ways.


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

Quickstart
----------
Jaspy comes with an integrated development server and interactive debugger!

First clone the repository and build the interpreter:

.. code:: sh

    git clone --recursive https://github.com/koehlma/jaspy.git; cd jaspy
    python3 build.py  # compile the interpreter

Install dependencies for the interactive console, if they are not installed already:

.. code:: sh

    pip3 install --user -r requirements.txt
    pip3 install --user ptpython pygments


Switch to the example directory and start the server in interactive mode:

.. code:: sh

    cd example
    PYTHONPATH=../ python3 -m jaspy.cli --interactive

Visit http://localhost:8080/hello.html in your browser and click run:

.. image:: https://raw.githubusercontent.com/koehlma/jaspy/master/example/debugger.gif
    :alt: Jaspy Screencast
    :align: center


Alternatives
------------
There are already many other Python-to-JavaScript approaches out there:

- `Brython <http://www.brython.info/>`_
- `PyPy.js <http://pypyjs.org/>`_
- `Skulpt <http://www.skulpt.org/>`_
- `Batavia <https://github.com/pybee/batavia>`_
- `Pyjs <http://pyjs.org/>`_
- …

Most of them are faster than Jaspy but none of them offers the unique features of
Jaspy, which are the fully suspendable interpreter with threading support, the
integrated debugger and the flexible, preprocessor based architecture.


State
-----
This project is still in an alpha state. The APIs are unstable, it is untested and not
ready for productive use. Some of the features listed above aren't yet implemented.


Todo
----
If you like the ideas of Jaspy feel free to join, there are many things to do:

- implement all the batteries-included-builtin stuff of Python
- implement native JS modules for the DOM, JS objects and some Web APIs
- improve the debugger and make it fully compatible to the PyDev protocol
- implement a parser and bytecode compiler in JavaScript
- support for Apache Cordova (Jaspy for cross platform mobile applications)
- implement a neat UI library on top of Jaspy (using a flexbox based grid)
- … and, of course, your own great ideas and cool features


Structure
---------

:libs: third-party dependencies
:modules: bundled native JavaScript modules
:src: JavaScript source files (need to be preprocessed)
:jaspy: Python server, converter and remote debugger


.. |pypi| image:: https://img.shields.io/pypi/v/jaspy.svg?style=flat-square&label=latest%20version
    :target: https://pypi.python.org/pypi/jaspy

.. |build| image:: https://img.shields.io/travis/koehlma/jaspy/master.svg?style=flat-square&label=build
    :target: https://travis-ci.org/koehlma/jaspy

.. |docs| image:: https://readthedocs.org/projects/jaspy/badge/?version=latest&style=flat-square
    :target: https://jaspy.readthedocs.org/en/latest/

.. |coverage| image:: https://img.shields.io/coveralls/koehlma/jaspy/master.svg?style=flat-square
    :target: https://coveralls.io/github/koehlma/jaspy?branch=master


Credits
-------
Many thanks to the `Brython <http://www.brython.info/>`_ project for the inspiration for
many parts of code of the builtin-classes. Many thanks also to the book `“500 Lines or
Less”`_ which is a good starting point if you want to know how the interpreter works.

.. _`“500 Lines or Less”`: http://aosabook.org/en/500L/a-python-interpreter-written-in-python.html
