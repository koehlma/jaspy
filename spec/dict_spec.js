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

        expect(dict.entries().size, 0);

        dict.set('abc', 42);
        dict.set('abc', 31415);

        expect(dict.entries().size, 1);
        expect(dict.entries().get(0).key.equals('abc')).toBe(jaspy.True);
        expect(dict.entries().get(0).value).toBe(31415);
    })
});