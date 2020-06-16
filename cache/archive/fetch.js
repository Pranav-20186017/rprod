const redis = require("redis");
const client = redis.createClient({"host":"localhost","port":6379,"db":1});
 
client.on("error", function(error) {
  console.error(error);
});

var key = "123456"
client.get(key, function(err, reply) {
  //console.log(reply);
  var fmt = JSON.parse(reply);
  console.log(fmt);
});
  client.quit()
