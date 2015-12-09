from splinter import Browser
import random
import time
random.seed()
rooms = ['america', 'africa', 'asia', 'europe', 'antarctica', 'australia']
users = ['user1', 'user2', 'user3', 'user4']
with open("random_sentences.txt") as f:
    content = f.readlines()
t = random.randint(2,7)
with Browser() as browser:
    # Visit URL
    url = "chat.ciscozeus.io:8889"
    browser.visit(url)
    for iter in xrange(0,15):
      try:
        browser.find_by_id('message_text').fill(random.choice(content))
      except:
        pass
      finally:
        time.sleep(t)
