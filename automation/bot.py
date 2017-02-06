#!/usr/bin/env python

from pyvirtualdisplay import Display
from splinter import Browser
import random
import time


display = Display(visible=0, size=(800, 600))
display.start()
random.seed()
rooms = ['america', 'africa', 'asia', 'europe', 'antarctica', 'australia']
users = ['user1', 'user2', 'user3', 'user4']
with open("random_sentences.txt") as f:
    content = f.readlines()
t = random.randint(2,7)
#executable_path = {'executable_path':'/usr/bin/'}
with Browser() as browser:
    # Visit URL
    url = "http://128.107.18.2:8000"
    browser.visit(url)
    for iter in xrange(0,500):
      try:
        browser.find_by_id('message_text').fill(random.choice(content))
      except Exception as e:
        print e
        pass
      finally:
        time.sleep(t)
