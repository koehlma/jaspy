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


describe('Executor', function () {
    it('faculty', function () {
        var $ = jaspy;

        var fac = $._(function* (n) {
            return n > 1 ? n * (yield fac(n - 1)) : 1;
        });

        expect(fac(10)).toBe(3628800);

        var thread = new $.Microthread(fac, 10);
        expect(thread.run()).toBe(3628800);
    });

    it('suspension', function () {
        var $ = jaspy;

        var test = $._(function* () {
            var value = yield new $.Suspension();
            return value;
        });

        var thread = new $.Microthread(test);
        var suspension = thread.run();
        expect(suspension instanceof $.Suspension).toBeTruthy();
        suspension.set_result(42);
        expect(thread.run(suspension)).toBe(42);

        expect(function () { test(); }).toThrowError(/ExecutorError/);
    });
});