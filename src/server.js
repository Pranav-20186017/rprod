// load the things we need
var express = require('express');
var bodyParser = require("body-parser");
var svgCaptcha = require('svg-captcha');
var compression = require('compression');
const redis = require("redis");
const csurf = require('csurf');
const cookieParser = require('cookie-parser');

// Express Config
var app = express();
app.use(express.static('public'));
app.use(compression())
//adding middleware for csrf
const csrfMiddleware = csurf({
    cookie: true
  });
// For parsing request bodies
//extended set to true for csrf will need to change in future
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);
app.set('view engine', 'ejs');

/*
Main Route
- Checks for invalid captcha or HT No.
- Serves the entry form located at ./views/index.ejs
  or ./views/index_bootstrap.js 
+--------------------------------------+
|                                      |
| Set error statuses on outgoing data  |
|                +                     |
|                v                     |
| Create Captcha (Customize if needed) |
|                +                     |
|                v                     |
|           Render Form                |
|                                      |
+--------------------------------------+
*/
app.get('/', function(req, res) {
    console.log('--------------------------');
    console.log('GET' + ' req made to "/" from ' 
        + req.connection.remoteAddress);
    // Check if req is coming because of captcha
    var captchaError = req.query.captchaError == 'true';

    // Check if req is coming because of htno
    var htnoError = req.query.htnoError == 'true';

    // Check if req is coming because of backend
    var backendError = req.query.backendError == 'true';


    // Normal req 
    var captcha = svgCaptcha.create();
    var svgTag = captcha.data;
    var csrf = req.csrfToken()
    console.log('Captcha: ' + captcha.text);

    res.set({'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache', 'Expires': '0'});

    // Set statuses and render form
    res.render('index_bootstrap', {
        data: svgTag,
        captchaTrue: captcha.text,
        errorStatus: captchaError,
        htError: htnoError,
        backendError: backendError,
        csrf: csrf
    });

});

/*
Form route
- Redirects in case of captcha or HTNO issues
- Serves results otherwise
+----------------------------------------------------------+
|                                                          |
|                     Request                              |
|                        +                                 |
|                        |                                 |
|            +-----------+----------------+                |
|            v                            v                |
|  If the captcha is wrong            Get Data from redis  |
|            +                            +                |
|            |                            |                |
|            v                            v                |
|  Redirect to main route             Render results page  |
|                                                          |
|                                                          |
+----------------------------------------------------------+
*/
app.post('/form', function(req, res) {

    console.log('--------------------------');
    console.log('POST req made to "/" from ' 
        + req.connection.remoteAddress);

    console.log(req.body);
    /*******************************/

    // Check for captcha error
    if (req.body.captcha.trim() != req.body.captchaTrue)
        res.redirect('/?captchaError=true');

    else {
        // Create Redis client
        const client = redis.createClient({"host":"redis","port":6379,"db":0});
        
        var key = req.body.htno.trim();
        
        client.get(key, function(err, reply) {

            console.log('Client Get Error is ' + err);
            if (err != null) {
                res.redirect('/?backendError=true');
                return;
            }

            console.log('Reply: ' + reply);

            if (reply == null){
                res.redirect('/?htnoError=true')
            }

            else {
                // To make the server stateless
                res.set({'Cache-Control': 'no-cache, no-store, must-revalidate','Pragma': 'no-cache', 'Expires': '0'});
                res.render('res_bs', {reply:JSON.parse(reply)})
            }   

          }); //client get 

        client.quit(function (err) {
            console.log('Client Quit error is ' + err);
        })
    } // correct captcha - else
}); 

app.get('/results_test', function(req, res) {

    console.log('--------------------------');
    console.log('GET req made to "/results_test" from ' 
        + req.connection.remoteAddress);

    /*******************************/
    // Create Redis client
    const client = redis.createClient({"host":"redis","port":6379,"db":0});
    var key = req.query.htno.trim();
        
    client.get(key, function(err, reply) {

        console.log('Client Get Error is ' + err);
        if (err != null) {
            res.redirect('/?backendError=true');
            return;
        }

        console.log('Reply: ' + reply);

        if (reply == null){
            res.redirect('/?htnoError=true')
        }

        else {
            // To make the server stateless
            res.set({'Cache-Control': 'no-cache, no-store, must-revalidate','Pragma': 'no-cache', 'Expires': '0'});
            res.render('res_bs', {reply:JSON.parse(reply)})
            }   

          }); //client get 

        client.quit(function (err) {
            console.log('Client Quit error is ' + err);
        })
});

// Start the server
app.listen(3000 , '0.0.0.0', function(){
    console.log('server listening on port 3000');
});
