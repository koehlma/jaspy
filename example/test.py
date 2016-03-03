import dom
import time


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
while x < 5000: x += 1
stop = time.time()
print(x)
print(stop - start)


x = True
while True:
    time.sleep(0.5)
    if x:
        p.css('background', '#00FF00')
        x = False
    else:
        p.css('background', '#0000FF')
        x = True
