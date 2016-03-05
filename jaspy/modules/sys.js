jaspy.module('sys', function ($, module) {
    module.$set('byteorder', $.new_str('big'));

    module.$set('implementation', $.new_str('jaspy'));
});