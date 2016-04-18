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


describe('Dict', function () {
    it('operations', function () {
        var dict = new jaspy.Dict();

        dict.set('abc', 42);
        expect(dict.get('abc')).toBe(42);
        dict.set('abc', 31415);
        expect(dict.pop('abc')).toBe(31415);

        expect(dict.get('abc')).toBe(undefined);
        expect(dict.get('abc', 123)).toBe(123);
    });

    it('entries', function () {
        var dict = new jaspy.Dict();

        expect(dict.entries().length, 0);

        dict.set('abc', 42);
        dict.set('abc', 31415);

        expect(dict.entries().length, 1);
        expect(dict.entries()[0].key.equals('abc')).toBe(jaspy.True);
        expect(dict.entries()[0].value).toBe(31415);
    });

    it('size', function () {
        var dict = new jaspy.Dict();

        expect(dict.size).toBe(0);

        dict.set('abc', 42);
        dict.set('abc', 31415);
        dict.set('xyz', 4242);

        expect(dict.size).toBe(2);

        dict.pop('abc');

        expect(dict.size).toBe(1);

        dict.pop('xyz');

        expect(dict.size).toBe(0);
    })
});