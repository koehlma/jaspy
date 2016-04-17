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

jaspy.module('sys', function ($, module, builtins) {
    var VersionInfo = module.$class('_VersionInfo', [builtins.tuple]);

    VersionInfo.$def('__new__', function (cls, major, minor, micro, releaselevel, serial) {
        VersionInfo.check_subclass(cls);
        return new $.Tuple([major, minor, micro, releaselevel, serial], cls);
    }, ['major', 'minor', 'patch', 'releaselevel', 'serial']);

    VersionInfo.$def('__str__', function (self) {
        VersionInfo.check(self);
        return $.Str.pack('version_info(' +
            'major=' + self.array[0] + ', ' +
            'minor=' + self.array[1] + ', ' +
            'micro=' + self.array[2] + ', ' +
            'releaselevel=' + self.array[3].repr() + ', ' +
            'serial=' + self.array[4] + ')');
    });

    VersionInfo.$def_property('major', function (self) {
        VersionInfo.check(self);
        return self.array[0];
    });

    module.$set('byteorder', $.Str.pack('big'));

    module.$set('copyright', $.Str.pack('Copyright (C) 2016, Maximilian Koehl'));

    module.$set('platform', $.Str.pack('web'));

    module.$set('implementation', $.Str.pack('jaspy'));

    module.$set('maxunicode', $.pack_int(0xFFFF));

    module.$set('version', $.Str.pack('3.5.1'));
    module.$set('version_info', new $.Tuple([$.pack_int(3), $.pack_int(5), $.pack_int(0), $.Str.pack('dev'), $.Str.pack(0)], VersionInfo));

    module.$set('jaspy_version', $.Str.pack('/* {{metadata.__version__}} */'));
    module.$set('jaspy_version_info', new $.Tuple([
        $.pack_int(/* {{metadata.__version_info__[0]}} */),
        $.pack_int(/* {{metadata.__version_info__[1]}} */),
        $.pack_int(/* {{metadata.__version_info__[2]}} */),
        $.Str.pack('/* {{metadata.__version_info__[3]}} */'),
        $.pack_int(/* {{metadata.__version_info__[4]}} */)], VersionInfo)
    );

    module.$set('modules', new $.Dict($.modules));
}, ['builtins']);