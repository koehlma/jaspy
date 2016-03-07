import time
import dom


def run():
    start = time.time()
    x = 0
    while x < 5000:
        x += 1
    stop = time.time()
    return stop - start


def run1():
    start = time.time()
    x = 0
    while x < 5000:
        dom.Element('div')
        x += 1
    stop = time.time()
    return stop - start

a = 0
total = 0
while a < 10:
    a += 1
    total += run()
print(total / 10)

c = '''
import js
import time

document = js.globals['document']

def run():
    start = time.time()

    x = 0
    while x < 5000:
        document.createElement('div')
        x += 1
    stop = time.time()
    return stop - start

def run():
    start = time.time()
    x = 0
    while x < 5000:
        x += 1
    stop = time.time()
    return stop - start

a = 0
total = 0
while a < 10:
    a += 1
    total += run()
print(total / 10)
'''