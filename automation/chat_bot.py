from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from pyvirtualdisplay import Display
import random, time

display = Display(visible=0, size=(800, 600))
display.start()

driver = webdriver.Firefox()
driver.get("http://128.107.18.2:8000")

with open("random_sentences.txt") as f:
    content = f.readlines()
t = random.randint(2,7)
elem = driver.find_element_by_name("message_text")


try:
  elem.send_keys(random.choice(content))
  elem.send_keys(Keys.RETURN)
except Exception as e:
  print e
  pass
finally:
  time.sleep(t)

