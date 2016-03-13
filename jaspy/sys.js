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
        cls.check_subclass(VersionInfo);
        return new $.PyTuple([major, minor, micro, releaselevel, serial], cls);
    }, ['major', 'minor', 'patch', 'releaselevel', 'serial']);

    VersionInfo.$def('__str__', function (self) {
        self.check_type(VersionInfo);
        return $.pack_str('version_info(' +
            'major=' + self.array[0] + ', ' +
            'minor=' + self.array[1] + ', ' +
            'micro=' + self.array[2] + ', ' +
            'releaselevel=' + self.array[3].repr() + ', ' +
            'serial=' + self.array[4] + ')');
    });

    VersionInfo.$def_property('major', function (self) {
        self.check_type(VersionInfo);
        return self.array[0];
    });

    module.$set('byteorder', $.pack_str('big'));

    module.$set('copyright', $.pack_str('Copyright (C) 2016, Maximilian Koehl'));

    module.$set('platform', $.pack_str('web'));

    module.$set('implementation', $.pack_str('jaspy'));

    module.$set('version', $.pack_str('3.5.1'));
    module.$set('version_info', VersionInfo.create([$.pack_int(3), $.pack_int(5), $.pack_int(0), $.pack_str('dev'), $.pack_str(0)]));

    module.$set('jaspy_version', $.pack_str('/* {{metadata.__version__}} */'));
    module.$set('jaspy_version_info', VersionInfo.create([
        $.pack_int(/* {{metadata.__version_info__[0]}} */),
        $.pack_int(/* {{metadata.__version_info__[1]}} */),
        $.pack_int(/* {{metadata.__version_info__[2]}} */),
        $.pack_str('/* {{metadata.__version_info__[3]}} */'),
        $.pack_int(/* {{metadata.__version_info__[4]}} */)])
    );

    module.$set('modules', new $.PyDict($.modules));

    console.log('... Jaspy Python Interpreter\n... Copyright (C) 2016, Maximilian Koehl');
}, ['builtins']);