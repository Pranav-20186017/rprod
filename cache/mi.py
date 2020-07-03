
import json

with open('results_million.json') as f:
  data = json.load(f)
keys = data.keys()
for _ in keys:
  print("SET" + " " + str(_) + " " + "'" + json.dumps(data[_]) + "'")
  
  
