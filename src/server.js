// load the things we need
var express = require('express');
var bodyParser = require("body-parser");
var svgCaptcha = require('svg-captcha');
const redis = require("redis");
var cookieParser = require('cookie-parser');
var compression = require('compression');
var morgan = require('morgan');
var uuid = require('node-uuid')

morgan.token('id', function getId(req) {
    return req.id
})

morgan.token('req_size', function getReqSize(req) {
    return req.socket.bytesRead.toString() + " " + "bytes";
})

var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })

var parseForm = bodyParser.urlencoded({ extended: false })
// Express Config
var app = express();
app.use(express.static('public'));
app.use(cookieParser())
app.use(compression())
//logging config
app.use(assignId);
app.use(morgan(':id - :remote-addr  :remote-user  [:date[clf]] - ":method :url HTTP/:http-version" - :req_size - :status  :res[content-length] - :response-time ms  ":referrer" - ":user-agent"', 'pretty'));
// For parsing request bodies
// app.use(bodyParser.urlencoded({
//     extended: false
// }));
app.use(bodyParser.json());
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
app.get('/', csrfProtection, function (req, res) {
    // Check if req is coming because of captcha
    var captchaError = req.query.captchaError == 'true';

    // Check if req is coming because of htno
    var htnoError = req.query.htnoError == 'true';

    // Check if req is coming because of backend
    var backendError = req.query.backendError == 'true';


    // Normal req 
    var captcha = svgCaptcha.create();
    var svgTag = captcha.data;

    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 'Expires': '0'
    });

    // Set statuses and render form
    res.render('index_bootstrap', {
        data: svgTag,
        captchaTrue: captcha.text,
        errorStatus: captchaError,
        htError: htnoError,
        backendError: backendError,
        csrfToken: req.csrfToken()
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
app.post('/form', parseForm, csrfProtection, function (req, res) {
    /*******************************/

    // Check for captcha error
    if (req.body.captcha.trim() != req.body.captchaTrue)
        res.redirect('/?captchaError=true');

    else {
        // Create Redis client
        const client = redis.createClient({ "host": "redis", "port": 6379, "db": 0 });

        var key = req.body.htno.trim();

        client.get(key, function (err, reply) {

            console.error('Client Get Error is ' + err);
            if (err != null) {
                res.redirect('/?backendError=true');
                return;
            }

            console.error('Reply: ' + reply);

            if (reply == null) {
                res.redirect('/?htnoError=true')
            }

            else {
                // To make the server stateless
                res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                res.render('res_bs', { reply: JSON.parse(reply) })
            }

        }); //client get 

        client.quit(function (err) {
            console.error('Client Quit error is ' + err);
        })
    } // correct captcha - else
});

app.get('/results_test', function (req, res) {
    /*******************************/
    // Create Redis client
    const client = redis.createClient({ "host": "redis", "port": 6379, "db": 0 });
    var key = req.query.htno.trim();

    client.get(key, function (err, reply) {

        console.error('Client Get Error is ' + err);
        if (err != null) {
            res.redirect('/?backendError=true');
            return;
        }

        console.error('Reply: ' + reply);

        if (reply == null) {
            res.redirect('/?htnoError=true')
        }

        else {
            // To make the server stateless
            res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
            res.render('res_bs', { reply: JSON.parse(reply) })
        }

    }); //client get 

    client.error(function (err) {
        console.log('Client Quit error is ' + err);
    })
});

// Start the server
app.listen(3000, '0.0.0.0', function () {
    console.log('server listening on port 3000');
});

//uuid for logs to the server
function assignId(req, res, next) {
    req.id = uuid.v4()
    next()
}