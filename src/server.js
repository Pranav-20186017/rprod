// load the things we need
var express = require('express');
var bodyParser = require("body-parser");
var svgCaptcha = require('svg-captcha');
const redis = require("redis");

// Express Config
var app = express();
app.use(express.static('public'))
//app.set('views', './views');

var js_mysql,actual,itr;


app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());


app.set('view engine', 'ejs');


app.get('/', function(req, res) {
	// console.log(req.connection.remoteAddress)
	console.log('--------------------------');
	console.log('GET req made to "/"');
	/*********************/

	//Check if req is coming because of captcha
	var captchaError = req.query.captchaError == 'true';

	//Check if req is coming because of captcha
	var htnoError = req.query.htnoError == 'true';

	// Normal req 
	var captcha = svgCaptcha.create();
	var svgTag = captcha.data;
	console.log(captcha.text)

	res.set({'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache', 'Expires': '0'});

	res.render('index', {
		data: svgTag,
		captchaTrue: captcha.text,
		errorStatus: captchaError,
		htError: htnoError
	});

	console.log('--------------------------');
});


app.post('/form', function(req, res) {
	// console.log(req.connection.remoteAddress)	
	// console.log(JSON.stringify(req.headers));
	console.log('POST req made to "/form"');
	console.log(req.body);
	/*******************************/

	if (req.body.captcha != req.body.captchaTrue) {
		
		res.redirect('/?captchaError=true')
	} 
	else {
		
		const client = redis.createClient({"host":"ec2-13-233-93-126.ap-south-1.compute.amazonaws.com","port":6379,"db":1});
		
		var key = req.body.htno;
		
		client.get(key, function(err, reply) {
			// var fmt = JSON.parse(reply);
			// console.log(fmt);
			console.log('-----------------------------');
			console.log('Client Get Error is ' + err);
			console.log('-----------------------------');

			console.log('-----------------------------');
			console.log('Reply: ' + reply);
			console.log('-----------------------------');

			if (reply == null){
				res.redirect('/?htnoError=true')
			}

			else {
				res.set({'Cache-Control': 'no-cache, no-store, must-revalidate','Pragma': 'no-cache', 'Expires': '0'});
				// var itr = fmt;

				res.render('res', {reply:JSON.parse(reply)})
			}	

		  });

		client.quit(function (err) {
			console.log('Client Quit error is ' + err);
		})
	}
});

app.listen(3000 , '0.0.0.0', function(){
console.log('server listening on port 3000');
});
