const fs = require('fs')
const fileContents = fs.readFileSync('result.json', 'utf8')
const data = JSON.parse(fileContents);
const redis = require("redis");
const client = redis.createClient({"host":"localhost","port":6379,"db":1});
 
client.on("error", function(error) {
  console.error(error);
});

for (var attr in data) {
  client.set(attr,JSON.stringify(data[attr]))
}

