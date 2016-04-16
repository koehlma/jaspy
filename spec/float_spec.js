/*
 * Copyright (C) 2016, Matthias Heerde <mail@m-heerde.de>
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


describe('jaspy.Float', function () {
    it('unpack', function () {
        expect(jaspy.Float.unpack(42.42)).toBe(42.42);
        expect(jaspy.Float.unpack(new jaspy.Int(42))).toBe(42);
        expect(function () { jaspy.Float.unpack(jaspy.None); }).toThrowError(/TypeError/);
        expect(function () { jaspy.Float.unpack(new jaspy.Str('42.42')); }).toThrowError(/TypeError/);
        expect(jaspy.Float.unpack(jaspy.None, 42.42)).toBe(42.42);
    });

    it('equals', function() {
        expect((new jaspy.Float(42)).equals(42)).toBe(jaspy.True);
        expect((new jaspy.Float(42)).equals((new jaspy.Int(42)))).toBe(jaspy.True);
        expect((new jaspy.Float(42)).equals((new jaspy.Float(42)))).toBe(jaspy.True);
    });

    it('add', function () {
        expect(((new jaspy.Float(21)).add(21)).equals(42)).toBe(jaspy.True);
        expect(((new jaspy.Float(21)).add(new jaspy.Float(21))).equals(42)).toBe(jaspy.True);
        expect(((new jaspy.Float(21)).add(new jaspy.Float(21))).equals(new jaspy.Float(42))).toBe(jaspy.True);
    });

    it('is_integer', function () {
        expect((new jaspy.Float(42.42)).is_integer()).toBe(jaspy.False);
    })
});