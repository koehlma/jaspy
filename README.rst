Jaspy
=====

|pypi| |build| |coverage| |docs| |gitter|

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

First install the dependencies, if they are not installed already:

.. code:: sh

    pip3 install --user -r requirements.txt
    pip3 install --user ptpython pygments

Clone the repository and build the interpreter:

.. code:: sh

    git clone --recursive https://github.com/koehlma/jaspy.git; cd jaspy
    python3 build.py  # build the interpreter

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


Speed
-----
Just to get an impression how slow Jaspy really is!

+-----------------------------------------------+------------------+
|                                               | pystones/second  |
+===============================================+==================+
| Jaspy (enabled Debugger, enabled Threading)   | 195              |
+-----------------------------------------------+------------------+
| Jaspy (disabled Debugger, enabled Threading)  | 199              |
+-----------------------------------------------+------------------+
| Jaspy (disabled Debugger, disabled Threading) | 206              |
+-----------------------------------------------+------------------+
| Brython                                       | 4184             |
+-----------------------------------------------+------------------+
| PyPy.js (cold)                                | 41425            |
+-----------------------------------------------+------------------+
| PyPy.js (warm)                                | 847457           |
+-----------------------------------------------+------------------+

However this is a somewhat unfair benchmark because no dom manipulation or anything
else browser specific is going on. Surprisingly threading and debugging introduces nearly
no overhead.


State
-----
This project is still in an alpha state. The APIs are unstable, it is untested and not
ready for productive use. Some of the features listed above are not yet implemented.

I started this project in my semester break and now, as the new semester started, I have
much less spare time. Therefore it might take a while until I will be able to invest much
more time into it. However I very welcome all sorts of contributions.


Contributions
-------------
If you like the ideas of Jaspy feel free to join, there are many things to do:

- implement all the batteries-included-builtin stuff of Python
- implement native JS modules for the DOM, JS objects and some Web APIs
- improve the debugger and make it fully compatible to the PyDev protocol
- implement a parser and bytecode compiler in JavaScript
- complete and adjust the implementation of the Python bytecode VM
- support for Apache Cordova (Jaspy for cross platform mobile applications)
- implement a neat UI library on top of Jaspy (using a flexbox based grid)
- implement a just-in-time compiler to speed things up
- add a virtual file system (consider using: `BrowserFS <https://github.com/jvilk/BrowserFS>`_)
- … and, of course, your own great ideas and cool features

Do not hesitate to contribute or ask if there is anything unclear about the code.


Structure
---------

:libs: third-party dependencies
:modules: bundled native JavaScript modules
:src: JavaScript source files (need to be preprocessed)
:jaspy: Python server, converter and remote debugger


Credits
-------
Many thanks to the `Brython <http://www.brython.info/>`_ project for the inspiration for
many parts of code of the builtin-classes. Many thanks also to the book `“500 Lines or
Less”`_ which is a good starting point if you want to know how the interpreter works.

.. _`“500 Lines or Less”`: http://aosabook.org/en/500L/a-python-interpreter-written-in-python.html


.. |pypi| image:: https://img.shields.io/pypi/v/jaspy.svg?style=flat-square&label=latest%20version
    :target: https://pypi.python.org/pypi/jaspy

.. |build| image:: https://img.shields.io/travis/koehlma/jaspy/master.svg?style=flat-square&label=build
    :target: https://travis-ci.org/koehlma/jaspy

.. |docs| image:: https://readthedocs.org/projects/jaspy/badge/?version=latest&style=flat-square
    :target: https://jaspy.readthedocs.org/en/latest/

.. |coverage| image:: https://img.shields.io/coveralls/koehlma/jaspy/master.svg?style=flat-square
    :target: https://coveralls.io/github/koehlma/jaspy?branch=master

.. |gitter| image:: https://img.shields.io/badge/gitter-join%20chat-1dce73.svg?style=flat-square
    :target: https://gitter.im/koehlma/jaspy
