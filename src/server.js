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
// console.log(real_data[3].title);

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

// set the view engine to ejs
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
	//console.log(req)
	console.log(req.connection.remoteAddress)	
	console.log(JSON.stringify(req.headers));
	// var id = req.body.data;
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
		//var vals = []
		con.connect(function(err) {
			console.log(err)
			console.log("Connected!");
		});
		var id = req.body.htno;
		results = con.query('SELECT * FROM `marks` WHERE `id` = ?', id, function(error, results, fields) {
			//console.log(error);
			//console.log(results);
			//error will be an Error if one occurred during the query
			//results will contain the results of the query
			//Object.keys(results).forEach(function(key) {
				//var result = results[key];
				//Object.keys(result).forEach(function(k) {
				//	console.log(result[k])
			//		vals.push(result[k])
			//	});
			js_mysql = JSON.stringify(results);
			actual = JSON.parse(js_mysql)
			itr = actual["0"]
			res.set({'Cache-Control': 'no-cache, no-store, must-revalidate','Pragma': 'no-cache', 'Expires': '0'});
			res.render('res', {itr:itr})	
			});
			// fields will contain information about the returned results fields (if any)
			
	/**	if (vals.length > 0) {
				console.log(vals);
			}
			else if(vals.length == 0) {
				console.log("wrong id");
			} **/
			con.end();
	}
	//res.render('res', {itr:itr})
});

app.listen(3000 , '0.0.0.0', function(){
console.log('server listening on port 3000');
});
