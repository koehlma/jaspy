def try_test1():
    try:
        try:
            return 4
        finally:
            raise TypeError()
    except TypeError:
        pass
    return 5

assert try_test1() == 5




import dom
import time
import sys

import example

print(example)
example.example()

print('Implementation:', sys.implementation)

print(__name__)
print(dom)
print(time)

wrapper = dom.Element()
print('wrapper', wrapper)
print('css', wrapper.css)
wrapper.css('background', '#FF0000')
print(wrapper.css('background'))

p1 = wrapper.p
p1.text = 'Hallo Welt!'
print(p1)
print(p1.text)

class Test:
    pass

print(Test)

p = wrapper.p
p['style'] = 'background: #00FF00'
p.html = '<strong>Hallo Python!</strong>'

print(Test.__str__)
print(Test.__name__)

Test.__name__ = 'Test2'

try:
    Test.__name__ = p1
except TypeError:
    print(Test)

print(Test.__class__)

try:
    Test.__class__ = int
except TypeError:
    print('yes')


class Test2():
    pass

x = Test()
x.__class__ = Test2

print(x)

print(int('ff', 16))





def hello(name='World'):
    print('Hello,', name + '!')


hello()

x = 3
print(-x)

print(dom.get_body())

dom.get_body().append(wrapper)

a = dom.Element('a')
a['href'] = '#'
a.text = 'ABC'

p.append(a)

print(x < 10)

print(x + 10)

x += 10

print(x)

#print(time.time())

start = time.time()
x = 0
while x < 5: x += 1
stop = time.time()
print(x)
print(stop - start)

print(str(dom))

print('abc'.startswith('a'))


class ABC:
    def __init__(self):
        raise TypeError()


try:
    ABC()
except TypeError:
    pass



def abc():
    int(None)


try:
    abc()
except TypeError:
    pass


def recursion(value):
    if value <= 0:
        raise Exception('check propagation')
    recursion(value - 1)

try:
    recursion(10)
except Exception:
    pass


print(int.__implementation__)

print(sys.__name__)


x = True
while True:
    time.sleep(0.5)
    if x:
        p.css('background', '#00FF00')
        x = False
    else:
        p.css('background', '#0000FF')
        x = True
