/*
 * Copyright (C) 2016, Maximilian Koehl <mail@koehlma.de>
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */


var GeneratorFunction = Object.getPrototypeOf(function* () {}).constructor;

var Thread = Class({
    constructor: function () {
        this.state = 0;
    }
});

var Lock = Class({

});



Thread.SUSPEND = {};
Thread.WAIT = {};


var coroutine = (function () {

    var Thread = Class({
        constructor: function (entry, args) {
            this.stack = [entry.apply(null, args)]
        },

        run: function () {

        }
    });

    function decorator(func) {
        function wrapper() {

        }
        return wrapper;
    }
});


/*
function coroutine(func) {
	return func;
}

var add = coroutine(function* (a, b) {
	yield Thread.PAUSE;
  return a + b;
});

var main = coroutine(function* (a) {
	var result = yield add(a, 5);
  return result;
});


function Thread(entry, args) {
	this.stack = [entry.apply(null, args)];
  console.log(this.stack);
}

Thread.PAUSE = {};

Thread.prototype.run = function () {
	var result = undefined;
  while (this.stack.length > 0) {
    var state = this.stack[this.stack.length - 1].next(result);
    if (state.done) {
      this.stack.pop();
      result = state.value;
    } else if (state.value === Thread.PAUSE) {
    	return;
    } else {
      this.stack.push(state.value);
    }
  }
  return result;
}

var thread = new Thread(main, [3]);
console.log(thread);
console.log(thread.run());
console.log(thread.run());
 */