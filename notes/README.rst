Notes
=====

This directory contains some notes about Jaspy.


Execution Model
===============
There are two different execution modes — synchronous and asynchronous.

Example:

Dict.set called in synchronous mode finishes execution and might call python code.

Dict.set called in asynchronous mode returns a coroutine which should be yielded.

This way it is possible to write function which work when called from JavaScript directly
but also allow the Python interpreter to provide features like threading. When using the
asm.js or speedy backend the interpreter is also in synchronous mode which allows to call
Python code. Greenlets, debugging and threading and all other features which require the
interpreter to be suspendable only work in asynchronous mode.

Asynchronous functions have to be decorated using the coroutine decorator.

Example:

.. code:: javascript

    Dict.set = coroutine(function (self, key, value) {
        var hash = yield key.hash();
        // do insertion
    });


Synchronous Mode:

.. code:: javascript

    Dict.set(key, value)  // blocks

Asynchronous Mode:

.. code:: javascript

    yield Dict.set(key, value)  // blocks
    Dict.set(key, value)        // is non-blocking
