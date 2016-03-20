import _thread
import time


def test():
    while True:
        time.sleep(0.03)
        print('Loop 1: ' + str(42))


_thread.start_new_thread(test)

counter = 0
while True:
    if counter > 50000:
        counter = 0
        print('Loop 2: ' + str(42))
    counter += 1
