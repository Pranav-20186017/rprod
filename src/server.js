// load the things we need
var express = require('express');
var bodyParser = require("body-parser");
var svgCaptcha = require('svg-captcha');
const redis = require("redis");
const client = redis.createClient({"host":"localhost","port":6379,"db":1});

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
		// var con = mysql.createConnection({
		// 	 host: "dbserver",
		// 	//host: "localhost",
		// 	user: "root",
		// 	// password: "",
		// 	password: "_sprx77_",
		// 	database: "ks"
		// });
		// con.connect(function(err) {
		// 	console.log(err)
		// 	console.log("Connected!");
		// });
		// var id = req.body.htno;
		// results = con.query('SELECT * FROM `marks` WHERE `id` = ?', id, function(error, results, fields) {
			
		// 	js_mysql = JSON.stringify(results);
		// 	actual = JSON.parse(js_mysql)
		// 	itr = actual["0"]
		// 	res.set({'Cache-Control': 'no-cache, no-store, must-revalidate','Pragma': 'no-cache', 'Expires': '0'});
		// 	res.render('res', {itr:itr})	
		// 	});			
		// 	client.quit();
		var key = req.body.htno;
		client.get(key, function(err, reply) {
			//console.log(reply);
			var fmt = JSON.parse(reply);
			console.log(fmt);
			res.set({'Cache-Control': 'no-cache, no-store, must-revalidate','Pragma': 'no-cache', 'Expires': '0'});
			var itr = fmt;
			res.render('res', {itr:itr})	

		  });
	}
});

app.listen(3000 , '0.0.0.0', function(){
console.log('server listening on port 3000');
});
