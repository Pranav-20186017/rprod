import random
import json
obj = dict()

for i in range(1,500001):
	temp = dict()
	id = str(i).zfill(6)
	temp['id'] = id
	temp['one'] = random.randrange(1,100,1)
	temp['two']  = random.randrange(1,100,1)
	temp['three']  = random.randrange(1,100,1)
	temp['four']  = random.randrange(1,100,1)
	temp['five']  = random.randrange(1,100,1) 
	temp['six']  = random.randrange(1,100,1)
	obj[id] = temp
	print(str(i) + "th iteration completed")


with open('result.json', 'w') as fp:
    json.dump(obj, fp)
