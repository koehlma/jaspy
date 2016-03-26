# -*- coding: utf-8 -*-

# Copyright (C) 2016, Maximilian Köhl <mail@koehlma.de>
#
# This program is free software: you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License version 3 as published by
# the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.

import os

from distutils.core import setup


LICENSE = 'License :: OSI Approved :: GNU Lesser General Public License v3 (LGPLv3)'

with open(os.path.join(os.path.dirname(__file__), 'README.rst')) as readme:
    long_description = readme.read()


setup(
    name='jaspy',
    version='0.1.0dev',
    description='Python interpreter in JavaScript',
    long_description=long_description,
    author='Maximilian Köhl',
    author_email='mail@koehlma.de',
    url='https://github.com/koehlma/jaspy',
    license='LGPLv3',
    scripts=['build', 'jaspy'],
    extras_require={
        'interactive remote console': ['ptpython', 'pygments']
    },
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Intended Audience :: Developers',
        LICENSE,
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3',
        'Environment :: Web Environment',
        'Topic :: Internet',
        'Topic :: Internet :: WWW/HTTP :: Browsers',
    ]
)
