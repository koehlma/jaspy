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

jaspy.module('sys', function ($, module) {
    module.$set('byteorder', $.pack_str('big'));

    module.$set('copyright', $.pack_str('Copyright (C) 2016, Maximilian Koehl'));

    module.$set('platform', $.pack_str('web'));

    module.$set('implementation', $.pack_str('jaspy'));

    module.$set('jaspy_version', $.pack_str('0.0.1dev'));

    module.$set('modules', new $.PyDict($.modules));
});