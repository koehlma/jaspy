jaspy.module('sys', function ($, module) {
    module.$set('byteorder', $.pack_str('big'));

    module.$set('implementation', $.pack_str('jaspy'));
});