import dom

wrapper = dom.Element()
wrapper.css('background', '#FF0000')

p = wrapper.p
p.text = 'Hallo Welt!'
print(p)
print(p.text)

p = wrapper.p
p['style'] = 'background: #00FF00'
p.html = '<strong>Hallo Python!</strong>'


print(dom.get_body())

dom.get_body().append(wrapper)