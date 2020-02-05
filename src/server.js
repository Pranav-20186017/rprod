// load the things we need
var express = require('express');
var bodyParser = require("body-parser");
var svgCaptcha = require('svg-captcha');
var mysql = require('mysql');


var captchaText = '';
var app = express();
app.use(express.static('public'))
var js_mysql,actual,itr;
function getCaptcha() {
	var captcha = svgCaptcha.create();
	captchaText = captcha.text;
	return captcha;
}

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');


app.get('/', function(req, res) {
	console.log(req.connection.remoteAddress)
	console.log(JSON.stringify(req.headers));
	var svgTag = getCaptcha().data;
	res.set({'Cache-Control': 'no-cache, no-store, must-revalidate','Pragma': 'no-cache', 'Expires': '0'});
	res.render('index', {
		data: svgTag,
		errorStatus: false,
	});

});

app.post('/form', function(req, res) {
	console.log(req.connection.remoteAddress)	
	console.log(JSON.stringify(req.headers));
	var error = false;
	var data = null;
	if (req.body.captcha != captchaText) {
		error = true;
		data = getCaptcha().data;
		res.render('index', {
			data:data,
			errorStatus:error
		})
	} else {
		var con = mysql.createConnection({
			host: "dbserver",
			user: "root",
			password: "root",
			database: "ks"
		});
		con.connect(function(err) {
			console.log(err)
			console.log("Connected!");
		});
		var id = req.body.htno;
		results = con.query('SELECT * FROM `marks` WHERE `id` = ?', id, function(error, results, fields) {
			
			js_mysql = JSON.stringify(results);
			actual = JSON.parse(js_mysql)
			itr = actual["0"]
			res.set({'Cache-Control': 'no-cache, no-store, must-revalidate','Pragma': 'no-cache', 'Expires': '0'});
			res.render('res', {itr:itr})	
			});			
			con.end();
	}
});

app.listen(3000 , '0.0.0.0', function(){
console.log('server listening on port 3000');
});
