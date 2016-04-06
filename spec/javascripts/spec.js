describe('object tests', function () {
    it('isinstance tests', function () {
        expect(jaspy.isinstance(null, jaspy.NoneType)).toBe(true);
        expect(jaspy.isinstance(undefined, jaspy.NoneType)).toBe(true);

        expect(jaspy.isinstance([], jaspy.py_js_array)).toBe(true);
        expect(jaspy.isinstance({}, jaspy.py_js_object)).toBe(true);

        expect(jaspy.isinstance(function () {}, jaspy.py_js_function)).toBe(true);

        expect(jaspy.isinstance(bigInt('10e200'), jaspy.py_int)).toBe(true);
        expect(jaspy.isinstance(bigInt(3), jaspy.py_int)).toBe(true);

        expect(jaspy.isinstance("abc", jaspy.py_str)).toBe(true);
        expect(jaspy.isinstance(3, jaspy.py_float));

        expect(jaspy.isinstance(new jaspy.Tuple([1, 2, 3]), jaspy.py_tuple)).toBe(true);
        expect(jaspy.isinstance(new jaspy.List([1, 2, 3]), jaspy.py_list)).toBe(true);

        expect(jaspy.isinstance(true, jaspy.py_bool)).toBe(true);
        expect(jaspy.isinstance(true, jaspy.py_int)).toBe(true);
        expect(jaspy.isinstance(false, jaspy.py_bool)).toBe(true);
        expect(jaspy.isinstance(false, jaspy.py_int)).toBe(true);

        expect(jaspy.isinstance(3, jaspy.py_str)).toBe(false);
    });

    it('id tests', function () {
        expect(jaspy.id(null)).toBe(0);
        expect(jaspy.id(undefined)).toBe(0);
        
        var object = {};
        expect(jaspy.id(object)).toBe(object.__jaspy_id__);
    });

    it('is tests', function () {
        expect(jaspy.is(bigInt(3), bigInt(3))).toBe(true);
        expect(jaspy.is(undefined, null)).toBe(true);
        expect(jaspy.is("abc", "abc")).toBe(true);

        expect(jaspy.is(bigInt(0), false)).toBe(false);
    });
});