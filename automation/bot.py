from splinter import Browser
import random
import time
random.seed()
rooms = ['america', 'africa', 'asia', 'europe', 'antarctica', 'australia']
users = ['user1', 'user2', 'user3', 'user4']
with open("random_sentences.txt") as f:
    content = f.readlines()
t = random.randint(1,4)
with Browser() as browser:
    # Visit URL
    url = "chat.ciscozeus.io:8889"
    browser.visit(url)
    while True:
      try:
        browser.find_by_id('message_text').fill(random.choice(content))
      except:
        pass
      finally:
        time.sleep(t)
