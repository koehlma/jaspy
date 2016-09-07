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

import sys
import time

import _thread

import dom


# command line arguments
print('command line arguments:')
print(sys.argv)

print('Hello ', sys.argv[1])


for x in ['abc', 1, 2, True, None]:
    print(x)


# dom manipulation
p = dom.Element('p')
p.text = 'Hello ' + sys.argv[1]
p.css('background', 'black')
p.css('color', 'white')

dom.get_body().append(p)


# exceptions
def recursion(level=10):
    if level < 0:
        raise Exception('example exception')
    else:
        recursion(level - 1)

try:
    recursion()
except Exception:
    print('exception caught!')


# event listeners
def on_click(element):
    print('click on element', element)


button = dom.Element('button')
button.text = 'Click Me!'
button.register_listener('click', on_click)
button.css('background', 'white')
button.css('color', 'black')

dom.get_body().append(button)

print(hash('abc'))

example_dict = {
    '123': 'abc',
    123: 'xyz'
}

if example_dict['123'] == 'abc' and example_dict[123] == 'xyz':
    for key, value in example_dict.items():
        print(key, value)
    if 123 in example_dict and True not in example_dict:
        del example_dict['123']
        try:
            print('Error:', example_dict['123'])
        except KeyError:
            print('Dictionaries are working!')


# multiple threads
def button_animation():
    state = True
    while True:
        # this also works without time sleep because jaspy provides preemptive
        # multitasking but it would produce an enormous load
        time.sleep(0.5)
        if state:
            button.css('background', 'black')
            button.css('color', 'white')
            state = False
        else:
            button.css('background', 'white')
            button.css('color', 'black')
            state = True


thread = _thread.start_new_thread(button_animation)
