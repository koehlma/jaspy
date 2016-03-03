import dom
import time


print(__name__)

wrapper = dom.Element()
wrapper.css('background', '#FF0000')
print(wrapper.css('background'))

p = wrapper.p
p.text = 'Hallo Welt!'
print(p)
print(p.text)

p = wrapper.p
p['style'] = 'background: #00FF00'
p.html = '<strong>Hallo Python!</strong>'



print(dom.get_body())

dom.get_body().append(wrapper)

x = True
while True:
    time.sleep(0.5)
    if x:
        p.css('background', '#00FF00')
        x = False
    else:
        p.css('background', '#0000FF')
        x = True
